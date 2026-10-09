# frontend-slides-mobile

**移动端竖版卡片生产线** —— 一个给 WorkBuddy / DeepSeek Harness 使用的 agent skill。

把任何内容（主题 / 文章 / 文档）变成**手机竖版卡片**，交付 **一组 PNG 图片 + 一个矢量 PDF**。
不交付网页：终端产物就是图片和 PDF。

```
内容 ──► 卡片大纲 ──► deck.html（渲染源） ──► ┌ cards/01.png … NN.png
                                  │          └ deck.pdf（矢量，字体内嵌）
                                  └── Chrome headless（零第三方依赖）
```

## 特性

- **竖版移动优先**：默认 3:4 / 1080×1440；9:16、1:1 可切；字号按手机可读性设计
  （正文 ≥32px、等效 ≥11.5pt）。
- **矢量 PDF + 高清 PNG 组**：PDF 文字可选中可搜索、字体子集内嵌（任何设备显示一致）；
  PNG 组直接可发社交平台。
- **风格资产**：12 个内置风格（安全盘）+ 34 个个性模板（进阶盘），全部做了**竖版转译**
  与**中文配字体**。
- **开源中文字体库**：15 款精选（明朝 / 楷 / 黑 / 圆 / 手写 / 等宽 / 像素 / 标题美术），
  许可逐款核实、经 CDN 按需加载（**不内置字体包**），选字体同样是"看图挑"的流程。
- **中文排版内置**：行高/字距/标点/中英混排间距/反斜体规则，写进生成规范。
- **零第三方依赖渲染**：只用本机 Chrome / Chromium / Edge 命令行；
  单张截图 ≈1.4s，渲染结果字节级可复现。
- **双端同源**：同一份 `SKILL.md` 同时兼容 WorkBuddy（`~/.workbuddy/skills`）与
  DeepSeek Harness（`~/.dsh/skills`，目录束约定）。

## 快速开始

### 1. 安装

```bash
node tools/install.mjs            # 复制模式：装到 WorkBuddy + dsh 两处
node tools/install.mjs --link     # 开发模式：目录链接（改源码即时生效）
node tools/install.mjs --only=dsh # 只装某一端
```

### 2. 使用（对话触发）

对 agent 说：

> 把这篇文章做成知识卡片

> 做一组 6 张的知识卡片，主题是「为什么睡够 7 小时这么难」，发小红书

agent 会依次：确认内容 → 3 张风格预览让你挑 → 一张字体对比卡让你选字体 →
生成全部卡片 → 渲染 → 交付 PDF + 图片。

### 3. 手动渲染

```bash
node skill/scripts/render.mjs <deck.html>            # PNG 组 + PDF
node skill/scripts/render.mjs <deck.html> --png-only # 只要图片
node skill/scripts/render.mjs <deck.html> --cards=3  # 只重渲染第 3 张（迭代用）
```

## 目录结构

```
skill/                          # ← 安装到 agent 环境的全部内容
├── SKILL.md                    # 工作流（agent 入口）
├── references/                 # 渐进式披露的规范文档
│   ├── canvas-and-type.md      # 画布/字号/安全区/中文排版/字体策略
│   ├── layout-patterns.md      # 12 种卡片布局骨架
│   ├── style-presets.md        # 12 个内置风格
│   ├── bold-styles.md          # 34 个个性模板基因表
│   ├── font-library.md         # 15 款开源中文字体库（许可/CDN/搭配表）
│   └── render-pipeline.md      # 渲染管线与故障排查
├── assets/
│   └── deck-template.html      # deck 骨架模板（舞台/单卡/打印/页码）
└── scripts/
    └── render.mjs              # 渲染驱动（零依赖）
tools/
├── install.mjs                 # 安装/同步到本机各 agent 环境
├── extract-genes.mjs           # 从 upstream 重新提取模板基因（开发用）
└── fetch-font-catalog.mjs      # 刷新中文字体目录数据（开发用）
examples/
├── demo-sleep/                 # 6 张卡完整示例（deck.html + cards/ + deck.pdf）
└── font-showcase/              # 字体渲染对比示例（汇文明朝体 × 霞鹜文楷）
upstream/                       # 上游参考副本（开发用）
```

## 工作原理

1. **生成**：agent 按规范生成单个自包含 `deck.html`（固定舞台 1080×1440，内联 CSS）。
2. **截图**：`?p=N` 单卡模式 + Chrome `--screenshot` 逐张出 PNG。
3. **PDF**：Chrome `--print-to-pdf` + CSS `@page` 精确分页（每页一卡，页面尺寸=画布尺寸）。
4. **校验**：脚本自动验证 PNG 宽高、PDF 页数/体积并报告。

关键实测结论（完整见 `skill/references/render-pipeline.md`）：
- 字体必须子集内嵌 → PDF 在任何设备显示一致；
- 必须用独立 `--user-data-dir`（否则命令会被转交给用户已开的浏览器）；
- headless Chrome **不能**渲染 PDF 预览（验证 PDF 用元数据而非截图）。

## 常见问题

| 问题 | 说明 |
| --- | --- |
| 首次渲染慢 | 首次需联网下载 webfont，之后浏览器缓存命中（约 1.4s/张） |
| 需要装什么？ | 本机有 Chrome / Edge 之一即可，无需 npm install |
| `_render-cache/` 是什么？ | 渲染用的浏览器 profile（字体缓存），可随时删 |
| 换画布（9:16 等）？ | 改 deck.html 的 `--card-w/--card-h/--u` 三个变量 |
| 想改文案/颜色？ | 改 `deck.html` 后重跑渲染，30 秒内出新版 |

## 字体与许可

- 本仓库**不内置任何字体文件**；渲染时按需从 CDN（Google Fonts / 中文网字计划·jsDelivr）
  下载，由浏览器缓存复用。
- `skill/references/font-library.md` 收录的 15 款字体均逐款核查过许可：
  **SIL OFL 系优先**；"作者声明免费商用"类必须明文允许嵌入电子文档（PDF 会嵌入字体子集）。
- 明确**排除**的类别：企业品牌字体（条款单方声明、可能变更）；
  "免费商用但限制嵌入"的字体（与 PDF 嵌入冲突）。细节见该文档 §0。

## 上游与许可

本项目在设计与风格资产上**改编自 [zarazhangrui/frontend-slides](https://github.com/zarazhangrui/frontend-slides)**
（MIT）：核心哲学（show-don't-tell、反 AI 俗套、渐进式披露）、12 个风格预设、
34 个 bold 模板基因。本项目的差异：**竖版移动优先 · 静态产物（PNG+PDF）· 中文排版系统 ·
零依赖渲染管线 · 双 harness 兼容**。

`upstream/` 目录是上游仓库的参考副本，其许可证见 `upstream/LICENSE`（MIT, © 2025 Zara Zhang）。
本项目自身同样以 MIT 发布，见 `LICENSE`。
