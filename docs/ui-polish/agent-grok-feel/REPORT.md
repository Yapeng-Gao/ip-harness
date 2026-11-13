# Agent Grok Feel 抛光 · REPORT

| 项 | 值 |
|----|-----|
| **分支** | `dev` |
| **基线 HEAD** | `7ea0a16`（结构已 Pass · `AGENT_GROK_LIKENESS.md`） |
| **范围** | `GeneralGrokShell` · `GeneralBotSidebar` · `GeneralBotChatPane` · `agent.css`（general-grok\*） |
| **禁扩** | 项目/HITL 壳 · DomainCommand · mid 链 · BillingHold |
| **Skills** | apple-design · make-interfaces-feel-better · web-design-guidelines |
| **活口** | `http://127.0.0.1:5175/agent` · 1440×900 |
| **时区** | Asia/Shanghai |

## 改了什么

### 1. Sidebar 选中 / 密度 / 新建
- 选中行：白卡+ring → **accent soft fill** (`#e8f2ff`) + **inset 3px accent rail**（对标 `.list-row-active`）
- 行高：`hit-40` / `min-height: 40`；字号 13；行距 `space-y-1`
- 「新建」→ **「新建对话」**（Grok new-chat 精神）+ `btn-press` + shadow-sm

### 2. Bubbles
- 用户：navy `#0f172a` + 白字 + 右对齐 + 尾角 `18/18/6/18`
- 助手：slate-100 + 弱边 + 左对齐 + 尾角 `18/18/18/6`
- 字号 15 · `leading-[1.55]` · `text-pretty` · 无 tip/角标墙

### 3. Sticky composer
- `sticky bottom-0` 粘底（`stickyGlued=true` · bar.bottom=900=vh）
- 同心壳：`rounded-2xl` outer + `p-1.5` + 内 `rounded-xl` textarea
- 舒适 padding `12/16/14`；`:focus-within` accent 环
- 发送：`btn-press` · hit-40 · 空稿 disabled

### 4. Shell
- 空态 CTA「新建对话」；chrome 钮 `btn-press`

## 证据

| 帧 | 文件 |
|----|------|
| 基线 | `BEFORE-agent.png` · `BEFORE-sidebar.png` · `BEFORE-chat.png` · `BEFORE-composer.png` |
| 选中轨 | `AFTER-sidebar-selected.png` |
| 气泡 | `AFTER-chat-bubbles.png` |
| 粘底 composer | `AFTER-composer-sticky.png` · `AFTER-composer-focus.png` |
| 新建对话 | `AFTER-new-bot.png` |
| 全屏 | `AFTER-agent.png` |
| 测量 | `_before-metrics.json` · `_after-metrics.json` |

## 自点验（可点）

| 检查 | 结果 |
|------|------|
| 选中 soft fill + accent rail | ✅ bg=`rgb(232,242,255)` · inset `#007aff` 3px |
| 行 hit ≥40 | ✅ h=44 · minH=40 |
| 新建对话 prominent + btn-press | ✅ 文案「新建对话」 |
| 用户/助手光学区分 | ✅ navy vs slate-100 · 非对称圆角 |
| sticky 粘底 | ✅ bar.bottom=vh |
| 发送 btn-press | ✅ |
| `npm run typecheck -w @ip/agent` | ✅ |

## 未改 / blockers

- 无 blocker
- 未动项目壳 / HITL / DomainCommand / BillingHold / mid 链
