# ui-opt-next · 残余 P2 视觉续改交付报告

| 项 | 值 |
|----|-----|
| **分支** | `dev` @ `32b7e6d` 之上工作区改动（**未 commit / 未 push**） |
| **权威** | `DESIGN_SYSTEM.md`（DS-SHELL · DS-TYPE · DS-COMP-EMPTY · `.ui-table`）· `REVIEW_CONTINUE_OPT_RECHECK.md` 残余 · Unify P2-5/7 · Deep P2-5 |
| **范围** | 视觉 · 字号/密度 · 次链权重 · 镜像同步；**未改** Persona / HITL / STEPS 闸门 enforcement |
| **证据** | `docs/ui-polish/ui-opt-next/` ≡ `.ui-evidence/ui-opt-next/` |
| **日期** | 2026-09-12（Asia/Shanghai） |

---

## 1. 必须项验收

| ID | 改动 | 裁决 | 证据 |
|----|------|------|------|
| **Unify P2-5** Catalog 次链 | 主 CTA 收敛为「启动」/「试用 · 非闭环」；「稍后关联」仅作 `.agent-picker-card__hint` 弱文，不再与主钮文案重复；「运行说明」「详情」用 `.ui-link-weak` / `.agent-picker-card__details-summary` | **PASS** | `agent-catalog-secondary-after.png` |
| **Unify P2-7** mid 镜像 AgentPicker | `src/components/agent/AgentPickerCard.tsx` 对齐 `apps/agent`：`agent-picker-card` + `agent-meta-grid` + 弱 hint；`AgentTierBadge` 改用 `.agent-tier-badge` token | **PASS** | `mid-catalog-picker-after.png` · `mid-agent-picker-mirror-after.png` |
| **Deep P2-5** 行密度缝 | 会话轨行用 `.agent-rail-row` / `__link` / `title`(footnote) / `sub`(caption+#3f3f46)，对齐 mid Inbox 字号阶梯；空态 `.agent-rail-empty` | **PASS** | `agent-session-rail-density-after.png` ↔ `mid-inbox-density-after.png` |

---

## 2. 另修 ≤3 可见糙点

| # | 项 | 改动 | 证据 |
|---|-----|------|------|
| 1 | 会话轨空态 | 无匹配时 `agent-rail-empty` + 说明 + `ui-btn-sm secondary`「新建会话」 | `agent-rail-empty-or-list-after.png` |
| 2 | wb 年费表挤 | Maintain「年费日程表」→ `.ui-table.ui-table--compact` + inset 圆角容器 | `wb-maintain-table-after.png` |
| 3 | harness 次链噪 | 「全部 Agent / 全部」→ `.ui-link-weak`；行内「稍后关联」弱 hint，主钮去「启动 · 稍后关联」重复 | `mid-agent-picker-mirror-after.png` |

---

## 3. 改动文件

- `src/index.css` — `.ui-link-weak` · `.agent-picker-card__hint` · `.agent-rail-*` · `.ui-table--compact`
- `apps/agent/src/components/AgentPickerCard.tsx`
- `apps/agent/src/components/AgentSessionSidebar.tsx`
- `apps/agent/src/pages/AgentCatalogPage.tsx`
- `apps/agent/src/pages/AgentHarnessOverview.tsx`
- `src/components/agent/AgentPickerCard.tsx`（镜像）
- `src/components/agent/AgentTierBadge.tsx`（镜像）
- `src/components/agent/AgentSessionSidebar.tsx`
- `src/pages/agent/AgentCatalogPage.tsx`
- `src/pages/agent/AgentHarnessOverview.tsx`
- `apps/workbench/src/flows/maintain/MaintainFlow.tsx`
- `src/pages/workbench/MaintainFlow.tsx`
- `scripts/ui-opt-next-shots.mjs`（证据脚本）

---

## 4. 截图（AFTER）

| 文件 | 覆盖 |
|------|------|
| `agent-catalog-secondary-after.png` | Catalog 弱次链 / 去重「稍后关联」 |
| `mid-catalog-picker-after.png` | mid `5173` 镜像 picker |
| `mid-agent-picker-mirror-after.png` | harness 列表 + 弱次链 |
| `agent-session-rail-density-after.png` | 会话轨 footnote/caption |
| `mid-inbox-density-after.png` | mid Inbox 对照密度 |
| `wb-maintain-table-after.png` | 年费表 compact |
| `agent-rail-empty-or-list-after.png` | 轨空态 |

---

## 5. Typecheck

```text
npm run typecheck -w @ip/agent   → PASS
npm run typecheck -w @ip/mid     → PASS
npm run typecheck -w @ip/workbench → PASS
```

---

## 6. 怎么验

```text
http://127.0.0.1:5175/agent/agents
  · 主钮「启动」；其下弱「稍后关联」或「所选案 · …」；无「启动 · 稍后关联」叠字
  · 「运行说明」「详情」为弱链，不抢 CTA

http://127.0.0.1:5173/agent/agents
  · mid 镜像卡：surface + meta-grid + 同弱 hint

http://127.0.0.1:5175/agent/sessions/sess-oa-1
  · 左轨标题 footnote、副文 caption、对比色 #3f3f46

http://127.0.0.1:5173/
  · Inbox 对照同阶梯

http://127.0.0.1:5174/workbench/maintain/c6
  · 年费日程表 ui-table compact
```

---

## 7. 刻意未做

- 未改 Persona / HITL / STEPS / gate enforcement
- 未开 Cloud Agent；**未 push**
- Pipeline 满列种子非本单

---

*视觉-only；证据已写入 docs 与 `.ui-evidence`。*
