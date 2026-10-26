# 三 Skill 全量评估 · main-path-v3

- **日期**：2026-10-26（Asia/Shanghai）
- **原型**：`docs/prototype/main-path-v3/` @ `127.0.0.1:8767`
- **范围**：site / login / 首页 / 项目（列表·资产·客户）/ 部门（花名册+工作室）/ 工作台（协同·文书）/ 壳（顶栏·侧栏·toast·modal）
- **Skill**：`apple-design` · `make-interfaces-feel-better`（full）· `web-design-guidelines`（Vercel command.md 当日拉取）
- **约束**：禁改 v2；本轮另做「高知识 / 文字工作者」配色（去橙皮）；不扩功能
- **方式**：先评后改；对照 `App.tsx` + `App.css` + `index.css`

---

## 总评

Kimi 迁入的 v3 信息架构（三 tab：首页/项目/部门）与权利形成叙事比欢迎卡三帧更贴客户目标；但视觉仍是 **橙主色经营皮**（`--accent` hue≈39、`--site-orange:#ff5e30`、整段橙底 workflow），对文字工作者偏吵、对比层级被饱和色抢走。交互基线部分到位（`:focus-visible`、mode 已有 `aria-pressed`、toast `role=status`、reduced-motion 全局短路、无 `transition:all`），但 **热区普遍 <40、按压 scale 0.98、角色切换/登录身份缺 pressed、表单缺 name/autocomplete、metric 数字缺 tabular**。

**Verdict：`Needs changes`**

（无 Block；配色属产品气质 P0；a11y/热区多项 MEDIUM。）

---

## 配色诊断（先于组件）

| 位置 | 现状 | 问题 |
| --- | --- | --- |
| `App.css:11-13` | `--accent` 橙高饱和 | 主 CTA / tab 下划线 / 头像 / glyph 全染橙 |
| `index.css:13,25` | `--primary` / `--ring` `22 100% 48%` | shadcn 主色仍橙 |
| `App.css:998+` | `--site-orange` + `.site-workflow` 整段橙底 | 官网像营销运营站，非学术编辑台 |
| `status-orange` | 与品牌橙同色相 | 状态点与品牌色混淆 |

**目标气质（本轮落地）**：浅纸底、深墨字、细线分区；主交互用墨/石板；饱和色仅作克制状态点（成功绿 / 警告琥珀 / 危险红）。勿暗色 OS 皮；勿抄回 v2 验收路径。

---

## 逐页表

| 页 | apple | feel-better | web-guidelines | 最严重问题 | 优先级 |
| --- | --- | --- | --- | --- | --- |
| **壳 topbar/sidebar** | 材料轻边框 OK；橙 active 抢视线 | `.icon-btn` 34、`.search-trigger` 32、mode pad 矮；scale 0.98 | mode 有 pressed ✓；role 无 pressed；无 skip-link | 热区 + 橙强调 + role ARIA | **P0** |
| **site 官网** | 大标题 tracking 偏紧可接受；橙整段 workflow 过吵 | 主钮 43 够；站点橙皮 | nav 用 button 锚点 OK；无 skip | 去橙 → 墨/石板学术气质 | **P0** |
| **login** | 双栏清晰 | 主钮够大 | 身份按钮无 `aria-pressed`；缺 radiogroup | 身份状态不可宣告 | **P0** |
| **首页 home** | 委托入口清晰；消息收次区对 | lead 建议 chip 热区极小；metric 数字无 tabular | lead input 有 aria-label ✓；缺 name | 数字 tabular + chip 热区 | P1 |
| **项目 projects/clients/assets** | 列表/对象筛选清楚 | filter/按钮热区偏矮；进度条 OK | filter 无 pressed；搜索缺 label 关联 | filter `aria-pressed` | P1 |
| **部门 studio** | 花名册+工作室同页对规格 | studio tab 热区矮；toggle 有 role=switch ✓ | 配置表单缺 name | tab pressed + 表单 name | P1 |
| **工作台 workbench** | 双视图空间一致；确认两步清楚 | send-btn 25×25；file-tree 33；footer btn 32 | compose textarea 无 name；确认破坏动作有 disabled 门闩 ✓ | 发送热区 | **P0** |
| **messages（若仍可达）** | 已并入首页；独立 view 残留 | — | thread input 无 label | 残留页可后清 | P2 |
| **modal 族** | Escape/焦点 OK | 主次钮清晰 | 多数 input 缺 `name`/`autocomplete`；new 表单必填有 | 表单属性 | P1 |
| **toast** | — | — | `role=status` ✓ 缺 `aria-live` | 补 aria-live | **P0** |

---

## P0 / P1 表

### P0（本轮应修）

| # | 项 | 依据 | 建议 |
| --- | --- | --- | --- |
| 1 | **橙主色 / 站点橙皮** | 高知识气质；apple Purpose / 文字可读 | token：accent→墨石板；site-orange→forest/ink；primary CTA 改墨或极低饱和石板 |
| 2 | **热区 <40** | feel-better Minimum hit area | `.btn`≥40；`.icon-btn`≥40；`.search-trigger`≥40；`.mode-switch`/`.role-switch` min-height≥36→40；`.send-btn`≥40 |
| 3 | **按压 scale 0.98** | feel-better Scale on press = 0.96 | `.btn:active` → `scale(0.96)` |
| 4 | **role-switch / login 身份无 aria-pressed** | web Accessibility | 与 mode-switch 对齐写 `aria-pressed` |
| 5 | **toast 缺 aria-live** | web Async updates | `aria-live="polite"` |

### P1（可顺手或下轮）

| # | 项 | 建议 |
| --- | --- | --- |
| 1 | metric / 进度数字 | `tabular-nums` |
| 2 | 表单 `name` / `autocomplete` | lead、new、task、expert、compose |
| 3 | object-filter / studio-tabs `aria-pressed` | 与 mode 一致 |
| 4 | `.text-btn` / lead-suggestions 热区垫高 | min-height 或伪元素 |
| 5 | skip-link | 壳层一条「跳到主内容」 |
| 6 | status tone 与品牌色解耦 | `status-orange` 视觉改为克制琥珀（类名可暂留） |

### P2

- 无 skip-link（若 P1 未做）
- messages 独立 view 清理
- 日期硬编码未走 Intl（演示静态可接受）
- 官网大段营销字号在窄屏的 balance

---

## apple-design 要点

- **Purpose**：橙经营皮与「文字工作者编辑台」目的不符 → 配色 P0。
- **Agency / Familiarity**：三 tab 命名清楚；确认两步 + 不自动递交对。
- **Craft**：focus-visible 有；材料以线分区为主（学术感友好）；勿引入重玻璃暗皮。
- **Reduced motion**：已有全局 reduce 短路 ✓；按压缩放仍建议在 reduce 下显式 `transform:none`（当前靠 duration≈0，可接受）。

## make-interfaces-feel-better 要点

- Hit area / Scale on press / Tabular nums → 见 P0/P1。
- 无 `transition: all` ✓。
- Font smoothing 在 `index.css` body 已 antialiased ✓。
- 标题可补 `text-wrap: balance`（home h1）— P2。

## web-design-guidelines 要点

- Icon-btn 多数有 aria-label ✓；部分 sidebar 关闭等需核对。
- Buttons for actions ✓（少见伪链）。
- Form labels：modal 用 label 包裹 ✓；缺 name/autocomplete。
- Focus：有 focus-visible 替代 ✓。
- Toast：补 aria-live。

---

## 本轮改动边界（评完即改）

1. 全局 / 站点色 token → 高知识墨石板纸感  
2. P0 热区 + scale 0.96 + role/login pressed + toast live  
3. 顺手：metric tabular、status-orange 改克制琥珀、object-filter/studio-tabs pressed（若成本低）  
4. **不**改 IA/功能；**不**动 v2

---

## Verification（改后）

- [x] 8767 预览截图：`V3-site.png` / `V3-login.png` / `V3-home.png` / `V3-projects.png` / `V3-departments.png`
- [x] 活验：`--accent` = `oklch(0.32 0.028 255)`；主钮背景墨色；页面无 `#ff5e30`；mode 热区 40、`aria-pressed` 齐全
- [x] commit，勿 push（见回报 sha）

**改后 Verdict（配色+P0）**：Needs changes → 配色与 P0 已收；剩余 P1（skip-link、部分 chip 文案热区、表单 name 全覆盖）可下轮。
