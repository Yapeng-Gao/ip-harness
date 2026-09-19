# Agent 全壳 · P0/P1 复测关闸 · REVIEW_AGENT_FULL_RECHECK

| 项 | 值 |
|----|-----|
| **评审方** | UI评估助手（只评不改 · 仅 docs/evidence） |
| **对照** | `REVIEW_AGENT_FULL_2026-09-19.md`（基线 No-Go · P0-AF-1 + P1-AF-1…6） |
| **自证** | `AGENT_FULL_FIX_EVIDENCE.md` + `agent-full-evidence/fix/` |
| **HEAD** | `12d39f5`（`dev` · `fix(agent): close Agent full-shell P0/P1 gates (HITL dock, layout)`）· **as-is ✓** |
| **日期** | 2026-09-19（Asia/Shanghai · ~09:53 CST） |
| **运行时** | Vite `http://127.0.0.1:5175` · `/agent` → **200** |
| **方法** | Playwright Chromium 真导航 · `getBoundingClientRect` / testid 测量 · **非**纯读代码 |
| **证据** | `docs/ui-polish/agent-full-recheck/`（PNG + `_recheck-final.json` 等） |
| **ENTRY** | **已 Go · 本复测不重开 P0-AE / P1-AE**；Home 单 CTA 仅作 no-regress 抽检 |
| **本复测总评** | **Go**（P0-AF-1 + P1-AF-1…P1-AF-6 全部 PASS） |

---

## 1. 验收对照表

| ID | 验收要点（摘自 REVIEW） | 复测 | 证据句 |
|----|-------------------------|------|--------|
| **P0-AF-1** | Confirm **单独** sticky ≤~180–200px；Composer/Agent 移出 dock 或默认折叠；轨迹 ≥~480@1440 / ≥~360@1280 | **PASS** | `@1440` dockH=**157** sticky、`session-composer-fold` **foldInDock:false / open:false**、timelineH=**539**；`@1280` dockH=**173**、timelineH=**424**（均达阈）。 |
| **P1-AF-1** | &lt;1440 右栏收缩；中栏 ≥820@1280 | **PASS** | `@1280` asideW=**224**、midW=**832**（≥820）；右栏不再锁 320。 |
| **P1-AF-2** | 壳不滚；仅轨迹列 + 右栏内滚；body 不滚 | **PASS** | `bodyScroll:false`；`html/body/#root` overflow **hidden**；轨迹走 `session-timeline-scroller`。 |
| **P1-AF-3** | 可见禁用原因仅一处 | **PASS** | `.agent-confirm-reason` 可见 **reasonCount:1**（「请先选争点类型并填策略要点」）。 |
| **P1-AF-4** | Confirm/dock ≥ `--radius-md`（12px） | **PASS** | `confirmRadius:12px`；`dockRadius:12px 12px 0 0`。 |
| **P1-AF-5** | Catalog/Harness 默认收起会话列表（compact） | **PASS** | 两页均有 `browse-sidebar-compact`；侧栏 **0** 会话链、文案「收起会话列表」；无完整 Inbox。 |
| **P1-AF-6** | 步进状态名 ≠ 主 CTA 动作名 | **PASS** | 步进 chip「**待批准** / **待授权**」；主按钮 CTA「**批准策略**」。 |

### No-regress（ENTRY · 不重开单）

| 抽检 | 结果 | 证据句 |
|------|------|--------|
| Home 单主 CTA | **OK** | `/agent` 可见「开始办理」**1** 个；无并列「新建会话」主钮（`recheck-06-home-no-regress.png`）。 |

---

## 2. 关键实测（复测）

| 度量 | 1440×900 | 1280×800 | 验收阈 |
|------|----------|----------|--------|
| `.agent-hitl-dock` 高 | **157** | **173** | ≤ ~200 |
| `session-timeline-scroller` 高 | **539** | **424** | ≥480 / ≥360 |
| `.agent-aside` 宽 | **224** | **224** | 1280 不锁 320 |
| 中栏可用宽 | **992** | **832** | ≥820@1280 |
| `bodyScroll` | **false** | **false** | false |
| 可见 `reasonCount` | **1** | **1** | 1 |
| `confirmRadius` | **12px** | **12px** | ≥12 |
| composer fold in dock | **false** | **false** | 不在 sticky Confirm 带内展开 |

对照自证 `_measures-1440-final.json`（dockH=157 · timelineH=539 · reasonCount=1 · bodyScroll=false）与本次 `_recheck-final.json` **一致**。

---

## 3. 门禁

| 门 | 本复测 |
|----|--------|
| **Go** | **是** · 全部 P0+P1 PASS |
| **Conditional Go** | 否（无 P1 残留 FAIL） |
| **仍 No-Go** | 否 |

P2（字阶 10px、transition:all、工具卡英文 id、双跳等）**未纳入本复测关闸范围**，仍可按原 REVIEW §7 P2 择机处理，**不挡 Go**。

---

## 4. 证据索引

目录：`docs/ui-polish/agent-full-recheck/`

```
recheck-01-session-1440.png
recheck-02-dock-closeup.png
recheck-03-session-1280.png
recheck-04-catalog.png
recheck-05-harness.png
recheck-06-home-no-regress.png
recheck-sidebar-*.png
_recheck-final.json
_recheck-measures.json
_recheck-compact.json
_recheck-deep.json
```

先验自证（未改）：`docs/ui-polish/agent-full-evidence/fix/` · `AGENT_FULL_FIX_EVIDENCE.md`

---

## 5. 结论

相对 `REVIEW_AGENT_FULL_2026-09-19.md` 的 **No-Go（P0-AF-1）**，在 HEAD `12d39f5` 实机复测后：

- **P0-AF-1** → **PASS**（Confirm 独粘、dock ≤200、轨迹回半屏级）
- **P1-AF-1…6** → **全部 PASS**
- **ENTRY** 未回退（Home 单 CTA）

**Verdict: Go**

*只文档与证据；未改 apps/contracts；未 git commit/push；未启 Cloud Agent。*
