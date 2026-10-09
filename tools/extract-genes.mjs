// 从 upstream 的 34 个 bold 模板 design.md 提取设计基因（YAML frontmatter）
import fs from 'node:fs'
import path from 'node:path'

const base = 'upstream/bold-template-pack/templates'
const dirs = fs.readdirSync(base).sort()
const genes = []

for (const d of dirs) {
  const p = path.join(base, d, 'design.md')
  if (!fs.existsSync(p)) continue
  const raw = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n')
  const fm = raw.match(/^---\n([\s\S]*?)\n---/)
  const body = fm ? fm[1] : ''

  const name = ((body.match(/^name:\s*(.+)$/m) || [])[1] || d).trim()
  const desc = ((body.match(/^description:\s*(.+)$/m) || [])[1] || '').trim()

  // colors 顶层块：从 "\ncolors:\n" 到下一个顶层 key
  const colorsBlock = (body.match(/\ncolors:\n([\s\S]*?)(?=\n[a-z][a-z-]*:)/) || [])[1] || ''
  const colors = {}
  for (const line of colorsBlock.split('\n')) {
    const m = line.match(/^\s{2}([a-z0-9_-]+):\s*"?([^"\n]+)"?\s*$/i)
    if (m) colors[m[1]] = m[2].trim()
  }

  const fonts = [...new Set([...body.matchAll(/fontFamily:\s*"([^"]+)"/g)].map(m => m[1]))]

  genes.push({ slug: d, name, desc: desc.slice(0, 240), colors, fonts })
}

fs.writeFileSync('_poc/bold-genes.json', JSON.stringify(genes, null, 2))
console.log('提取完成:', genes.length, '个模板')
console.log('字体覆盖情况:')
for (const g of genes) {
  console.log(' ', g.slug.padEnd(20), '| colors:', String(Object.keys(g.colors).length).padStart(2), '| fonts:', g.fonts.length, '|', g.fonts.join(' / ').slice(0, 90))
}
