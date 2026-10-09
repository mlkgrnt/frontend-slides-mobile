# 卡片布局模式库（12 种）

所有卡片的"骨架"从这 12 种里选。骨架只负责**结构与节奏**；
颜色、字体、装饰由所选风格层（style-presets.md / bold-styles.md）通过 CSS 变量注入。

**约定**：统一类名（模板见 `assets/deck-template.html`）：
`.card`（舞台）· `.pad`（安全区）· `.kicker`（眉题）· `.h1/.h2`（标题）
`.body`（正文）· `.meta`（小标签）· `.card-foot`（页脚）· `.orn`（装饰容器）

---

## 1. cover 封面卡
**用途** deck 第一张：主题 + 副题 + 署名。**上限** 主标 ≤14 字 + 副标 ≤24 字。
```html
<section class="card cover" data-index="1">
  <div class="pad">
    <div class="kicker">ISSUE 01 · 2026</div>
    <h1 class="h1 display">主标题写在<br>这里</h1>
    <p class="body sub">一句话副标题说明这张卡片的主题</p>
  </div>
  <div class="card-foot"><span class="meta">作者 / 品牌</span></div>
</section>
```
要点：标题走 `display` 字号；副题与标题间 ≥64px；署名在页脚。

## 2. section 章节卡
**用途** 分节过渡（如"第一部分 · 为什么"）。**上限** 序号 + ≤10 字标题。
```html
<section class="card section" data-index="3">
  <div class="pad mid">
    <div class="big-num">02</div>
    <h2 class="h2">章节标题</h2>
    <p class="meta">SECTION</p>
  </div>
</section>
```
要点：大序号 160–240px（描边或 10–15% 透明度版本）；整卡只放一件事，留白 60%+。

## 3. bullets 要点卡
**用途** 主力卡型：标题 + 3–5 条要点。**上限** 标题 ≤12 字；每条 ≤26 字。
```html
<section class="card" data-index="4">
  <div class="pad">
    <h2 class="h1">卡片标题</h2>
    <ul class="bullets">
      <li><strong>要点一</strong> —— 补充说明不超过一行半</li>
      <li><strong>要点二</strong> —— 同上</li>
    </ul>
  </div>
  <div class="card-foot"><span class="meta">03</span></div>
</section>
```
要点：条目间距 36–44px；标记符用风格色（菱形/圆点/短横）；
**每条的"粗体词 + 说明"结构**比纯句子更好扫读。

## 4. statement 金句卡
**用途** 一句话观点/结论，撑满画面。**上限** ≤30 字。
```html
<section class="card statement" data-index="5">
  <div class="pad mid">
    <p class="display-sm">真正的重点<br>值得单独一屏</p>
  </div>
</section>
```
要点：字号 84–120px；行高 1.3–1.4；居中或左对齐压中轴；不放其他元素。
**断行手动控制：每行 6–9 字、最多 3 行**；若要"主句 + 补句"，拆成
"大主句（display）+ 小补句（降两档字号 + 55–65% 透明度或左竖线）"两个元素，
不要塞进同一个大字块里硬断。

## 5. compare 对比卡
**用途** A vs B、前后对比、优缺点。**上限** 每栏 ≤80 字。
```html
<section class="card" data-index="6">
  <div class="pad">
    <h2 class="h1">对比标题</h2>
    <div class="compare">
      <div class="side a"><div class="meta">A 方案</div><p class="body">要点…</p></div>
      <div class="side b"><div class="meta">B 方案</div><p class="body">要点…</p></div>
    </div>
  </div>
</section>
```
要点：竖版天然"上下两栏"；两栏用不同底色/描边区分；
中间的 `VS` 或分隔线可选；**每栏 ≤3 行正文**。

## 6. stats 数据卡
**用途** 2–4 个关键数字。**上限** 数字 ≤6 字符 + 说明 ≤10 字。
```html
<section class="card" data-index="7">
  <div class="pad">
    <div class="kicker">关键数据</div>
    <div class="stats">
      <div class="stat"><div class="stat-num">87%</div><div class="meta">说明文字</div></div>
      <div class="stat"><div class="stat-num">2.4x</div><div class="meta">说明文字</div></div>
    </div>
  </div>
</section>
```
要点：数字 96–160px（等宽数字用 `font-variant-numeric: tabular-nums`）；
2 个数横排、3–4 个数 2×2 网格；数字用强调色。

## 7. steps 步骤卡
**用途** 流程/教程（01→02→03）。**上限** 3–4 步，每步 ≤20 字。
```html
<section class="card" data-index="8">
  <div class="pad">
    <h2 class="h1">怎么做</h2>
    <ol class="steps">
      <li><span class="step-n">01</span><div><strong>第一步</strong>　简短说明</div></li>
      <li><span class="step-n">02</span><div><strong>第二步</strong>　简短说明</div></li>
    </ol>
  </div>
</section>
```
要点：序号用风格色大字或圆形徽章；步骤间用竖线/箭头连接；
**超过 4 步拆成两卡**。

## 8. quote 引用卡
**用途** 引文 + 出处。**上限** 引文 ≤60 字。
```html
<section class="card quote" data-index="9">
  <div class="pad mid">
    <div class="quote-mark">"</div>
    <blockquote class="body-lg">被引用的那句话，长度控制在两到三行。</blockquote>
    <div class="meta">—— 出处 / 作者</div>
  </div>
</section>
```
要点：引号装饰 180–260px（10–35% 透明度）；引文用衬线或大字号；
出处靠右或居中，与引文距 48px。

## 9. checklist 清单卡
**用途** 待办/清单/自检项。**上限** 4–6 项。
```html
<section class="card" data-index="10">
  <div class="pad">
    <h2 class="h1">自检清单</h2>
    <ul class="checklist">
      <li><span class="box"></span>检查项文字</li>
      <li><span class="box done">✓</span>已完成项（可选状态）</li>
    </ul>
  </div>
</section>
```
要点：勾选框 36–44px 方形（风格描边）；行距 44–52px；
`done` 状态用对勾 + 降透明度。

## 10. longform 长文卡
**用途** 阅读型（说明文/故事段落）。**上限** ≤180 字。
```html
<section class="card" data-index="11">
  <div class="pad">
    <h2 class="h2">小标题</h2>
    <p class="body">段落一……</p>
    <p class="body">段落二……</p>
  </div>
</section>
```
要点：最多 2–3 段；段间距 0.6em；**不首行缩进**；
可配一个左侧竖线或首字下沉（Paper & Ink 风格专属）。

## 11. image 图文卡
**用途** 配图 + 说明。**上限** 图占 45–65%，文字 ≤60 字。
```html
<section class="card" data-index="12">
  <div class="figure"><img src="assets/xxx.jpg" alt="说明"></div>
  <div class="pad">
    <h2 class="h2">图片说明标题</h2>
    <p class="body">一段解释文字。</p>
  </div>
</section>
```
要点：图区满宽出血（上或下）；`object-fit: cover`；文字区背景需与图区分明；
**图片 base64 内联或用相对路径**（渲染走 file://，相对路径同目录可加载）；
无图时用 CSS 图形（渐变/几何）替代 —— 同样成立。

## 12. closer 结尾卡
**用途** 收尾：总结/行动号召/联系方式。**上限** 一句话 + 署名信息。
```html
<section class="card closer" data-index="13">
  <div class="pad mid">
    <h2 class="h1">一句话收尾</h2>
    <p class="body">补充说明或联系方式</p>
  </div>
  <div class="card-foot"><span class="meta">感谢阅读 · 你的名字</span></div>
</section>
```
要点：与封面形成呼应（同构不同色）；可整面用强调色底做"合上书本"的感觉。

---

## 组卡节奏（内容结构化的默认顺序）

```
封面 → (章节 → 2-4 张内容卡) ×N → 收尾
```

- **内容卡**在 bullets / statement / compare / stats / steps / quote / checklist / longform / image 里按内容选型。
- **节奏规则**：连续 3 张同类卡后插一张异型卡（如金句/数据）透口气。
- **张数建议**：5–9 张最适合手机完整读完（含封面收尾）；超过 12 张考虑拆成两个 deck。
- 每个章节最好 ≤4 张卡；章节卡只放序号 + 标题。

## 版式微调备忘

- 卡片内容**垂直分布**优先用 `justify-content: space-between` + 明确的上中下三段，
  不要全部 `center`（中心堆叠会显得空散）。
- 所有卡的页脚（页码/署名）位置必须一致（同一基线），翻页时形成稳定节奏。
- 装饰元素统一放 `.orn` 容器里，便于整体调透明度/清除。
