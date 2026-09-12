# continue-opt · UI 优化续波交付报告

| 项 | 值 |
|----|-----|
| **分支** | `dev` @ `10f1b80`（自 `8e49934` 起含 docs 提交；本单未 commit / 未 push） |
| **权威** | `DESIGN_SYSTEM.md`（DS-DISABLED · DS-UX-HABIT · DS-HONESTY · DS-COMP-TOAST）· `REVIEW_REMINDERS_2026-09-12.md` · `REVIEW_REMINDERS_RECHECK.md` · `REVIEW_DEEP_2026-09-12.md` P2 |
| **范围** | 视觉 · 文案 · 布局 · 排序；**未改** Persona / HITL / STEPS 闸门 enforcement |
| **证据** | `docs/ui-polish/continue-opt/` ≡ `.ui-evidence/continue-opt/` |
| **日期** | 2026-09-12（Asia/Shanghai） |

---

## 1. 改了什么（按评估 ID）

### P1 · 必须

| ID | 改动 | 文件 |
|----|------|------|
| **R-P1-3** | Confirm 多理由收敛：收集闸/数据/Persona 等禁用文案 → **一条主因**置顶 + 「还有 N 条」展开；去掉按钮旁并行红字与底栏叠噪；composer 禁用文案**只复述主因** | `apps/agent/.../SessionConfirmBar.tsx` · `SessionComposer.tsx` · `AgentSessionWorkspace.tsx`（`src/components/agent/...` 同步）· `src/index.css`（`.agent-confirm-more*`） |
| **R-P1-4** | ops 告警样机增加「业务期限提醒入口」标签钮 → **期限 Docket** / **中台 Inbox**（产品文案，无 raw localhost）；总览深链去 URL 倾倒；通道试发 toast 标明 **mock**；Monitor 同改标签钮 | `apps/ops/.../AlertNotifyPanel.tsx` · `OverviewPage.tsx` · `MonitorPage.tsx` · `mockAlerts.ts` |

### P2 · 提醒复评 + 深评抽样

| ID | 改动 |
|----|------|
| **Remind P2**（Inbox 组序/权重） | Inbox 分组按组内最小 `sortKey` band 排序；期限段优先于 Agent；`.dash-inbox-group-label-urgent` 抬高「期限与监控」视觉权重 | `src/pages/Dashboard.tsx` · `src/index.css` |
| **Deep P2-3** | 「Phase 0 · monorepo」默认隐藏；仅 `VITE_SHOW_PHASE0=true` 时软显「dev · 多应用」 | `packages/ui/src/AppSurfaceLinks.tsx` |
| **Deep P2-4** | 长案名 `truncate` + `title`（Inbox / 优先条 / 交底 / 案件库） | `Dashboard.tsx` · `CaseLibrary.tsx`（Pipeline 卡已有） |
| **Deep P2-1** | IAM 存储/cookie 区标 **Dev tools** / Dev 徽，强调非产品登录完成态 | `apps/iam/src/pages/IamHome.tsx` |
| **Deep P2-2** | ops 深链 raw localhost → 由 **R-P1-4** 覆盖 |

### 刻意未做

- 未改 Persona / HITL / STEPS / `gateDisabledReason` / `ladderNextActions` 等闸语义与 enforcement
- 未开 Cloud Agent；**未 push**
- 未接真邮件/短信/Webhook；未暗示 ops 通道覆盖 Docket「记录提醒」
- R-P1-1/2 等其它提醒 P1、深评 P1-A～F 不在本单

---

## 2. 截图（AFTER）

| 文件 | 覆盖 |
|------|------|
| `agent-confirm-oa-collapsed-after.png` | **R-P1-3** 主因 + 「还有 3 条」 |
| `agent-confirm-oa-expand-after.png` | **R-P1-3** 展开其余理由 |
| `agent-composer-primary-after.png` | **R-P1-3** composer 仅复述主因 |
| `ops-home-deeplinks-after.png` | **R-P1-4** 总览标签深链（无 raw URL） |
| `ops-alerts-biz-entry-after.png` | **R-P1-4** 业务期限提醒入口 |
| `ops-alerts-mock-toast-after.png` | **R-P1-4** 试发 toast 含 mock |
| `mid-dashboard-inbox-weight-after.png` | **Remind P2** 期限段置顶 + urgent 标签 |
| `mid-phase0-badge-after.png` | **P2-3** Phase0 徽默认不可见 |
| `iam-devtools-after.png` | **P2-1** Dev tools 标注 |
| `mid-cases-truncate-after.png` | **P2-4** 案件库 truncate+title |

---

## 3. 怎么验

```text
http://127.0.0.1:5175/agent/sessions/sess-oa-1?focus=hitl
  · Confirm：仅一条主因；「还有 N 条」可展开
  · 底栏 composer：「确认完成后再办理」旁文案 = 主因（非泛化「请先完成上方确认步骤」）

http://127.0.0.1:5176/
  · 「业务期限提醒 · 深链中台」：期限 Docket / 中台 Inbox 标签钮；无 localhost 全文倾倒
http://127.0.0.1:5176/config#alerts
  · 「业务期限提醒入口」→ Docket / Inbox
  · 「总控试发」toast 含「mock」

http://127.0.0.1:5173/
  · Inbox 首组为「期限与监控」（有 overdue/超 SLA 时），标签 urgent 样式
  · 顶栏无「Phase 0 · monorepo」（除非 VITE_SHOW_PHASE0=true）

http://127.0.0.1:5177/  · Dev tools 徽与存储约定区
http://127.0.0.1:5173/cases  · 长标题 truncate，hover title 全文
```

---

## 4. Typecheck

```text
npm run typecheck -w @ip/mid      # green
npm run typecheck -w @ip/agent    # green
npm run typecheck -w @ip/ops      # green
npm run typecheck -w @ip/iam      # green
npm run typecheck -w @ip/ui       # green
```

---

## 5. Blockers

- 无功能 blocker。本机 mid Vite 曾短暂缓存旧 `Dashboard.tsx`，重启 `5173` 后 Inbox 组序/权重生效；证据已按重启后 DOM 重拍。
- 未 push（按硬规则 prefer no push）。

---

*质感助手交付；未改闸门语义；未开 Cloud Agent；未 push。*
