#!/usr/bin/env node
/**
 * fetch-font-catalog.mjs — 抓取「中文网字计划」的字体目录（jsDelivr 版）
 *
 * 对 packages/* 的每个 NPM 包查询 jsDelivr，产出：
 *   包名 | 版本 | 字重列表 | FontFamilyName | CopyrightNotice | CDN 链接
 *
 * 用法：node tools/fetch-font-catalog.mjs [--out=tools/font-catalog.json]
 *
 * 备注：unpkg 对并发请求会反爬返回 404，故改用 jsDelivr（国内访问也更好）。
 */
import fs from 'node:fs'

const OUT = (process.argv.find(a => a.startsWith('--out=')) ?? '').split('=')[1] || 'tools/font-catalog.json'
const SCOPE = '@chinese-fonts'

// 80 个包名（来自仓库 packages/ 目录，2026-10-09）
const PKGS = `GuanKiapTsingKhai LxgwNeoZhiSong ToneOZ-Pinyin-Kai ToneOZ-Pinyin-WenKai ToneOZ-RadicalZ-Kai ToneOZ-Tsuipita XiaoheSimplify blbbsxt bwckkt bxzlzt cef cezkzdbs cqscbbt crgkk cubic dyh dymh dyzgt fbdzt fhst hcqyt hldqjt hlxsjt hqzmt hwmct hyqzp jhlst jnjj jpdzt jxzk jyhpws kksjt lxgwmanhei lxgwwenkai lxgwwenkaibright lywkpmydb maple-mono-cn mksjh mkwtyt mkzyt moon-stars-kai mzxst pfgzt pfljhfyt pfljhlyt pfmmd pmzdxxt qtbfsxt qxs rmjzqpybxs rzjkxzdmh rzjryzzk scjssh sft stdgt stmdxf syftjkt sypxzs syst the-write-right-font tjl xiaolai xuandongkaishu yfxy yidianyan yozai yqt ysbth ysbzt ysfxt ysyrxk yzgcxst yzklct zhbtt zjmc zkxw zlmyz zqfs zqzmxs zzqxmxht`.split(/\s+/)

async function jget(url, headers = {}) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { headers, redirect: 'follow' })
      if (!r.ok && r.status !== 206) throw new Error('HTTP ' + r.status)
      return await r.text()
    } catch (e) {
      if (i === 2) throw e
      await new Promise(res => setTimeout(res, 1500 * (i + 1)))
    }
  }
}

async function probe(pkg) {
  // 注意：jsDelivr 的 data API 不支持 @latest 别名，须先取版本列表
  const info = JSON.parse(await jget(`https://data.jsdelivr.com/v1/packages/npm/${SCOPE}/${pkg}`))
  const version = info.tags.latest
  const tree = JSON.parse(await jget(`https://data.jsdelivr.com/v1/packages/npm/${SCOPE}/${pkg}@${version}?structure=flat`))
  const files = tree.files.map(f => f.name)
  // 字重子包 = /dist/<X>/ 目录名
  const weights = [...new Set(files.filter(f => f.startsWith('/dist/')).map(f => f.split('/')[2]))]
  // 找一个 result.css（优先 Regular）
  const cssPath = files.filter(f => f.endsWith('/result.css'))
  const pick = cssPath.find(f => /Regular|regular/.test(f)) || cssPath[0]
  let family = '', copyright = ''
  if (pick) {
    const css = await jget(`https://cdn.jsdelivr.net/npm/${SCOPE}/${pkg}@${version}${pick}`, { Range: 'bytes=0-1200' })
    const mf = css.match(/FontFamilyName\s+([^\r\n]+)/)
    if (mf) family = mf[1].trim()
    const mc = css.match(/CopyrightNotice\s+([\s\S]{0,220}?)(?:\r?\n\w+\s+\w+|\r?\n\/\*|$)/)
    if (mc) copyright = mc[1].replace(/\s+/g, ' ').trim().slice(0, 200)
  }
  return { pkg, version, weights, family, copyright, cssDir: pick ? pick.replace('/result.css', '') : '' }
}

async function run() {
  const results = []
  const queue = [...new Set(PKGS)].filter(Boolean)
  const workers = Array.from({ length: 5 }, async () => {
    while (queue.length) {
      const pkg = queue.shift()
      try {
        const r = await probe(pkg)
        results.push(r)
        console.log(`✓ ${pkg.padEnd(22)} v${String(r.version).padEnd(8)} ${String(r.weights.length).padStart(2)}字重  ${r.family}`)
      } catch (e) {
        results.push({ pkg, error: e.message })
        console.log(`✗ ${pkg.padEnd(22)} ${e.message}`)
      }
    }
  })
  await Promise.all(workers)
  results.sort((a, b) => a.pkg.localeCompare(b.pkg))
  fs.writeFileSync(OUT, JSON.stringify(results, null, 2))
  const ok = results.filter(r => !r.error).length
  console.log(`\n完成：成功 ${ok} / 失败 ${results.length - ok} → ${OUT}`)
}

run()
