# 提醒体系短评 · REVIEW_REMINDERS_2026-09-12

| 项 | 值 |
|----|-----|
| **评审方** | UI评估助手（只评不改） |
| **HEAD** | `7101c33` |
| **范围** | Docket 提醒/逾期轨 · Dashboard SLA·风险 chip · WbStickyTip · Agent Confirm 禁用理由 · ops 告警样机 |
| **对照** | `DESIGN_SYSTEM` DS-STATUS-01 · DS-COMP-TOAST · DS-DISABLED-01 · DS-UX-HABIT-01/03/04/05/06 · DS-HONESTY-01 |
| **总评** | **Conditional**（提醒信任与反馈层未齐；无新 HITL/契约 P0） |
| **证据** | `unify-p1/mid-docket-after.png` · `review-p0/mid-*-after` · `unify-p1/wb-*-tips` · `review-p0/agent-confirm-*` · `wave3/ops-home-after.png` + 代码抽检 |

---

## 现状一句话

状态色与 chip/轨（P0/P1 后）**看得见**；用户点「提醒 / 部分通道」时的 **反馈诚实度、主次行动、跨面串联** 仍弱——符合「状态提醒 + 部分提醒体验不行」。

---

## 面别速评

| 面 | 观感 | 主要缺口 |
|----|------|----------|
| **Docket** | 逾期/warn 轨与 chip 合格；阶梯「提醒→升级→风险」逻辑在 | 「提醒」按钮像真通知；toast 一律翠绿成功皮；行内 提醒/办结/办理/案件 同权嘈杂；只读 Persona 仅 `title` |
| **Dashboard chip** | SLA/风险/谁该动可扫（P0） | 「提醒态」与「办理态」未分层；无「已提醒」回执入口，状态提醒停在 chip |
| **WbStickyTip** | intake/research 单 sticky blocker 达标 | 其它 Flow 未全覆盖；与 Confirm/页内 alert 仍可能叠语义（非同槽） |
| **Agent Confirm** | 禁用内联原因达标（P0） | 多条 reason + 橙条 + composer 禁用说明 **同时出现** → 提醒噪音高（HABIT-04 精神） |
| **ops 告警** | 诚实横幅写明非 live | 与 Docket/Inbox SLA **未打通**；配置通道后仅 mock toast，「部分提醒」无统一结果态 |

---

## P0（必须改 · 提醒信任）

### R-P0-1 · Docket「提醒」行动诚实度与反馈皮
- **问题**：按钮文案仅「提醒」；成功 toast 用翠绿手写样式（非 `.ui-toast`），易读成「已真的通知到人」。虽文案有「示意·无真通知」，但 **视觉成功权重压过诚实后缀**；页眉亦写不接真通知，行动区未复述。
- **规范**：DS-HONESTY-01 · DS-COMP-TOAST · DS-UX-HABIT-01/06 · DS-STATUS（remind ≠ success 办理完成）
- **验收**：
  1. 主行动文案含诚实后缀或二次确认微文案（如「记录已提醒 · 无真推送」）；
  2. 反馈用 `.ui-toast` + **info/pending 语义**（非 success 绿默认），`aria-live` 保留；
  3. 行上「已提醒」态 chip 用 DS-STATUS pending/deadline，不用 emerald「办结成功」皮。
- **URL**：`http://127.0.0.1:5173/docket` · 点即将到期/逾期行「提醒」

### R-P0-2 · 只读/不可写时「提醒」禁用理由不可见
- **问题**：`docketWriteBlocked` 时按钮 `disabled` + 仅 `title` tooltip，无内联原因（与 DS-DISABLED-01 / Confirm 已达标路径不一致）。
- **规范**：DS-DISABLED-01 · DS-UX-HABIT-03
- **验收**：不可写时行内或条上可见原因（如「当前 Persona 只读 · 不可提醒」）；禁止只靠 hover title。
- **URL**：换只读 Persona 后打开 `/docket`

---

## P1（应改 · 体验）

### R-P1-1 · Docket 行内行动同权嘈杂
- **问题**：提醒 / 办结 / 办理 / 案件并排同级，状态提醒与主办理抢焦点（HABIT-01）。
- **规范**：DS-UX-HABIT-01 · DS-COMP-BTN 主次
- **验收**：每行 **一个** navy/主 CTA（通常「办理」）；提醒/升级为 secondary 或「更多」菜单；办结危险/成功分级清晰。
- **URL**：`/docket` 列表「即将到期」

### R-P1-2 · Dashboard「状态提醒」无回执层
- **问题**：SLA/风险 chip 可扫，但「已提醒 / 已升级」不在 Inbox 分层；用户无法从看板确认提醒是否发生过。
- **规范**：DS-SCAN-01 · DS-UX-HABIT-05 · DS-STATUS
- **验收**：Inbox 或优先条对 docket escalate 态有可读标记（chip `已提醒`/`已升级`）或深链回 Docket 聚焦该事件；空提醒态有下一步。
- **URL**：`http://127.0.0.1:5173/` · 提醒后回看板

### R-P1-3 · Confirm 多理由叠噪
- **问题**：闸门缺项 + Persona + Full-check 等多条红字并行，像「提醒轰炸」，削弱单一下一步。
- **规范**：DS-UX-HABIT-04 · DS-DISABLED-01（保留可见，但收敛）
- **验收**：同时最多 **一条** blocker 主因置顶；其余进「还差 N 项」折叠；composer 禁用只复述主因一句。
- **URL**：`http://127.0.0.1:5175/agent/sessions/sess-oa-1?focus=hitl`

### R-P1-4 · ops 告警与业务提醒断裂
- **问题**：ops 写「业务 SLA ≠ 运行时告警、未打通」；用户在 `/config#alerts` 配通道后得 mock 成功，与 Docket「提醒」是两套「部分提醒」。
- **规范**：DS-HONESTY-01 · DS-UX-HABIT-06 · DS-SHELL
- **验收**：ops 告警页增加「业务期限提醒入口」标签按钮 → `/docket` 或看板 Inbox；通道测试 toast 标明 **mock**；禁止暗示已覆盖 Docket 提醒。
- **URL**：`http://127.0.0.1:5176/` · `/config#alerts`

### R-P1-5 · Toast 组件未统一
- **问题**：Docket 手写 emerald toast；CaseDetail 用 `ui-toast`；wb 另有 flow toast → 提醒反馈三套皮。
- **规范**：DS-COMP-TOAST · S1
- **验收**：Docket/提醒类反馈改用 `.ui-toast` / `.ui-toast-error`；success 仅用于真完成（办结/保存），remind 用 info。
- **URL**：`/docket` 提醒与办结对比两条 toast

---

## P2（可缓）

| ID | 问题 | 验收 |
|----|------|------|
| R-P2-1 | WbStickyTip 未覆盖 draft/prosecution/maintain | 关键 Flow 同 HABIT-04 |
| R-P2-2 | 页眉「不接真通知」与按钮区距离远 | 行动区就近诚实徽 |
| R-P2-3 | Watch 告警进 Inbox 与 Docket 升级待办可能双入口 | 文案标明来源 pill |

---

## 建议质感顺序

1. **R-P0-1 + R-P1-5**（提醒反馈诚实 + toast 统一）  
2. **R-P0-2**（只读禁用可见）  
3. **R-P1-1**（行内主次 CTA）  
4. **R-P1-3**（Confirm 主因收敛）  
5. **R-P1-2 / R-P1-4**（看板回执 + ops 串联）

---

## 怎么验（总控）

```
http://127.0.0.1:5173/docket          # 提醒 / 轨色 / toast
http://127.0.0.1:5173/                # chip 与提醒回执
http://127.0.0.1:5174/workbench/intake/c5
http://127.0.0.1:5175/agent/sessions/sess-oa-1?focus=hitl
http://127.0.0.1:5176/config#alerts
```

合入后叫评估短复评：仅 R-P0 + 可选 R-P1；不必重写七维。

---

*只评不改；未开 Cloud Agent；未 push。*
