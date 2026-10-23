# 工作稿 · 实现债清单（docs 记录 · 不改 apps）

> **日期**：2026-10-23（Asia/Shanghai）  
> **纪律**：只列路径与冲突；**本轮不改** `apps/**` / `packages/**` 行为（除非日后单独立项）。  
> **业务口径**：FTO=01b 条件触发、不堵申请；查新=01 业务必经。见 [business-spine §1.3](../business-spine.md)、[01](../nodes/01-research.md)、[01b](../nodes/01b-fto.md)。

---

## 1) P0 · `research_report` 强制 FTO 齐套项

| 项 | 内容 |
|---|---|
| **冲突** | 文档：提交查新报告**不要求** FTO。代码：`fto` 仍在 `REQUIRED_BEFORE_SUBMIT.research_report` |
| **路径** | `packages/domain/src/handoff.ts`（约 L93–101，`id: 'fto', label: 'FTO 初评风险已选'`） |
| **连带** | workbench ResearchFlow 步骤含「FTO 初评」（见 archive `14-flow-research.md`）；agent 查新剧本与 `expert-fto` 辅席并存，易让用户以为申请前必做 FTO |
| **建议修复**（另案） | 将 `fto` 从 `research_report` 必填移除或改为 `optionalChecks`；FTO 走独立产物/01b 壳；更新任何依赖「七项全齐」的测试与文案 |
| **验收** | 无 FTO 字段亦可 `submit` `research_report`；有 FTO 时不堵、可附件 |

## 2) P1 · 前段提案键未进 contracts

| 键 | 席位 | lifecycle | 现状 |
|---|---|---|---|
| `inspire_brief`（名示意） | `expert-inspire` | [Ni](../nodes/Ni-inspire.md) | 提案键；非 `HandoffArtifactKey` |
| `mining_pack` | `expert-mining` | [Nm](../nodes/Nm-mining.md) | 同上；honesty≠立项 |
| 捕获入池 | （无席专键） | 并入 Nm/00 | 无键 |

**路径旁证**：`apps/agent/src/projects/patentMidMap.ts`；`expertsPatent.ts`；`docs/architecture/inspire|mining/`。

**建议**：要么登记为轴外 handoff 键并写齐套清单，要么产品明确「永不进七态、仅事件日志」并在 10 保持现状说明。

## 3) P1 · 样机 ResearchFlow 五步捆 FTO

| 项 | 内容 |
|---|---|
| **路径** | `apps/workbench/src/flows/research/ResearchFlow.tsx`（归档精读 [14](../archive/flow-reads/14-flow-research.md)） |
| **建议** | UI 将 FTO 初评改为可选步/外链 01b 或 `apps/fto`；与 handoff 齐套修复同一 PR |

## 4) P2 · 其它旁证（未深改）

| 信号 | 路径 | 说明 |
|---|---|---|
| `ARTIFACT_FOR_STAGE.pre_research → research_report` | `packages/contracts/src/handoff.ts` | 正确；勿把 FTO 并进该映射 |
| `expert-fto` 默认不写案 | `apps/agent/src/projects/expertsPatent.ts` / pack `ftoDepth.ts` | 与 01b 辅席一致，保留 |
| stage SKU `research_report: 'research'` | `apps/workbench/src/lib/stageSku.ts` | 命名层；不强制 FTO |
| guardrails 对 research_report | `packages/domain/src/guardrails.ts`；`packages/app-state/src/AgentContext.tsx` | 改齐套时回归 |

## 5) 明确本轮不做

- 不改 `REQUIRED_BEFORE_SUBMIT`  
- 不改 ResearchFlow / agent 剧本  
- 不新增 contracts 键  

文档侧已在 [10](../nodes/10-handoff-state-machine.md) §1.2、[industry-reality](../industry-reality.md) 01/01b、本审计工作稿标明债。
