# ip-harness Design System

| 项 | 值 |
|----|-----|
| **权威源** | `src/index.css`（`@theme` + 组件类） |
| **对照 HEAD** | ~`a099ab8` / UI 线 `86e87bb` |
| **受众** | **UI评估助手**（打分引用条款）+ **UI质感助手**（实现对照）+ 各壳应用助手 |
| **范围** | mid `5173` · workbench `5174` · agent `5175` · ops `5176` · iam `5177` |
| **共享包** | `packages/ui`（badge / handoff / progress 等；视觉仍服从本文件 token） |

条款编号 `DS-xxx` 供 `EVAL_RUBRIC.md` 与 `REVIEW_*.md` 引用。

---

## DS-PURPOSE · 目的

统一多壳原型的 **Apple 分组背景 + slate 主 CTA + 软蓝 accent** 语言，使评估与质感改造共用同一套可安装标准：token 表、组件清单、跨壳规则、禁止项与 P0 验收锚点。

**安装方式**：新 UI 先查本文件条款 → 用已有 class / CSS 变量 → 禁止内联随机色。

---

## 1. Foundations

### DS-COLOR-01 · 表面与主色

| Token | 值 | 用途 |
|-------|-----|------|
| `--color-surface-50` | `#f5f5f7` | 页底（`body` / `.app-shell-bg`） |
| `--color-surface-100` | `#f2f2f7` | 禁用输入底、弱填充 |
| `--color-surface-card` | `#ffffff` | 卡片 / KPI / 管道列 |
| `--color-primary-600` | `#0f172a` | 主字色、主按钮、品牌块 |
| `--color-primary-500` | `#1e293b` | 主按钮 hover |
| `--color-primary-50` | `#f1f5f9` | 浅 slate 衬底 |

正文默认色：`#0f172a`。次要文相对白卡须 **≥4.5:1**（实践色：`#3f3f46`，见 `.dash-next-sub` / `.dash-inbox-sub`）。

### DS-COLOR-02 · Accent（链接 / focus / 选中轨）

| Token | 值 | 用途 |
|-------|-----|------|
| `--color-accent` | `#007aff` | focus ring、inset 选中条、info |
| `--color-accent-soft` | `#e8f2ff` | 选中行 / 卡 wash |
| `--color-accent-muted` | `#0066d6` | badge 文案等 |

**主 CTA 用 navy（`--color-primary-600`），不用 indigo/violet 聊天糖色。** 见 `.cta-work` / `.ui-btn-primary`。

### DS-TYPE-01 · 字体栈与字号

**栈**（`body`）：

`-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "PingFang SC", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif`

| Token | rem | px | 用途 |
|-------|-----|-----|------|
| `--font-size-caption` | `0.75rem` | 12 | 标签、chip、表头 |
| `--font-size-footnote` | `0.8125rem` | 13 | 输入、按钮、表体、Inbox 标题 |
| `--font-size-body` | `0.9375rem` | 15 | 正文默认 |
| `--font-size-title` | `1.0625rem` | 17 | 区块标题 |
| `--font-size-display` | `1.375rem` | 22 | `.shell-page-title` |
| `--font-size-hero` | `1.75rem` | 28 | 罕用大标题 |

- 标题：`text-wrap: balance`（`h1–h3`、`.text-balance`）
- 段落：`text-wrap: pretty`
- 数字：`.tabular` → `font-variant-numeric: tabular-nums`（KPI、SLA、步进数必用）
- 平滑：`-webkit-font-smoothing: antialiased`

### DS-SPACE-01 · 间距 4/8 网格

| Token | rem | px |
|-------|-----|-----|
| `--spacing-1` | `0.25rem` | 4 |
| `--spacing-2` | `0.5rem` | 8 |
| `--spacing-3` | `0.75rem` | 12 |
| `--spacing-4` | `1rem` | 16 |
| `--spacing-5` | `1.25rem` | 20 |
| `--spacing-6` | `1.5rem` | 24 |
| `--spacing-8` | `2rem` | 32 |

列表行最小高：`.list-row` / `.hit-40` → **40×40**（桌面密集区下限）。

### DS-RADIUS-01 · 圆角阶梯

| Token | rem | px | 典型 |
|-------|-----|-----|------|
| `--radius-sm` | `0.5rem` | 8 | 控件、按钮、输入 |
| `--radius-md` | `0.75rem` | 12 | 内嵌、segmented、节点卡 |
| `--radius-lg` | `1rem` | 16 | `surface-card`、KPI、管道列 |
| `--radius-xl` | `1.25rem` | 20 | 大面板 |
| `--radius-2xl` | `1.5rem` | 24 | sheet |

### DS-RADIUS-02 · 同心圆角（强制）

**外圆角 ≈ 内圆角 + 内边距。**

实现参考：

- `.nest-inset` / `.wb-inset` / `.mid-pipeline-card`：`border-radius: calc(var(--radius-lg) - 0.5rem)`
- `.segmented-item`：`calc(var(--radius-md) - 0.25rem)`
- `.agent-meta-grid`：`calc(var(--radius-lg) - 0.375rem)`

禁止父子同半径；禁止 `0` 半径产品面。

### DS-SHADOW-01 · 阴影

| Token | 用途 |
|-------|------|
| `--shadow-rest` | 默认卡 / 次按钮 / segmented 选中 |
| `--shadow-elevated` | hover 抬升、toast |
| `--shadow-shell` | `.shell-aside` 侧栏 |

克制、漫射；禁止硬黑边大阴影与「霓虹外发光」。

### DS-FOCUS-01 · Focus ring

| 类 | 行为 |
|----|------|
| `.focus-ring` | `:focus { outline: none }` + `:focus-visible` → `2px solid var(--color-accent)` / offset `2px` |
| `.focus-row` / `.sidebar-link` / `.wb-node-card` / `.dash-inbox-row` | 同等 accent ring |
| `.ui-input:focus` / `.wb-draft-area:focus` | 边框 accent + `box-shadow: 0 0 0 3px rgba(0,122,255,0.18)` |

**禁止**裸 `outline-none` 且无 `focus-visible` 替换。

### DS-MOTION-01 · 动效

| Token / 类 | 说明 |
|------------|------|
| `--ease-interactive` | `cubic-bezier(0.25, 1, 0.5, 1)` — press / hover |
| `--ease-out-soft` | `cubic-bezier(0.2, 0, 0, 1)` |
| `.btn-press` / `.ui-btn:active` | `scale(0.96)`（不可再小） |
| `.card-hover` | `translateY(-1px)` + rest shadow |
| `@media (prefers-reduced-motion: reduce)` | 关闭 transition / stagger / toast / menu 动画 |

规则：

1. **可打断**：交互用 CSS transition，勿用不可中断的长 keyframes 做 hover。
2. **高频交互禁止 stagger**（键入、行 hover）；`.kpi-stagger` 仅低频首屏入场。
3. **禁止 `transition: all`**；属性必须枚举。
4. 动效不能是唯一反馈，须有静态色/标签变化。

---

## 2. Status / 语义色

### DS-STATUS-01 · Token

| 语义 | 色 | 底 | 边 |
|------|----|----|-----|
| pending | `--color-status-pending` `#d97706` | `--color-status-pending-bg` `#fffbeb` | `--color-status-pending-border` `#fde68a` |
| risk | `--color-status-risk` `#e11d48` | `--color-status-risk-bg` `#fff1f2` | `--color-status-risk-border` `#fecdd3` |
| deadline | `--color-status-deadline` `#ea580c` | `--color-status-deadline-bg` `#fff7ed` | `--color-status-deadline-border` `#fed7aa` |
| success | `--color-status-success` `#059669` | `--color-status-success-bg` `#ecfdf5` | （toast 边 `#a7f3d0`） |
| info | `--color-status-info` `#007aff` | `--color-status-info-bg` `#e8f2ff` | — |

工具类：`.status-pending` / `.status-risk` / `.status-deadline`。

Docket 行态：`.mid-docket-row[data-state="critical|warn|writeback|done"]` 与 `.mid-docket-cal` 同语义轨色。

---

## 3. Components

### DS-COMP-BTN · `.ui-btn` + variants

| 类 | 用途 |
|----|------|
| `.ui-btn` | 基座：min-h `2.5rem`、`radius-sm`、footnote、枚举 transition |
| `.ui-btn-primary` | navy `#0f172a` → hover `#1e293b` |
| `.ui-btn-secondary` | 白底 + 边 + `--shadow-rest` |
| `.ui-btn-ghost` | 透明；hover 浅灰填充 |
| `.ui-btn-success` | `#047857` → hover `#059669` |
| `.ui-btn-sm` | min-h `2rem`、caption |
| `.cta-work` | 工作面主 CTA（同 navy，`radius-sm`） |

禁用默认：`opacity: 0.45; cursor: not-allowed`。**闸门主 CTA 例外见 DS-DISABLED-01。**

### DS-COMP-INPUT · `.ui-input`

- min-h `2.5rem`、`radius-sm`、footnote
- focus：accent 边 + 3px soft ring
- disabled：`surface-100` 底、opacity `0.55`
- `.ui-input-sm`：更矮、caption

### DS-COMP-TABLE · `.ui-table`

- footnote 体、caption 头、浅灰 thead
- 行 hover：`accent-soft` 55% mix
- 禁止表内再发明第二套字号/斑马色

### DS-COMP-EMPTY · `.ui-empty`

- dashed 边、`radius-lg`、rest shadow
- `.ui-empty-title` / `.ui-empty-desc`：说明「为何空 + 下一步」，忌技术堆栈

### DS-COMP-TOAST · `.ui-toast`

- `radius-lg`、elevated shadow、`.toast-enter`
- `.ui-toast-success` / `.ui-toast-error` 用语义底色

### DS-COMP-SURFACE · `.surface-card`

白底 + `rgba(60,60,67,0.12)` 边 + `radius-lg` + `--shadow-rest`。跨壳默认卡容器。

### DS-COMP-SEG · `.segmented` / `.segmented-item`

iOS 分段：灰轨 + 选中白片 + rest shadow；选中态用 `aria-selected` / `aria-current` / `aria-pressed`。

### DS-COMP-SHELL · 壳 chrome

| 类 | 用途 |
|----|------|
| `.app-shell-bg` | 页底 surface-50 |
| `.shell-aside` | 白侧栏 + shell shadow |
| `.shell-brand-mark` | navy 圆角品牌块 |
| `.nav-section` | 11px uppercase 分组标签 |
| `.shell-topbar` | blur 顶栏（ops/iam） |
| `.shell-banner-demo` | 琥珀诚实横幅 |
| `.shell-page-kicker` / `.shell-page-title` | 页眉层级 |
| `.list-row-active` | accent-soft + inset 3px accent |
| `.sticky-chrome` | sticky + blur + 底渐隐 mask |

### DS-COMP-DASH · Dashboard（`dash-*`）

| 类 | 用途 |
|----|------|
| `.dash-board-top` | 首屏合并单元：头 + 下一步 + KPI |
| `.dash-board-head` / `-title` / `-org` / `-status` | 轻头 |
| `.dash-next` | 琥珀优先办理条（inset 3px `#f59e0b`） |
| `.dash-inbox-*` | Inbox 列网格 / 分组 / 行 |
| `.dash-scan-chips` / `.dash-scan-chip` | **扫视 chip**（见 DS-SCAN-01） |
| `.kpi-strip` / `.kpi-tile` / `.kpi-chip` | KPI 带 |

### DS-COMP-WB · Workbench（`wb-*`）

| 类 | 用途 |
|----|------|
| `.wb-tip` + `-neutral/-info/-warn/-error/-success` | 步进提示分级 |
| `.wb-check-row` | 清单行；checked → accent inset |
| `.wb-node-card` | 节点选择卡 |
| `.wb-chip` | 步骤/筛选 pill |
| `.wb-draft-area` | 等宽草稿区 |
| `.wb-inset` | 同心内嵌槽 |

**同视口最多一条 sticky tip；blocker 不得落折线以下。**

### DS-COMP-MID · Pipeline / nodes / docket（`mid-*`）

| 类 | 用途 |
|----|------|
| `.mid-node-stage` / `-toggle` / `-step` | 案详情节点折叠 |
| `.mid-pipeline-col` / `-card` | 看板列与卡；`data-action` 强调 |
| `.mid-docket-row` / `-cal` | 期限表行/日历卡 + data-state |

### DS-COMP-AGENT · Agent（`agent-*`）

| 类 | 用途 |
|----|------|
| `.agent-picker-card` + tier | Catalog 卡 |
| `.agent-meta-grid` / `-row` | 展开 meta（禁墙字） |
| `.agent-tier-badge` | core / assist / beta |
| `.agent-harness-row` | 列表行 |
| `.agent-aside` / `-section` / `-empty` | 会话右侧栏 |
| `.agent-artifact-*` | 产物面板 / tabs / editor |
| `.confirm-hitl` / `.agent-confirm-reason` / `.agent-confirm-cta` | HITL 确认条 |

### DS-COMP-MISC

- `.flat-card`：会话 transcript 扁卡
- `.confirm-sheet`：遗留底 sheet
- `.badge-fulfillment-self` / `-delegated`：履约模式（亦见 `packages/ui`）

---

## 4. Cross-shell 一致性

### DS-SHELL-01 · 五壳端口与期望

| 壳 | 端口 | 期望 |
|----|------|------|
| mid | `5173` | 完整产品壳：侧栏 + Dashboard / 案件 / 流水线 / Docket |
| workbench | `5174` | 同侧栏语言 + Flow 步进内页 `wb-*` |
| agent | `5175` | 可独立会话面，但 token / btn / 字号阶梯与 mid 一致 |
| ops | `5176` | 轻壳 + `shell-topbar`；**禁止 raw localhost 倾倒** |
| iam | `5177` | 轻壳；调试工具须标 Dev 或诚实横幅，勿扮产品登录完成态 |

### DS-SHELL-02 · 必须一致

- [ ] 同一 `surface-card` / `ui-btn*` / `segmented` / 字号阶梯
- [ ] 侧栏选中：accent-soft + inset accent（或等价 `.list-row-active`）
- [ ] 主 CTA = navy，非紫/靛
- [ ] AppSurfaceLinks / 顶 pill 跳转模式 **单一**（见 DS-FORBID-01）
- [ ] focus-visible 行为一致

### DS-SHELL-03 · 允许差异

- Agent 会话轨布局（聊天气泡 + ConfirmBar）可不同于 mid Inbox 密度
- ops/iam 可为轻量壳，但 **chrome token 不得另起炉灶**

---

## 5. P0 锚点（评估硬门槛）

### DS-DISABLED-01 · 禁用须见原因（P0-2）

闸门 / Persona / 表单未就绪时：

1. 主 CTA **不得**呈现为「无标签死按钮」或仅靠低对比灰暗示坏掉。
2. 旁侧须有可见内联原因：`.agent-confirm-reason`（`data-tone="block"` 用风险红字）。
3. 禁用主钮可用实心底样式（`.ui-btn.agent-confirm-cta:disabled`：`#e2e8f0` 底 + `#1e293b` 字，`opacity: 1`），避免误读为「加载失败」。
4. 当前合法下一步始终有明确文案按钮。

对照：`REVIEW_2026-09-12.md` P0-2 · `REVIEW_P0_RECHECK.md` PASS。

### DS-SCAN-01 · 扫视 chip（P0-1）

SLA / 风险 / 谁该动 **禁止**拼成一条 muted 长串。

使用 `.dash-scan-chips` + `.dash-scan-chip[data-kind]`：

| `data-kind` | 语义 |
|-------------|------|
| `sla` | 期限 / 超 SLA（deadline 色系） |
| `risk` | 风险（risk 色系） |
| `who` | 谁该动（slate） |
| `gate` | 闸门提示（info 蓝） |

结构：`.dash-scan-chip-k`（uppercase key）+ `.dash-scan-chip-v`（tabular value）。次要文对比 ≥4.5:1。

对照：`REVIEW_2026-09-12.md` P0-1 · `REVIEW_P0_RECHECK.md` PASS。

---

## 6. Forbidden · 禁止项

### DS-FORBID-01

| ID | 禁止 | 替代 |
|----|------|------|
| F1 | 随机 indigo / violet / purple-neon | navy CTA + `--color-accent` |
| F2 | 灰墙长文 / catalog 墙字 | `agent-meta-grid`、定义列表、折叠「更多」 |
| F3 | 双跳模式（同入口既开新壳又深链两套） | 单一 AppSurfaceLinks 模式 |
| F4 | `transition: all` | 枚举属性 |
| F5 | `outline-none` 无 focus-visible | `.focus-ring` / 输入 soft ring |
| F6 | 硬阴影 / 霓虹 glow | `--shadow-rest` / `--shadow-elevated` |
| F7 | `border-radius: 0` 产品面 | `--radius-sm` 起 |
| F8 | 产品 chrome 倾倒 raw `localhost` URL | 标签按钮 + `.shell-banner-demo` |
| F9 | 高频交互 stagger | 瞬时或 ≤150ms 色/opacity |
| F10 | 父子同半径 | DS-RADIUS-02 |

---

## 7. Honesty · 演示诚实

### DS-HONESTY-01

- Demo / mock / Phase 0 可用 `.shell-banner-demo`（`#fffbeb` / `#78350f`）诚实标明。
- 空态用 `.ui-empty` 讲清原因与下一步；样机稀数据不可伪装成「已完工看板」。
- **禁止**在产品顶栏/首页堆 raw 调试字符串、cookie dump、无标签深链 URL（ops/iam P2 历史问题）。

---

## 8. 质感安装速查

```
新页面
├─ 底：app-shell-bg / surface-50
├─ 卡：surface-card（外）→ nest-inset / wb-inset（内，同心）
├─ 主按钮：ui-btn ui-btn-primary 或 cta-work
├─ 次按钮：ui-btn-secondary / ghost
├─ 表单：ui-input + focus soft ring
├─ 空：ui-empty
├─ 状态：status-* 或 dash-scan-chip / mid-docket data-state
├─ 数字：tabular
├─ 禁用闸门：按钮 + agent-confirm-reason（DS-DISABLED-01）
└─ 动效：枚举 transition + prefers-reduced-motion
```

**自检（PR 前）**

- [ ] 无 F1–F10
- [ ] 同心圆角算过
- [ ] 扫视字段已 chip 化（若含 SLA/风险/责任人）
- [ ] 禁用主路径有内联原因
- [ ] 五壳抽检侧栏/按钮/卡语言一致

---

*只文档；业务 `.tsx/.ts` 未改。Token 以 `src/index.css` 为准，本文过时以 CSS 为准并应回写本文件。*
