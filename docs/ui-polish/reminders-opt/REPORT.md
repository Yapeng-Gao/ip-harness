# reminders-opt · 提醒/状态 UX 交付报告

| 项 | 值 |
|----|-----|
| **分支** | `dev` @ `7101c33`+（未 push） |
| **权威** | `REVIEW_REMINDERS_2026-09-12.md` · `DESIGN_SYSTEM` DS-STATUS / DS-UX-HABIT / DS-HONESTY / DS-COMP-TOAST / DS-DISABLED |
| **范围** | 视觉·文案·排序·布局；**未改** Persona / HITL / STEPS 闸门 enforcement |
| **证据** | `docs/ui-polish/reminders-opt/` ≡ `.ui-evidence/reminders-opt/` |
| **日期** | 2026-09-12（Asia/Shanghai） |

---

## 1. 改了什么（按评估 ID）

### P0 · 强制

| ID | 改动 | 文件 |
|----|------|------|
| **R-P0-1** | Docket「提醒」→「记录提醒」+ 诚实后缀「演示通道 · 无真推送」；成功反馈改 `.ui-toast` + **`.ui-toast-info`**（非 emerald 已送达）；文案「已记录提醒 · 无真推送（演示通道）」；已提醒 chip 用 pending token（非成功绿） | `src/pages/Docket.tsx` · `src/utils/docketEscalate.ts` · `packages/app-state/.../AppContext.tsx` · `src/index.css` |
| **R-P0-2** | 只读 Persona（发明人/委员）页顶 + 行内 `.agent-confirm-reason` 可见禁用理由；禁用 CTA 不再只靠 `title` | `src/pages/Docket.tsx` |
| **Inbox 紧迫序** | `inboxUrgencyBand`：overdue / 超 SLA / at_risk = band `0`（压过普通 Agent）；due_soon / reminded / escalated = `1`；Agent/工作台 = `2`。reminded 逾期不再因升阶 boost 沉到 Agent 之后；`who=已提醒 · 待升级` 保留 | `src/utils/opsInbox.ts`（sort only） |
| **SLA ScanChip 危急色** | 已逾期/超 SLA → `data-kind="risk"`；即将到期 → `deadline`；不再一律 amber `sla` | `src/pages/Dashboard.tsx` · `src/index.css` |
| **Docket CTA 收敛** | 紧急行：主 CTA「下一步」+ 阶梯当前步 +「更多」（办结/案件）；非紧急：下一步 + 当前步 + 办结/案件 | `src/pages/Docket.tsx` |

### P1 · 机会项（已做）

| ID / 原清单 | 改动 |
|-------------|------|
| **R-P1-5** toast 统一 | Docket 与 WB 同构：`fixed right-6 top-6` + `.ui-toast` / success·error·**info** |
| Handoff tip 去重 | `inlineError` 与底栏复述二选一 | `HandoffActionBar`（src + apps/workbench） |
| Dashboard banner | 去掉冗余 `TenantBanner`（组织已在 dash-board-head）；阻塞横幅仅留 `BillingHold`（≤1） |
| Settings 通知诚实 | 「未实现 · 不接真推送；Docket 记录提醒仅本地演示」 | `Settings.tsx` |
| Prosecution tip | 唯一 `WbStickyTip`；内联缺口降级 muted「详见上方」 | apps + src ProsecutionFlow |

### 刻意未做

- 未改 `ladderNextActions` / `canEscalateStatus` / HITL / Persona 闸语义
- 未开 Cloud Agent；未 push
- Confirm 多理由折叠（R-P1-3）、ops 告警深链（R-P1-4）未本单扩围
- 无假「已送达」通知通道

---

## 2. 截图

| 文件 | 覆盖 |
|------|------|
| `mid-docket-remind-toast-after.png` | R-P0-1 info toast / 已提醒诚实态 |
| `mid-docket-list-after.png` | 紧急行「下一步」+ 阶梯步 +「更多」 |
| `mid-docket-persona-readonly-after.png` | R-P0-2 内联只读理由 |
| `mid-dashboard-next-inbox-after.png` | 优先办理紧迫序 + SLA risk chip |
| `mid-dashboard-inbox-chips-after.png` | Inbox ScanChip risk/deadline |
| `mid-settings-notify-after.png` | 通知入口未实现诚实 |
| `wb-prosecution-sticky-after.png` | 唯一 sticky tip |

---

## 3. 怎么验

```text
http://127.0.0.1:5173/docket
  · 点「记录提醒」→ 右上 info toast「已记录提醒 · 无真推送（演示通道）」
  · 紧急行仅「下一步」+ 当前阶梯 +「更多」
  · Persona→发明人：页顶/行内可见「只读 · 不可提醒…」

http://127.0.0.1:5173/
  · 「下一步·优先办理」应为逾期/超SLA/at_risk（非普通 Agent 压顶）
  · ScanChip：已逾期/已超=rose risk；即将到期=deadline 橙

http://127.0.0.1:5173/settings#notify  · 「未实现」诚实文案
http://127.0.0.1:5174/workbench/prosecution/c1  · sticky tip ≤1
```

---

## 4. Typecheck

```text
npm run typecheck -w @ip/mid        # green
npm run typecheck -w @ip/app-state  # green
npm run typecheck -w @ip/workbench  # green
```

---

## 5. Blockers

- 无功能 blocker。
- 取证前 mid Vite 曾缓存旧 transform；已重启 `apps/mid` 后验收通过。若本地仍见旧「提醒」绿 toast，重启 mid dev server。

---

*未 push；未改闸门 enforcement。*
