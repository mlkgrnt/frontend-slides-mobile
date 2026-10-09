#!/usr/bin/env node
/**
 * render.mjs — 移动端卡片渲染器（零第三方依赖）
 *
 * 把 deck.html 渲染成：一组 PNG（每卡一张）+ 一个矢量 PDF。
 * 只依赖本机已安装的 Chrome / Chromium / Edge。
 *
 * 用法：
 *   node render.mjs <deck.html> [选项]
 *
 * 选项：
 *   --out-dir=<目录>    PNG 输出目录（默认 <html 同目录>/cards）
 *   --pdf=<文件>        PDF 输出路径（默认 <html 同目录>/<同名>.pdf）
 *   --width=<px>        画布宽（默认 1080）
 *   --height=<px>       画布高（默认 1440）
 *   --scale=<n>         像素倍率，超采样用（默认 1；2 = 2160×2880）
 *   --png-only          只出 PNG
 *   --pdf-only          只出 PDF
 *   --cards=1,5         只重渲染指定序号的 PNG（PDF 仍为全量；迭代调试用）
 *   --timeout=<秒>      单张截图超时（默认 90）
 *   --quiet             安静模式
 */

import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

// ─────────────────────────── 参数解析 ───────────────────────────
const argv = process.argv.slice(2)
if (argv.length === 0 || argv.includes('--help') || argv.includes('-h')) {
  console.log(`用法: node render.mjs <deck.html> [--out-dir=cards] [--pdf=deck.pdf] [--width=1080] [--height=1440] [--scale=1] [--png-only|--pdf-only] [--quiet]`)
  process.exit(0)
}

const opts = {
  html: null,
  outDir: null,
  pdf: null,
  width: 1080,
  height: 1440,
  scale: 1,
  png: true,
  pdf_ok: true,
  timeout: 90,
  quiet: false,
}
for (const a of argv) {
  if (!a.startsWith('--')) { opts.html = a; continue }
  const [k, v] = a.split('=')
  if (k === '--out-dir') opts.outDir = v
  else if (k === '--pdf') opts.pdf = v
  else if (k === '--width') opts.width = parseInt(v, 10)
  else if (k === '--height') opts.height = parseInt(v, 10)
  else if (k === '--scale') opts.scale = parseFloat(v)
  else if (k === '--timeout') opts.timeout = parseInt(v, 10)
  else if (k === '--cards') opts.cards = v.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
  else if (k === '--png-only') opts.pdf_ok = false
  else if (k === '--pdf-only') opts.png = false
  else if (k === '--quiet') opts.quiet = true
}

if (!opts.html) { console.error('✗ 缺少 deck.html 路径'); process.exit(1) }
const htmlPath = path.resolve(opts.html)
if (!fs.existsSync(htmlPath)) { console.error(`✗ 文件不存在: ${htmlPath}`); process.exit(1) }

const htmlDir = path.dirname(htmlPath)
const baseName = path.basename(htmlPath, path.extname(htmlPath))
const outDir = path.resolve(opts.outDir ?? path.join(htmlDir, 'cards'))
const pdfPath = path.resolve(opts.pdf ?? path.join(htmlDir, baseName + '.pdf'))
const cacheDir = path.join(htmlDir, '_render-cache')
const profileDir = path.join(cacheDir, 'chrome-profile')
const t0 = Date.now()

const log = (...a) => { if (!opts.quiet) console.log(...a) }

// ─────────────────────────── 浏览器定位 ───────────────────────────
function findBrowser() {
  const cands = []
  if (process.env.CHROME_PATH) cands.push(process.env.CHROME_PATH)
  const home = os.homedir()
  if (process.platform === 'win32') {
    cands.push(
      'C:/Program Files/Google/Chrome/Application/chrome.exe',
      'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
      path.join(home, 'AppData/Local/Google/Chrome/Application/chrome.exe'),
      'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
      'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    )
  } else if (process.platform === 'darwin') {
    cands.push(
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
    )
  } else {
    cands.push('/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge')
  }
  // Playwright 缓存目录
  const pwRoots = process.platform === 'win32'
    ? [path.join(home, 'AppData/Local/ms-playwright')]
    : [path.join(home, '.cache/ms-playwright')]
  for (const root of pwRoots) {
    try {
      for (const d of fs.readdirSync(root)) {
        if (!d.startsWith('chromium-')) continue
        const rel = process.platform === 'win32'
          ? ['chrome-win64', 'chrome.exe']
          : process.platform === 'darwin'
            ? ['chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium']
            : ['chrome-linux', 'chrome']
        const p = path.join(root, d, ...rel)
        if (fs.existsSync(p)) cands.push(p)
      }
    } catch { /* 目录不存在则跳过 */ }
  }
  for (const c of cands) {
    try { if (c && fs.existsSync(c)) return c } catch { /* skip */ }
  }
  console.error('✗ 找不到 Chrome/Chromium/Edge。')
  console.error('  解决：安装 Chrome，或设置环境变量 CHROME_PATH 指向浏览器可执行文件。')
  process.exit(1)
}

// ─────────────────────────── 工具函数 ───────────────────────────
function pngSize(file) {
  const b = fs.readFileSync(file)
  if (b.length < 24) return null
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), bytes: b.length }
}

function countPdfPages(file) {
  const s = fs.readFileSync(file).toString('latin1')
  const m = s.match(/\/Type\s*\/Page(?![a-zA-Z])/g)
  return m ? m.length : 0
}

function pad2(n) { return String(n).padStart(2, '0') }

/** 收集卡片序号（从 data-index 属性），保证只渲染真实存在的卡 */
function collectCardIndexes(html) {
  const nums = new Set()
  for (const m of html.matchAll(/data-index\s*=\s*"(\d+)"/g)) nums.add(parseInt(m[1], 10))
  return [...nums].sort((a, b) => a - b)
}

function run(browser, args, timeoutMs) {
  const r = spawnSync(browser, args, {
    timeout: timeoutMs,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  })
  return { status: r.status, stdout: r.stdout?.toString() ?? '', stderr: r.stderr?.toString() ?? '', error: r.error }
}

function browserArgs(profile, extra) {
  return [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${profile}`,
    '--virtual-time-budget=8000',
    ...extra,
  ]
}

// ─────────────────────────── 主流程 ───────────────────────────
const browser = findBrowser()
log(`浏览器: ${browser}`)

const html = fs.readFileSync(htmlPath, 'utf8')
const cards = collectCardIndexes(html)
if (cards.length === 0) {
  console.error('✗ 在 HTML 里找不到任何 data-index 卡片（确认卡片是 <section class="card" data-index="N">）')
  process.exit(1)
}
log(`卡片数: ${cards.length}  →  ${cards.map(pad2).join(', ')}${opts.cards ? `（本轮只重渲染: ${opts.cards.map(pad2).join(', ')}）` : ''}`)

const fileUrl = pathToFileURL(htmlPath).href
const px = { w: opts.width * opts.scale, h: opts.height * opts.scale }
let failures = 0

// ── 1. PNG 截图 ──
const shotFiles = []
if (opts.png) {
  const targets = opts.cards ? cards.filter(n => opts.cards.includes(n)) : cards
  fs.mkdirSync(outDir, { recursive: true })
  // 清理旧序号图（只删本次要渲染的两位数文件，且是本工具命名模式）
  for (const f of fs.readdirSync(outDir)) {
    if (/^\d{2}\.png$/.test(f) && targets.includes(parseInt(f, 10))) fs.unlinkSync(path.join(outDir, f))
  }
  fs.mkdirSync(profileDir, { recursive: true })

  log(`\n渲染 PNG（${px.w}×${px.h}）→ ${outDir}`)
  for (let i = 0; i < targets.length; i++) {
    const n = targets[i]
    const out = path.join(outDir, pad2(n) + '.png')
    const args = browserArgs(profileDir, [
      `--window-size=${opts.width},${opts.height}`,
      `--force-device-scale-factor=${opts.scale}`,
      `--screenshot=${out}`,
      `${fileUrl}?p=${n}`,
    ])
    process.stdout.write(`  [${i + 1}/${targets.length}] ${pad2(n)}.png ... `)
    let r = run(browser, args, opts.timeout * 1000)
    // 重试一次（可能是 profile 偶发锁）
    if (!fs.existsSync(out) || fs.statSync(out).size < 2000) {
      r = run(browser, args, opts.timeout * 1000)
    }
    if (fs.existsSync(out)) {
      const info = pngSize(out)
      const ok = info && info.w === px.w && info.h === px.h
      console.log(ok ? `✓ ${info.w}×${info.h} ${(info.bytes / 1024).toFixed(0)}KB` : `⚠ 尺寸异常 ${info ? info.w + '×' + info.h : '读不出'}`)
      if (!ok) failures++
      shotFiles.push(out)
    } else {
      console.log('✗ 失败（' + (r.stderr.split('\n').filter(Boolean).slice(-1)[0] || '未知错误') + '）')
      failures++
    }
  }
}

// ── 2. PDF ──
let pdfOk = false
if (opts.pdf_ok) {
  fs.mkdirSync(path.dirname(pdfPath), { recursive: true })
  log(`\n生成 PDF → ${pdfPath}`)
  const args = browserArgs(profileDir, [
    '--no-pdf-header-footer',
    `--print-to-pdf=${pdfPath}`,
    `${fileUrl}?print=1`,
  ])
  run(browser, args, opts.timeout * 1000 * 2)
  if (fs.existsSync(pdfPath) && fs.statSync(pdfPath).size > 1000) {
    const pages = countPdfPages(pdfPath)
    const mb = (fs.statSync(pdfPath).size / 1048576).toFixed(2)
    pdfOk = pages === cards.length
    console.log(`  ${pdfOk ? '✓' : '⚠'} ${pages} 页 / ${cards.length} 张卡 · ${mb}MB`)
    if (!pdfOk) failures++
  } else {
    console.log('  ✗ PDF 生成失败')
    failures++
  }
}

// ── 3. 报告 ──
const secs = ((Date.now() - t0) / 1000).toFixed(1)
log(`\n──── 渲染完成（${secs}s）────`)
if (opts.png) {
  const totalKB = shotFiles.reduce((s, f) => s + (fs.existsSync(f) ? fs.statSync(f).size : 0), 0)
  log(`  PNG: ${shotFiles.length} 张 · ${(totalKB / 1024 / 1024).toFixed(2)}MB · ${outDir}`)
}
if (opts.pdf_ok) log(`  PDF: ${path.basename(pdfPath)}${pdfOk ? '（' + cards.length + ' 页）' : '（异常）'}`)
log(`  （HTML 为渲染源文件，可修改后重渲染；缓存目录 _render-cache/ 可随时删除）`)

process.exit(failures > 0 ? 1 : 0)
