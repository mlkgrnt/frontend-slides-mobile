# 渲染管线：HTML → PNG 组 + PDF

**零第三方依赖**：只用本机已安装的 Chrome/Chromium/Edge 命令行（headless）。
不需要 Playwright、不需要 npm install。渲染确定性经过实测：同一 HTML 两次渲染输出**字节级一致**。

---

## 1. 总览

```
deck.html（生成的卡片源文件）
   │
   ├─ ?p=N 单卡模式 ──→ Chrome --screenshot ──→ cards/01.png, 02.png, ...   （分享/发布用）
   │
   └─ 打印模式 ────────→ Chrome --print-to-pdf ─→ deck.pdf                （阅读/转发用）
```

- **图片组**：每张卡单独截图，1080×1440（或所选画布），PNG。
- **PDF**：由 Chrome 打印引擎输出**矢量文字 PDF**（字体子集内嵌，可选中、可搜索、体积小），
  每页恰好一张卡，页尺寸 = 画布尺寸。
- HTML 是**中间产物**：保留它便于修改后重渲染（不要删！）；对外交付是 PNG 组 + PDF。

## 2. 使用方法

```bash
# 标准渲染（自动找 Chrome、自动数卡片、自动校验）
node scripts/render.mjs path/to/deck.html

# 常用变体
node scripts/render.mjs deck.html --out-dir=cards --pdf=deck.pdf
node scripts/render.mjs deck.html --png-only          # 只要图片
node scripts/render.mjs deck.html --pdf-only          # 只要 PDF
node scripts/render.mjs deck.html --width=1080 --height=1920   # 9:16 画布
node scripts/render.mjs deck.html --scale=1.5         # 1.5x 超采样（默认 1）
```

脚本自动完成：定位浏览器 → 逐张截图 → 生成 PDF → 校验产物（尺寸/数量/大小）→ 打印报告。
卡片数量由 HTML 里的 `.card[data-index]` 元素数决定，无需手动传参。

## 3. 浏览器定位（render.mjs 内置顺序）

1. 环境变量 `CHROME_PATH`（如设置，优先使用）
2. 常见安装路径：
   - Windows：`C:\Program Files\Google\Chrome\Application\chrome.exe`、
     `%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe`、
     `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`
   - macOS：`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`、`/Applications/Microsoft Edge.app/...`
   - Linux：`google-chrome`、`chromium`、`chromium-browser`、`microsoft-edge`
3. Playwright 缓存：`~/AppData/Local/ms-playwright/chromium-*/chrome-win64/chrome.exe`
   （Windows）/ `~/.cache/ms-playwright/chromium-*/chrome-linux/chrome`（Linux）
4. 失败时：报错并提示"安装 Chrome 或设置 CHROME_PATH"。

## 4. 精确命令（排障时手跑用）

```bash
# 单张截图（N 为卡片序号）
CHROME --headless=new --disable-gpu --hide-scrollbars \
  --window-size=1080,1440 --force-device-scale-factor=1 \
  --virtual-time-budget=8000 \
  --user-data-dir="<缓存目录>" \
  --screenshot="<输出>/03.png" \
  "file:///<encodeURI 后的路径>/deck.html?p=3"

# PDF
CHROME --headless=new --disable-gpu --no-pdf-header-footer \
  --virtual-time-budget=8000 \
  --user-data-dir="<缓存目录>" \
  --print-to-pdf="<输出>/deck.pdf" \
  "file:///<encodeURI 后的路径>/deck.html?print=1"
```

### 参数要点（每条都有实测依据）

| 参数 | 作用 | 备注 |
| --- | --- | --- |
| `--headless=new` | 新版无头模式 | 渲染与真实 Chrome 一致；旧版 `--headless` 已弃用 |
| `--window-size=W,H` | 截图视口尺寸 | **必须精确等于画布尺寸**，否则 PNG 尺寸不对 |
| `--force-device-scale-factor=1` | 像素比 1:1 | 配合 `--scale` 超采样需要 ×倍数（render.mjs 处理） |
| `--hide-scrollbars` | 隐藏滚动条 | 防止截图边缘出现滚动条 |
| `--virtual-time-budget=8000` | 等待字体/渲染稳定 | 网络请求期间虚拟时钟自动等待；字体已缓存时几乎瞬间完成 |
| `--user-data-dir=<持久目录>` | 独立浏览器 profile | **必须**：a) 隔离用户的日常 Chrome；b) 持久化字体缓存，第二次起又快又稳 |
| `--no-pdf-header-footer` | 去掉页眉页脚 | 否则 PDF 边缘会印上 URL/日期 |
| `--print-to-pdf=<path>` | 输出 PDF | 遵循页面 `@page { size: ... }` 设定 |
| `--screenshot=<path>` | 输出 PNG | `?p=N` 单卡模式下即为该卡截图 |

### PDF 页面尺寸原理（实测数据）

CSS `@page { size: 1080px 1440px; margin: 0 }` → Chrome 按 96dpi 换算 →
PDF MediaBox `[0 0 810 1080]`（单位 pt，1px = 0.75pt）。**尺寸精确无缩放**。
每页恰好一张卡，取决于 `.card` 的固定高度 + `break-after: page`。

## 5. deck.html 侧的要求（生成时必须遵守）

1. **固定舞台**：`.card { width: Wpx; height: Hpx; }`，不响应式重排。
2. **单卡模式**：URL 带 `?p=N` 时 `body` 加 `single` 类，只显示第 N 张卡（模板已实现）。
3. **打印模式**：`@media print` 里卡片 `break-after: page`；`@page` 尺寸 = 画布尺寸。
4. **字体加载**：Google Fonts `<link>` + 中文兜底栈（见 canvas-and-type.md §6）。
5. **禁用入场动画**：渲染是静态快照。所有元素在无动画情况下必须是**完整终态**
   （禁止 `opacity: 0` 起步的入场动画未加静态终态覆盖）。
6. **背景色**：截图模式下 `body` 背景透明（卡片自带背景铺满）；打印模式 `html,body` 白底。
7. **相对路径**：图片资源与 deck.html 同目录或用相对路径（file:// 下可加载）。

## 6. 故障排查

| 症状 | 原因 | 解决 |
| --- | --- | --- |
| PNG 尺寸不对 | `--window-size` 与画布不符 | 检查 render.mjs 的 `--width/--height` 参数 |
| 截图为空白/只有背景 | 字体未加载完就截图；或画布尺寸大于视口 | 提高 `--virtual-time-budget`；检查 window-size |
| 中文变宋体/黑体的系统默认 | Google Fonts 未加载（断网） | 联网重跑；首次渲染需联网下载字体 |
| PDF 每页有白边/内容被裁 | `@page margin` 不为 0 或卡片高度 ≠ 页面高度 | 检查 @page 与 .card 尺寸一致 |
| PDF 带 URL/日期页脚 | 漏了 `--no-pdf-header-footer` | 补参数 |
| 命令"转交给现有浏览器会话" | 没加独立 `--user-data-dir` | render.mjs 已默认处理 |
| 渲染很慢（>10s/张） | 字体每次重新下载 | 确认 user-data-dir 持久（默认在 `_render-cache/`） |
| 想截图看 PDF 效果 | **headless Chrome 无法渲染 PDF viewer** | 改用 PNG 组检查视觉；PDF 用文本/元数据校验 |

## 7. 渲染产物校验（render.mjs 自动做）

- PNG：读文件头验证 **宽高精确匹配**画布尺寸；文件 >2KB（防止空帧）。
- PDF：验证文件头 `%PDF`、页面数 = 卡片数（解析 `/Type /Page` 计数）。
- 报告输出：每张图的尺寸与大小、PDF 页数与体积、总耗时。

## 8. 性能与确定性（实测基线）

- 单张截图（字体缓存后）：**≈1.4 秒**；首次运行（下载字体）：+5–15 秒（一次性）。
- 12 张卡 + PDF 全流程：约 **25–35 秒**。
- 相同 HTML 重复渲染：PNG **字节级一致**（可安全地重渲染覆盖）。
- 渲染期间不要并行跑第二个渲染任务（共用 profile 会互相锁）。
