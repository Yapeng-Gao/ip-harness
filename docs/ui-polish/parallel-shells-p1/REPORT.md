# parallel-shells-p1 · AI / AD P1 交付报告

| 项 | 值 |
|----|-----|
| **分支** | `dev` @ `45ef602` |
| **权威** | `REVIEW_parallel_shells.md` · DESIGN_SYSTEM DS-DISABLED-01 / HABIT-03/05 / DS-COMP |
| **范围** | **仅** `apps/ai-infra` · `apps/ai-data`（未改 mid/wb/agent/ops/iam · doc-harness · Persona/HITL/STEPS） |
| **证据** | `docs/ui-polish/parallel-shells-p1/` ≡ `.ui-evidence/parallel-shells-p1/` |
| **日期** | 2026-09-13（Asia/Shanghai） |

---

## 1. 改了什么（按评估 ID）

### P1

| ID | 改动 | 文件 |
|----|------|------|
| **AI-P1-1** | Loadtest：`endpoints.length===0` 时「开始压测」禁用 + 内联理由「请先部署端点」+ `Link`→`/endpoints`（`.agent-confirm-reason`，非仅 opacity） | `apps/ai-infra/src/pages/LoadtestPage.tsx` |
| **AI-P1-2** | `EmptyState` 支持 `action`；Models「去注册模型」聚焦表单；Endpoints「去部署端点」+「去注册模型」 | `apps/ai-infra/src/components/ui.tsx` · `ModelsPage.tsx` · `EndpointsPage.tsx` |
| **AD-P1-1** | Exports 空态「去申请导出单」；Sources IngestJob 空态「去数据源拉取」 | `apps/ai-data/src/components/ui.tsx` · `ExportsPage.tsx` · `SourcesPage.tsx` |
| **AI-P1-3** | 主路径统一 `ui-btn*` + `btn-press` + `focus-ring`；新增 `Button`；ConfirmDialog / 各页按钮迁移 | `apps/ai-infra/src/components/ui.tsx` + pages（Jobs/Gpus/Pipelines/Alerts/…） |
| **AD-P1-2** | `Button` 统一为 `ui-btn ui-btn-sm btn-press focus-ring`；侧栏 `focus-ring` | `apps/ai-data/src/components/ui.tsx` · `AiDataShell.tsx` |

### P2（择机）

| ID | 改动 | 文件 |
|----|------|------|
| **AI-P2-1 / AD-P2-1** | 顶栏/告警深链文案去 raw localhost：标「运维面」「训推面」（`title` 保留 URL） | `AiInfraShell.tsx` · `AiDataShell.tsx` · `AlertsPage.tsx` |

### 刻意未做

- 未改五壳 / doc-harness / contracts / Persona / HITL / STEPS
- 未动他人脏工作树（doc-harness · ai-infra state 种子以外的未提交态）
- AD-P2-2「按钮 disabled」文案未扩围

---

## 2. 截图

| 文件 | 覆盖 |
|------|------|
| `ai-loadtest-disabled-reason.png` / `-card.png` | AI-P1-1 禁用理由 + 去端点 |
| `ai-models-empty-cta.png` / `-block.png` | AI-P1-2 去注册模型 |
| `ai-endpoints-empty-cta.png` / `-block.png` | AI-P1-2 空端点 CTA |
| `ad-exports-empty-cta.png` / `-block.png` | AD-P1-1 去申请导出单 |
| `ad-sources-empty-cta.png` / `-block.png` | AD-P1-1 去数据源拉取 |
| `ai-infra-chrome-ops-label.png` | P2 运维面标签 |
| `ai-data-chrome-labels.png` | P2 训推面 / 运维面 |
| `ad-focus-ring-tab.png` | AD-P1-2 键盘 focus-ring（侧栏） |

> 空态截图曾临时清空 seed 仅供取证，**已恢复**正式种子；生产路径仍为 `endpoints.length===0` / 列表为空时渲染。

---

## 3. 怎么验

```bash
# 训推 :5179
打开 /loadtest，临时清空端点（或改 seed 后刷新）→ 开始压测禁用旁见「请先部署端点 · 去端点」
打开 /models · /endpoints 在空列表时见次级 CTA
Tab 遍历主按钮 / 侧栏 → focus-visible 环可见
顶栏深链仅「运维面」，无 http://localhost:5176 字面

# 数据 :5181
/exports 空列表 →「去申请导出单」；/sources IngestJob 空 →「去数据源拉取」
顶栏「训推面」「运维面」
```

```bash
npm run typecheck -w @ip/ai-infra -w @ip/ai-data
```

---

## 4. Typecheck

`@ip/ai-infra` · `@ip/ai-data`：**green**（本单提交前已跑）

---

## 5. Git

见 commit message：`ui(parallel): AI/AD P1 loadtest reason, empty CTA, focus-ring`  
**push SHA**: `45ef602382db183046f8d4e49b3f23f54461d37f`

---

## 6. Blockers

无。
