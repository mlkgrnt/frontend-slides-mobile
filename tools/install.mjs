#!/usr/bin/env node
/**
 * install.mjs — 把 frontend-slides-mobile skill 安装到本机各 agent 环境
 *
 * 用法（在仓库根目录运行）：
 *   node tools/install.mjs                # 安装到 WorkBuddy + DeepSeek Harness（复制模式）
 *   node tools/install.mjs --link         # 开发模式：创建目录链接，改源码即时生效
 *   node tools/install.mjs --only=dsh     # 只装指定目标（workbuddy | dsh）
 *   node tools/install.mjs --dry-run      # 只做检查，不实际写入
 *
 * 说明：
 * - 两套环境都遵循「<skills 根>/<skill 名>/SKILL.md」的目录束约定，
 *   SKILL.md 的 frontmatter 只需 name + description（两端通用）。
 * - 目标已存在时，旧目录会被重命名为 <名字>.bak-<时间戳>（不删除，安全回退）。
 * - --link 模式依赖目录软化链接（Windows 用 junction，无需管理员权限）。
 *   注意：链接模式下移动/删除本仓库会导致已安装的 skill 失效，届时重装即可。
 */

import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const src = path.join(repoRoot, 'skill')
const skillName = 'frontend-slides-mobile'

// ── 参数 ──
const args = process.argv.slice(2)
const opt = {
  link: args.includes('--link'),
  dryRun: args.includes('--dry-run'),
  only: (args.find(a => a.startsWith('--only=')) ?? '').split('=')[1] || null,
}

// 本机已知的 skills 根目录（可按需增删）
const targets = [
  { key: 'workbuddy', label: 'WorkBuddy', dir: path.join(os.homedir(), '.workbuddy', 'skills') },
  { key: 'dsh', label: 'DeepSeek Harness', dir: path.join(os.homedir(), '.dsh', 'skills') },
]

// ── 1) 源自检 ──
function selfCheck() {
  const errs = []
  const skillMd = path.join(src, 'SKILL.md')
  if (!fs.existsSync(skillMd)) return [`SKILL.md 不存在：${skillMd}`]
  const md = fs.readFileSync(skillMd, 'utf8')
  const fm = md.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!fm) errs.push('SKILL.md 缺少 frontmatter（--- 包裹的头部）')
  else {
    const name = (fm[1].match(/^name:\s*(.+)$/m) ?? [])[1]
    const desc = (fm[1].match(/^description:\s*(.+)$/m) ?? [])[1]
    if (!name) errs.push('frontmatter 缺少 name 字段')
    if (name && name.trim() !== skillName) errs.push(`frontmatter name="${name.trim()}" 与目录名 ${skillName} 不一致`)
    if (!desc || !desc.trim()) errs.push('frontmatter 缺少 description（两套环境都要求非空）')
  }
  for (const need of ['scripts/render.mjs', 'assets/deck-template.html', 'references/canvas-and-type.md']) {
    if (!fs.existsSync(path.join(src, need))) errs.push(`缺少支持文件：${need}`)
  }
  return errs
}

// ── 2) 安装单个目标 ──
function installOne(t) {
  const dest = path.join(t.dir, skillName)
  const status = { target: t.label, dest, ok: false, action: '', note: '' }

  if (opt.dryRun) { status.action = 'dry-run'; status.ok = true; return status }

  fs.mkdirSync(t.dir, { recursive: true })

  // 旧版本备份（改名而非删除）
  if (fs.existsSync(dest)) {
    const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)
    const bak = `${dest}.bak-${stamp}`
    fs.renameSync(dest, bak)
    status.note = `旧版本已备份为 ${path.basename(bak)}`
  }

  if (opt.link) {
    const type = process.platform === 'win32' ? 'junction' : 'dir'
    fs.symlinkSync(src, dest, type)
    status.action = 'linked'
  } else {
    fs.cpSync(src, dest, {
      recursive: true,
      filter: (s) => !s.includes('_render-cache') && !s.includes('node_modules'),
    })
    status.action = 'copied'
  }

  // 验证
  const check = path.join(dest, 'SKILL.md')
  status.ok = fs.existsSync(check) && fs.readFileSync(check, 'utf8').includes('frontend-slides-mobile')
  return status
}

// ── 主流程 ──
console.log(`\nfrontend-slides-mobile 安装器  ${opt.link ? '（链接模式）' : '（复制模式）'}${opt.dryRun ? '  [dry-run]' : ''}\n`)
console.log(`源: ${src}`)

const errs = selfCheck()
if (errs.length) {
  console.error('\n✗ 源自检未通过：')
  for (const e of errs) console.error('  - ' + e)
  process.exit(1)
}
console.log('✓ 源自检通过（frontmatter / 支持文件）\n')

const picked = targets.filter(t => !opt.only || t.key === opt.only)
if (!picked.length) {
  console.error(`✗ --only=${opt.only} 不匹配（可选：${targets.map(t => t.key).join(' | ')}）`)
  process.exit(1)
}

let failed = 0
for (const t of picked) {
  try {
    const r = installOne(t)
    if (r.ok) {
      console.log(`✓ ${r.target}`)
      console.log(`    ${r.action === 'linked' ? '链接' : r.action === 'copied' ? '复制' : '检查'} → ${r.dest}`)
      if (r.note) console.log(`    ${r.note}`)
    } else {
      failed++
      console.log(`✗ ${r.target} — 安装后验证未通过`)
    }
  } catch (e) {
    failed++
    console.log(`✗ ${r.target} — ${e.message}`)
  }
}

console.log('\n完成。使用方式：')
console.log('  在任何会话里说「把这篇文章做成知识卡片」即可触发；')
console.log(`  渲染脚本：node <skills 目录>/${skillName}/scripts/render.mjs <deck.html>`)
if (opt.link) console.log('  （链接模式：修改本仓库 skill/ 下的文件会即时生效）')
process.exit(failed ? 1 : 0)
