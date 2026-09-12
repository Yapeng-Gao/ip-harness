# Review P0 — Dashboard 次要文 / Agent Confirm 禁用理由

## 1. 改了什么

### P0-1 · mid Dashboard `/`
- `src/pages/Dashboard.tsx`：优先条与 Inbox 副信息改为 **SLA / 风险 / 谁该动** 独立 chip（`dash-scan-chip`）；subtitle 不再整行 muted 倾倒；残留说明（如 Watch · 待处理）单独成行。
- `src/index.css`：次要文 `#3f3f46`（相对卡面白 ≥4.5:1）；chip 按 kind 着色（SLA 橙 / 风险玫 / 谁该动 石板）。
- **未改** Persona 过滤、`buildOpsInbox` 数据语义、深链 `href`。

### P0-2 · Agent 会话 Confirm
- `apps/agent/src/components/session/SessionConfirmBar.tsx` 与 mid 镜像：当前合法下一步始终有标签按钮；禁用时 **内联可见原因**（`agent-confirm-reason`），不再只靠 `title` tooltip。
- 禁用主 CTA 用实心底而非 ghost+opacity，避免读成「坏掉的主按钮」。
- Composer 禁用发送旁同样内联「请先完成上方确认步骤」。
- **未改** HITL / `onGate` / `onHitl` / `gateDisabledReason` / command 语义。

## 2. 截图路径

`docs/ui-polish/review-p0/` 与 `.ui-evidence/review-p0/`（before **未覆盖**）：

| 文件 | 说明 |
|------|------|
| `mid-dashboard-before/after.png` | mid `/` 整页 |
| `mid-priority-bar-before/after.png` | 优先办理条 |
| `mid-inbox-secondary-before/after.png` | Inbox 副行 / chip |
| `agent-confirm-oa-before/after.png` | sess-oa-1 Confirm 禁用理由 |
| `agent-confirm-intake-before/after.png` | sess-intake-1 合法下一步 + 原因 |
| `agent-session-oa/intake-before/after.png` | 会话整页（含 composer 禁用说明） |

## 3. 怎么验

```
http://127.0.0.1:5173/                              # 优先条 + Inbox chip
http://127.0.0.1:5175/agent/sessions/sess-oa-1?focus=hitl
http://127.0.0.1:5175/agent/sessions/sess-intake-1?focus=hitl
npm run typecheck -w @ip/mid
npm run typecheck -w @ip/agent
```

mid 若仍见旧优先条长串，重启 `npm run dev:mid`（共享 `src/` 偶发缓存）。

## 4. 刻意未做

- P1-1 Pipeline 空列、P1-2 Catalog 墙字、P1-3 会话上下文默认展开、P1-4 Docket 态、P1-5 Workbench tip
- 未改 Persona / inbox 计数 / 深链 / HITL 闸判定
- 未 push；未开 Cloud Agent

## 5. typecheck

`npm run typecheck -w @ip/mid` — **PASS**  
`npm run typecheck -w @ip/agent` — **PASS**

## 6. blockers

无功能 blocker。mid Vite 对共享 `src/` 需重启才稳定吃到 Dashboard chip。
