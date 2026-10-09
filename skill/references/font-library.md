# 中文字体库（开源可商用 · 精选 15 款）

本文件是**「字体选择」环节的唯一数据源**。所有字体经过三重筛选：
**许可明确** · **CDN 可加载（不内置字体包）** · **气质适合卡片排版**。

字体**不随 skill 分发**：运行时从 CDN 按需加载（首次渲染联网下载，之后浏览器缓存）。
加载管线已实测：与 Google Fonts 同一套机制，`render.mjs` 的缓存目录（`_render-cache/`）自动保留。

---

## 0. 收录标准与排除项（先读）

### 收录
- **A 类 · 标准开源许可（SIL OFL 等）**：最稳，可商用、可嵌入、可再分发。
- **B 类 · 作者明文免费商用声明**：**必须**明文允许「印刷 / 显示 / **嵌入电子文档**」——
  我们的 PDF 会嵌入字体子集，这一步要经得起看。

### 排除（有坑，不要用）
- ❌ **企业品牌字体**（MiSans / OPPO Sans / HarmonyOS Sans / 阿里普惠 / 抖音美好体…）：
  非开源，条款由企业单方声明、可能随时变更，且常带场景限制。
- ❌ **「免费商用但限制嵌入」的字体**（优设系、庞门正道系等）：
  官方条款对软件/文档嵌入有限制或另行收费——与 PDF 嵌入冲突。
- ❌ 许可不明、仅个人免费、来源不明的字体。

### 加新字体前的核查清单
1. **找到许可明文**（OFL 声明 / 作者声明原文），确认包含「嵌入电子文档或软件」。
2. 在[中文网字计划](https://chinese-font.netlify.app/)或 [ZeoSeven Fonts](https://fonts.zeoseven.com/)
   查到该字体（两个平台都做许可审核）。
3. 用 `tools/fetch-font-catalog.mjs` 的同款方式拿到 CDN 路径 + `FontFamilyName`。
4. 渲染一张样张实测（`node skill/scripts/render.mjs`，确认字形真实加载而非回退）。

---

## 1. 加载方式（统一模板）

```html
<!-- 在每个 deck.html 的 <head> 里（按需加行，不用的不要引） -->
<link rel="preconnect" href="https://cdn.jsdelivr.net">
<link href="https://cdn.jsdelivr.net/npm/@chinese-fonts/<包名>@<版本>/dist/<目录>/result.css" rel="stylesheet">
```

```css
/* 使用时：font-family 会被自动加载的 CSS 里声明，直接引用 */
.card h1 { font-family: "Huiwen-mincho", "Noto Serif SC", serif; }
```

- **务必带兜底栈**：字体名后的 `"Noto Serif SC"/"Noto Sans SC"` 等兜底（断网/加载失败时回退）。
- **字重**：不同字重是各自的 `result.css`（如 `LXGWWenKai-Medium`），使用时按需引。
- **只引用到的字体**：一个 deck 建议 ≤2 个字族（1 显示 + 1 正文），最多 +1 点缀。
- 分包按需加载（cn-font-split 切片）：正文一屏约下载 100KB–1MB 级别的字块。

---

## 2. 主池字体（15 款）

### 宋 / 明朝系 —— 文学、深度、传统

#### 1. 汇文明朝体 Huiwen-mincho
`气质` 五六十年代旧铅字印刷味；简体部分复原「汉字简化后、字形改造前」的样貌。
`许可` 作者声明免费商用（明文允许：印刷、显示、**嵌入电子文档**、设备；可自由转发；不可单独转卖字体文件）
`加载`
```html
<link href="https://cdn.jsdelivr.net/npm/@chinese-fonts/hwmct@3.0.0/dist/汇文明朝体/result.css" rel="stylesheet">
```
`CSS` `font-family: "Huiwen-mincho", "Noto Serif SC", serif;`（单字重 Regular）
`适合` 文学、历史、文化类封面与长文；`避免` 需要现代感/强冲击的场合。

#### 2. 京华老宋体 KingHwa_OldSong
`气质` 低对比度「老宋」，民国书卷气，笔画含蓄。
`许可` 作者声明免费商用（明文允许：平面/包装/影视/网页，**嵌入电子产品与软件应用**；不可单独出售；勿用于字形规范讲究的正规场合）
`加载`
```html
<link href="https://cdn.jsdelivr.net/npm/@chinese-fonts/jhlst@3.0.0/dist/京華老宋体v2_002/result.css" rel="stylesheet">
```
`CSS` `font-family: "KingHwa_OldSong", "Noto Serif SC", serif;`（v1_007 / v2_002 两个版本目录）
`适合` 书评、人文长文、品牌故事；`避免` 教育/规范用字场景（作者声明注明字形不符合现行规范）。

#### 3. 朱雀仿宋 Zhuque Fangsong
`气质` 清秀仿宋，笔画匀细结构端正，公文/古雅感。
`许可` **SIL OFL 1.1**
`加载`
```html
<link href="https://cdn.jsdelivr.net/npm/@chinese-fonts/zqfs@3.0.0/dist/ZhuqueFangsong-Regular/result.css" rel="stylesheet">
```
`CSS` `font-family: "Zhuque Fangsong (technical preview)", "Noto Serif SC", serif;`（单字重，仍在技术预览阶段）
`适合` 诗词、书信体、正式文档风格；`避免` 需要字重对比（只有一款字重）的排版。

#### 4. 思源宋体 Source Han Serif / Noto Serif SC
`气质` 正统宋体基准款，字重全、覆盖广（7 字重）。
`许可` **SIL OFL 1.1**（Adobe / Google）
`加载` 首推 Google Fonts（稳定、国内可用）：
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;700;900&display=swap" rel="stylesheet">
```
备用（中文网字计划，可变字体）：`@chinese-fonts/syst@3.0.0/dist/SourceHanSerifCN`
`CSS` `font-family: "Noto Serif SC", "Source Han Serif SC", serif;`
`适合` 万能兜底；`避免` 追求个性（它就是「不出错」的基准）。

### 楷体系 —— 手写温度、文雅

#### 5. 霞鹜文楷 LXGW WenKai
`气质` 基于 Klee One 改造的开源楷体天花板；笔画有书法温度又保持规整。
`许可` **SIL OFL 1.1**（LXGW）
`加载`（Regular / Light / Medium 三个字重各引所需）
```html
<link href="https://cdn.jsdelivr.net/npm/@chinese-fonts/lxgwwenkai@3.0.0/dist/LXGWWenKai-Regular/result.css" rel="stylesheet">
```
`CSS` `font-family: "LXGW WenKai", "Noto Serif SC", serif;`
`适合` 随笔、书摘、人文内容、正文（高可读性）；`避免` 商务严肃场合。

#### 6. 月星楷 Moon Stars Kai
`气质` 古籍旧字形楷体（参照明嘉靖《洪武正韵》），字里带「刻本」味。
`许可` **SIL OFL 1.1**（GuiWonder）
`加载`（Regular / Light / Bold）
```html
<link href="https://cdn.jsdelivr.net/npm/@chinese-fonts/moon-stars-kai@2.0.0/dist/MoonStarsKai-Regular/result.css" rel="stylesheet">
```
`CSS` `font-family: "Moon Stars Kai", "月星楷", "Noto Serif SC", serif;`
`适合` 国风、古籍整理、传统文化主题；`避免` 现代快消内容（字形偏古旧）。

### 黑体 / 无衬线系 —— 现代、清晰

#### 7. 思源黑体 Source Han Sans / Noto Sans SC
`气质` 现代无衬线基准款，字重全。
`许可` **SIL OFL 1.1**（Adobe / Google）
`加载`
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&display=swap" rel="stylesheet">
```
`CSS` `font-family: "Noto Sans SC", "Source Han Sans SC", sans-serif;`
`适合` 万能兜底、正文、数据内容。

#### 8. 得意黑 Smiley Sans
`气质` 斜体美术黑体，速度感与冲击力，年轻人最爱。
`许可` **SIL OFL 1.1**（atelierAnchor）
`加载`
```html
<link href="https://cdn.jsdelivr.net/npm/@chinese-fonts/dyh@3.0.0/dist/SmileySans-Oblique/result.css" rel="stylesheet">
```
`CSS` `font-family: "Smiley Sans Oblique", "Noto Sans SC", sans-serif;`
`适合` 标题/金句/活动宣传；`避免` 长正文（斜体影响阅读）。

#### 9. 霞鹜漫黑 LXGW Marker Gothic
`气质` 圆润马克笔感黑体，亲和有力。
`许可` **SIL OFL 1.1**（LXGW）
`加载`
```html
<link href="https://cdn.jsdelivr.net/npm/@chinese-fonts/lxgwmanhei@3.0.0/dist/LXGWMarkerGothic/result.css" rel="stylesheet">
```
`CSS` `font-family: "LXGW Marker Gothic", "Noto Sans SC", sans-serif;`
`适合` 标题、年轻向内容、清单；`避免` 严肃公文。

#### 10. 猫啃什锦黑 MaokenAssortedSans
`气质` 笔画粗细有变化但不夸张，收笔带一点手写味，活泼。
`许可` **SIL OFL 1.1**（猫啃网）
`加载`
```html
<link href="https://cdn.jsdelivr.net/npm/@chinese-fonts/mksjh@3.0.0/dist/MaokenAssortedSans/result.css" rel="stylesheet">
```
`CSS` `font-family: "MaokenAssortedSans", "Noto Sans SC", sans-serif;`
`适合` 活动标题、轻松向正文、包装/海报。

### 圆体系 —— 可爱、亲和

#### 11. 猫啃珠圆体 MaokenZhuyuanTi
`气质` 龙珠体圆润化改造，萌系亲和（儿童/日常/社交内容）。
`许可` **SIL OFL 1.1**（猫啃网）
`加载`
```html
<link href="https://cdn.jsdelivr.net/npm/@chinese-fonts/mkzyt@3.0.0/dist/猫啃珠圆体/result.css" rel="stylesheet">
```
`CSS` `font-family: "MaokenZhuyuanTi", "猫啃珠圆体", "Noto Sans SC", sans-serif;`
`适合` 亲子、生活、轻松科普；`避免` 商务/严肃内容。

### 手写系

#### 12. 悠哉字体 Yozai
`气质` 圆润手写感（基于 Y.OzFont），轻松自然。
`许可` **SIL OFL 1.1**（LXGW / Y.OzVox）
`加载`（Light / Regular / Medium / Bold）
```html
<link href="https://cdn.jsdelivr.net/npm/@chinese-fonts/yozai@3.0.0/dist/Yozai-Regular/result.css" rel="stylesheet">
```
`CSS` `font-family: "Yozai", "Noto Sans SC", sans-serif;`
`适合` 手账体、批注体、轻松短文；`避免` 正式场合。

### 等宽系 —— 数据、代码、标签

#### 13. Maple Mono CN
`气质` 圆角等宽字体（CN 版含中文字形），代码/数据气质。
`许可` **SIL OFL 1.1**（Maple Mono Project）
`加载`（17 字重，按需，Regular 示例）
```html
<link href="https://cdn.jsdelivr.net/npm/@chinese-fonts/maple-mono-cn@2.0.0/dist/MapleMono-CN-Regular/result.css" rel="stylesheet">
```
`CSS` `font-family: "Maple Mono CN", "Noto Sans SC", monospace;`
`适合` 数据卡、技术标签、页码、终端风；`避免` 大段正文（等宽影响中文阅读节奏）。

### 标题美术系 —— 海报感

#### 14. 铁蒺藜 Tiejili
`气质` 粗犷方硬的标题体（Reserved Font Name: Tiejili/铁蒺藜）。
`许可` **SIL OFL 1.1**（Buernia）
`加载`
```html
<link href="https://cdn.jsdelivr.net/npm/@chinese-fonts/tjl@3.0.0/dist/Tiejili_Regular/result.css" rel="stylesheet">
```
`CSS` `font-family: "Tiejili", "Noto Sans SC", sans-serif;`
`适合` 海报式封面、口号卡；`避免` 正文与小字号。

### 像素系 —— 复古游戏/数码

#### 15. QuanPixel 8px
`气质` 8px 像素点阵，复古数字感。
`许可` **SIL OFL**（Galmuri8 / Chill Bitmap / diaowinner）
`加载`
```html
<link href="https://cdn.jsdelivr.net/npm/@chinese-fonts/qxs@3.0.0/dist/quan/result.css" rel="stylesheet">
```
`CSS` `font-family: "QuanPixel 8px", monospace;`
`适合` 像素风标题、复古游戏主题；`避免` 任何正文（点阵只适合大字）。

---

## 3. 风格 × 字体推荐搭配

| 风格（style-presets / bold-styles） | 显示字体 | 正文字体 |
| --- | --- | --- |
| Vellum / Dark Botanical / Paper & Ink | 霞鹜文楷 或 汇文明朝体 | 思源宋体 |
| Grove / Signal / Soft Editorial | 京华老宋体 或 月星楷 | 思源宋体 |
| Notebook Tabs / Vintage Editorial | 汇文明朝体 | 霞鹜文楷 |
| Bold Signal / BlockFrame / 现代系 | 得意黑 或 霞鹜漫黑 | 思源黑体（Noto Sans SC） |
| Swiss Modern / Raw Grid / Studio | 思源黑体 900 | 思源黑体 |
| Pastel Geometry / Split Pastel / Daisy Days | 猫啃珠圆体 | 思源黑体 |
| Playful / Scatterbrain / Pin & Paper | 悠哉字体 或 猫啃珠圆体 | 霞鹜文楷 |
| Terminal Green / Neon Cyber / 8-Bit Orbit | Maple Mono CN | Maple Mono CN 或思源黑体 |
| Bold Poster / People's Platform / 口号卡 | 铁蒺藜 | 思源黑体 |
| Retro Windows / 像素风 | QuanPixel | 思源黑体 |
| 中文古籍/国风（配京华老宋等） | 月星楷 | 朱雀仿宋 |

**规则**：显示字体管「性格」，正文字体管「好读」；一个 deck 最多再选 1 个点缀字体
（如页码/标签用 Maple Mono）。

---

## 4. 扩展池（许可已核，可选用）

| 字体 | 包名 | 特点 | 许可 |
| --- | --- | --- | --- |
| 霞鹜文楷 Bright | lxgwwenkaibright@2.0.0 | 文楷的明亮版（含斜体），适合数据/界面 | OFL |
| 霞鹜文楷等宽屏幕版 | lywkpmydb@2.0.0 | 文楷等宽（屏幕优化），适合终端风正文 | OFL |
| 思源屏显臻宋 | sypxzs@3.0.0 | 思源宋的屏幕显示优化版 | OFL |
| MuzaiPixel | mzxst@3.0.0 | 另一款像素字体 | OFL |
| 峄山碑篆体 | ysbzt@3.0.0 | 篆书（特种标题） | 待二次核实 |

## 5. 探索渠道（自选字体时）

- **中文网字计划**（本库母体，80+ 款，全部免费商用）：
  https://chinese-font.netlify.app/ ｜ 源码 https://github.com/KonghaYao/chinese-free-web-font-storage
  - 数据源：`tools/font-catalog.json`（用 `node tools/fetch-font-catalog.mjs` 刷新）
- **ZeoSeven Fonts**（1291 款，FontsAPI 一行接入）：
  https://fonts.zeoseven.com/
  - ⚠️ 站内按授权分了信任等级（OFL 级 > 作者声明级），**只选 OFL 级**；
    曾有「作者声明」级字体因法律原因下架——作者声明级在入池前必须回到原始来源读条款。
- **猫啃网**（免费商用字体导航 + 授权说明）: https://www.maoken.com/

**收录新字体前，逐条过一遍 §0 的核查清单。**
