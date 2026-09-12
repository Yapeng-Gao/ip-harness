# 并行深演示业务审计 · EVAL parallel deep-demo

> **审计口径**：业务故事 / 屏上 / 代码 三列对照。只评闭环是否站得住、裂缝（带路径）、诚实边界。不写皮肤 polish。  
> **范围**：`apps/doc-harness` · `apps/ai-infra` · `apps/ai-data`（只读业务代码；本文件为评估产出）。  
> **日期**：2026-09-13（CST）· 对照规格：`docs/architecture/{doc-harness,ai-infra/deep-demo,ai-data/deep-demo}` + 各 app README。

---

## 1. 总判

| 壳 | 一句话 | 可深演示？ |
|----|--------|------------|
| **doc-harness** | 提案→Confirm→revision + 批注按 quote 重挂 + 三案/章级 SKU 闸，**主闭环站得住**；命令语义与整案闸演示偏软。 | **可**（主路径 10 分钟能讲完） |
| **ai-infra** | Jobs / drain / 门禁 Pass·Fail / 告警自动追加 **可点**；数据集 version 绑死与「发布→端点」纵深是假闭环。 | **可**（单壳故事完整；跨壳靠种子） |
| **ai-data** | 质量门 fail→publish `blocked` / 按钮 disabled **硬闸成立**；version 不可变 + 同口 LS 写出对齐规格。 | **可**（门禁演示是卖点） |

**总控一句话**：三壳都已从空壳表单升到「可点状态机」；深演示成立，但**别吹跨端口实时同步**，也别把「发布成功」讲成已切真流量 / 已进训推作业真相。

---

## 2. doc-harness 专节

### 2.1 业务故事（应对标）

用户在纸面章节里改稿 → 右栏 mock Agent 出建议 → HITL Confirm → mock `submitClaims` 落 `DocumentRevision` → 中栏正文刷新；批注不丢或 orphan 明示；多案顶栏切换；发明人案「附图」章 locked 演示 SKU 闸。

### 2.2 屏上 vs 代码（闭环是否站得住）

| 面 | 屏上 | 代码锚点 | 判定 |
|----|------|----------|------|
| 提案→Confirm→revision | Agent tab Confirm 置顶；批准后正文变、时间线多一条 agent | `App.tsx` `onConfirm` → `mockDispatch({ type: 'submitClaims' })` → `patchRuntime` 写 chapters/revisions | **站得住** |
| 试运行 | dry-run 预览，不落库 | `proposal.mode === 'dry-run'` / `status: 'preview'`；Confirm 只吃 `formal`+`pending` | **站得住** |
| 批注保真 | 采纳后 Mark 重挂或 orphan 提示 | `lib/annotationFidelity.ts` `reattachOpenAnnotationsByQuote`；`proposedBody` 来自 `mockRewriteChapter`（干净 HTML） | **策略诚实、实现可用** |
| 多案 | 顶栏 CaseSwitcher ≥3 案，runtime Map 隔离 | `seed.ts` `CASES` + `buildCaseBundle`；`App.tsx` `runtimes[caseId]` | **站得住** |
| SKU 闸 | 附图章只读 + 加深 banner；申请开通无真开通 | `seed.ts` `ch-inv-figures.locked`；`ChapterEditor` / `App` 写路径拦 `locked` / `!authorized` | **章级闸站得住**；整案 `authorized:false` **未种种子** |
| 未保存离开 | 顶栏「已自动保存」 | 切章/切案前 `saveDraft`（`App.tsx` autosave） | **站得住** |

**结论**：主演示闭环（撰写稿权利要求：建议→确认→revision→批注）**可深演示**。不是 Word、不是真 LLM、不是 case-core——README 已写清，代码未假装。

### 2.3 裂缝

| 级 | 裂缝 | 路径 |
|----|------|------|
| **P1** | **所有正式采纳一律 `submitClaims`**，含摘要 / OA 要点 / 交底等非权利要求章；命令语义被稀释，落库审计旁注仍写 `claims chapter revision`。讲「形状对齐 DomainCommand」时会被领域专家戳穿。 | `apps/doc-harness/src/App.tsx`（`onConfirm`）· `apps/doc-harness/src/mockDispatch.ts`（`detail` / `MockCommandType`） |
| **P1** | **整案 SKU 闸（`authorized:false`）类型与 UI 已接，三案种子全是 `authorized: true`**；深演示只能靠「附图 locked」讲章级闸，整案拒绝编辑的故事要改种子才看得见。 | `apps/doc-harness/src/seed.ts`（三份 `document.authorized`）· `types.ts` · `ChapterEditor.tsx` |
| **P2** | 批注重挂只做 **HTML 源串精确 `indexOf(quote)`**；quote 一旦被改写模板拆散 / 跨标签，必 orphan。策略对，但「保真」在正式建议路径上**默认走 orphan 演示**多于「重挂成功」——要主动造仍含原 quote 的正文才好看。 | `apps/doc-harness/src/lib/annotationFidelity.ts` · `mockDispatch.ts` `mockRewriteChapter` |
| **P2** | `Document.headRevisionId` 是**文档级单指针**，revision 却是**按章**；任意章保存都会改全局 head，时间线按章过滤——模型语义含混，落地前要拆。 | `apps/doc-harness/src/types.ts` · `App.tsx`（多处更新 `headRevisionId`） |

### 2.4 诚实边界（守住的）

- 无真 LLM / SSO / DSH·Codex / MCP；`mockRewriteChapter` 按章模板，非时间戳包装。  
- DomainCommand **形状对齐**，不入 contracts union、不经 case-core。  
- TipTap Mark ≠ Word 修订 / OT / 多人协同。  
- 内存 runtime；刷新即失。  
- 不改五壳 / `APP_PORTS`。

---

## 3. ai-infra 专节

### 3.1 业务故事（应对标）

选数据集建作业 → 排队调度到非 drain 节点 → 进度/假日志 → 成功或失败（失败自动告警）→ GPU 占用随 running 变 → 模型晋级 Confirm → 端点金丝雀/回滚 → 训推门禁 Fail 阻断发布 → 压测出假报告。

### 3.2 屏上 vs 代码

| # | 面 | 判定 | 锚点 |
|---|-----|------|------|
| 1 | Jobs 状态机 | **站得住**：`queued→running→succeeded\|failed\|cancelled`；失败注入 / 重试 / 假日志 | `state/AiInfraStore.tsx` `tickJobs` / `CREATE_JOB` / `CANCEL_JOB` / `RETRY_JOB` |
| 2 | GPU drain | **站得住**：`findSchedulableNode` 跳过 `drained`；全 drain 则保持排队 | `AiInfraStore.tsx` · `pages/GpusPage.tsx` |
| 3 | 模型晋级 Confirm | **可点**：`registered→staging→canary→prod` + ConfirmDialog；**非**办案 HITL（文案已区分） | `pages/ModelsPage.tsx` · `PROMOTE_REVISION` |
| 4 | 端点金丝雀/回滚 | **可点**：滑杆改 `trafficCanaryPct`；回滚置 0 | `pages/EndpointsPage.tsx` · `SET_CANARY` / `ROLLBACK_ENDPOINT` |
| 5 | Pipeline 门禁 | **站得住**：训练自动过 → eval `blocked` → Pass 才可发布；Fail 终止；可重跑评测 | `pages/PipelinesPage.tsx` · `PIPELINE_GATE` / `PIPELINE_PUBLISH` |
| 6 | Loadtest | **可点**：假 TTFT / tokens/s / errorRate 随并发变 | `computeLoadReport` · `pages/LoadtestPage.tsx` |
| 7 | Alerts | **站得住**：job fail / GPU≥80% `pushAlert` 去重；ack / silence | `pushAlert` / `maybeGpuHighAlert` · `pages/AlertsPage.tsx` |
| 8 | 数据集下拉 | **种子路径站得住**；LS 同口可读；UI 标「种子 · 非跨壳」 | `state/seed.ts` `readPublishedDatasets` · `JobsPage.tsx` |

### 3.3 裂缝

| 级 | 裂缝 | 路径 |
|----|------|------|
| **P0** | **作业只存 `datasetVersionId = 数据集 id`，不存 `version`**。下拉文案是 `name@version`，`<option key/value={d.id}>`。同口 LS 若有同一 `id` 多 version（ai-data 每次 publish 都会 `unshift` 新条目），**React key 冲突 + 选不中具体 version**——字段名还谎称 Version。规格要求「datasetId + version（展示用）」未落地。 | `apps/ai-infra/src/pages/JobsPage.tsx`（select）· `apps/ai-infra/src/state/types.ts` `Job.datasetVersionId` · `AiInfraStore.tsx` `CREATE_JOB` · 对照 `apps/ai-data/src/state/store.ts` `writePublishedToLocalStorage` |
| **P1** | **Pipeline「发布」无领域副作用**：不晋级 model、不部署/切端点、不写 Release。门禁 UI 成立，纵深故事在「发布」处断崖——只能讲「模板跑通」，不能讲「发布即上线」。 | `AiInfraStore.tsx` `PIPELINE_PUBLISH` · `pages/PipelinesPage.tsx` |
| **P1** | **队列与 GPU pool 解耦**：作业可选 `algo-train` / `batch` 等 queue，调度器**完全不看** `GpuNode.pool`，train 可落到 `infer` 池节点。drain 演示仍成立，**队列亲和是装饰**。 | `AiInfraStore.tsx` `findSchedulableNode` · `state/seed.ts` `seedGpuNodes` · `JobsPage` 队列表单 |
| **P2** | 端点金丝雀滑杆未强制另选 canary revision（默认可落到 stable 同 revision）；模型 `stage` 与端点流量**无联动**；规格中的 `rolled_back` 模型态未实现（仅端点 %→0）。 | `EndpointsPage.tsx` · `SET_CANARY` · `types.ts` `ModelStage` |
| **P2** | Loadtest 终态用 `succeeded`，规格写 `report_ready`——小事，别在验收清单抠枚举名。 | `state/types.ts` `LoadTestStatus` |

### 3.4 诚实边界（守住的）

- 横幅与 README：**非真 GPU / K8s / 权重仓 / 推理进程**。  
- 跨端口 **禁止**「自动共享」文案；Overview / Jobs 明确种子契约。  
- 禁 PatentCase / DomainCommand。  
- 告警出站仍 notify，不发 SMTP。  
- 刷新失态（内存 store）。

---

## 4. ai-data 专节

### 4.1 业务故事（应对标）

Sources 拉取 → Pipeline 跑到质量门 → 不达标阻断发布 → 打分 pass 后发布不可变 version（假 checksum）→ 血缘边追加 → LS 写出供同口消费；导出单状态机 → 候选集；Ticket → 回灌 pipeline。

### 4.2 屏上 vs 代码

| # | 面 | 判定 | 锚点 |
|---|-----|------|------|
| 1 | Ingest | **可点**：queued→running→done/fail；raw 计数增加 | `store.ts` `pullSource` · `SourcesPage.tsx` |
| 2 | Pipeline × 质量门 | **硬闸站得住**：quality 步读 `qualityPassFor`；fail → publish=`blocked`；publish 步再双重检查 | `store.ts` `runStepSequence` · `PipelinesPage.tsx` |
| 3 | Quality | **可点**：scoring→pass/fail；强制 fail；findings 标非真引擎 | `runQualityScore` · `QualityPage.tsx` |
| 4 | Datasets 不可变 version | **站得住**：`immutable: true`；UI 发布按钮 `disabled={!canPublish}`；只能 bump 新 tag | `publishNewVersion` · `tryPublishDataset` · `DatasetsPage.tsx` |
| 5 | Recipes | **弱闭环**：保存配比/预览条数，**不喂** pipeline / publish | `saveRecipe` · `RecipesPage.tsx` |
| 6 | Lineage | **站得住**：publish / export-candidate `appendEdge` | `publishNewVersion` · `createCandidateFromExport` · `LineagePage.tsx` |
| 7 | Exports | **可点**：requested→approved→done→候选集（无案正文） | `requestExport` / `approveExport` / `completeExport` / `createCandidateFromExport` |
| 8 | 评测回流 | **可点**：Ticket → 新 pipeline（`fromTicketId`） | `createRefeedFromTicket` · `QualityPage.tsx` |
| 9 | 跨壳写出 | **同口成立**：键名/合并去重/bootstrap 种子 | `writePublishedToLocalStorage` · `bootstrapPublishedLocalStorage` · `types.ts` `PUBLISHED_DATASETS_LS_KEY` / `SEED_PUBLISHED` |

### 4.3 裂缝

| 级 | 裂缝 | 路径 |
|----|------|------|
| **P1** | **质量门按 `datasetId` 全局一票，不绑 version**。种子已有 published version，但 `seedQuality` 全是 `idle`——故事上「历史已发布 vs 当前门禁」说得通，产品上却像「库里有 immutable 版、门却从未 pass」。深演示必须先口头对齐，否则被问「这些 v1.4 怎么出来的」。 | `apps/ai-data/src/state/seed.ts` `seedDatasets` / `seedQuality` · `store.ts` `qualityPassFor` |
| **P1** | **「草稿备注（可改）」屏上只读展示**：`updateDraftNote` 已实现，**无任何页面调用**；「草稿可改 / 已发布不可改」的对比演示缺半截。 | `DatasetsPage.tsx`（仅渲染 `ds.draftNote`）· `store.ts` `updateDraftNote` |
| **P2** | 导出候选 `createCandidateFromExport` **直接造 immutable version**，不经质量门、**不写 LS**（注释「未进种子契约」）。与「发布必须质量 pass」叙事并列时，要讲清「候选 ≠ 契约发布」，否则像后门。 | `store.ts` `createCandidateFromExport` |
| **P2** | Ingest raw 增量 **不进入** pipeline 输入；Recipes **不约束** publish。面齐全，纵深是平行玩具，不是一条DAG。 | `pullSource` vs `runPipeline` · `RecipesPage` |

### 4.4 诚实边界（守住的）

- 横幅：非真 Spark / 湖仓 / PII。  
- 禁 PatentCase；导出无案正文。  
- 跨端口不声称实时同步；README / Overview 与 deep-demo 脚注一致。  
- 内存为主；LS 仅 published 列表同口持久。

---

## 5. 跨壳对照（种子契约 / 口径）

### 5.1 对齐得好的

| 项 | 证据 |
|----|------|
| LS 键名 | 双方均为 `ip.harness.aiData.publishedDatasets`（`ai-infra` `DATASETS_LS_KEY` · `ai-data` `PUBLISHED_DATASETS_LS_KEY`） |
| Shape 最小集 | `{ id, name, version }`；ai-data 可附加 checksum/purpose/…；ai-infra 读时丢弃未知字段 |
| 共享种子同表 | `ds-claims-sft@v1.4` · `ds-eval-hard@v2.0` · `ds-pretrain-mix@v0.9`（`SEED_DATASETS` ≡ `SEED_PUBLISHED`） |
| Origin 诚实 | 双 README + deep-demo 脚注 + Overview 文案：**不同端口不共享 LS**；跨壳靠种子 ID |

### 5.2 打架 / 半拉子

| 级 | 问题 | 说明 |
|----|------|------|
| **P0** | **version 在契约里有、在 Job 绑定里丢了** | ai-data publish 写出多 version 行；ai-infra Jobs 用 `id` 做 value/存储。契约「能列出版本」≠「作业钉死某一 version」。同口联调一发布就踩坑。 |
| **P1** | **「发布」一词三义** | ai-data：dataset version 不可变发布；ai-infra pipeline：门禁后的空发布；ai-infra endpoint：`status: published`。深演示串讲时必须改口，否则听众以为一条链。 |
| **P2** | 候选集进 datasets 但不进契约种子 | 故意；文档已注。对照讲解时标「壳内候选」。 |

**doc-harness 与训推/数据面**：无种子契约交叉（正确）。勿把 doc-harness 的 `submitClaims` 与 ai-infra 晋级 Confirm 混称为同一 HITL。

---

## 6. 建议下一刀（只评建议，不改码）

按冲击排序：

1. **（跨壳 P0）钉死 Job↔dataset version**  
   - 下拉 `value` / 存储改为 `id + version`（或复合键）；展示与持久一致。  
   - 顺手修 `option key` 重复。  
   - Owner：ai-infra（读契约）；ai-data 写出侧已够用。

2. **（ai-infra P1）给 Pipeline「发布」一个最小副作用**  
   - 例如：Pass+发布 → 指定 model revision 晋一级，或给某 endpoint 挂上该 revision。  
   - 仍保持样机诚实文案；目的是让「门禁→发布」不是哑按钮。

3. **（doc-harness P1）按章映射 mock commandType**  
   - 权利要求类 → `submitClaims`；其余 → `saveDraft` 或具名 mock（仍不入 contracts union）。  
   - 日志 `detail` 跟章节走，别永远写 claims。

4. **（doc-harness P1）补一案或一开关 `authorized: false`**  
   - 让整案 SKU 闸可点到，与附图 locked 形成「案级 / 章级」对照。

5. **（ai-data P1）草稿可编 + 历史发布叙事**  
   - 接上 `updateDraftNote` UI；种子 quality 对已发布版给 `pass`（或 UI 标明「种子历史发布 · 当前门禁待重跑」），避免开场认知冲突。

6. **（ai-infra P1）调度尊重 queue↔pool**（或 UI 去掉队列伪装）  
   - 要么匹配 pool，要么删队列字段——别留半真半假。

**明确不建议当下一刀**：皮肤、真集群、真 Spark、跨端口 LS bridge（规格已冻结为种子契约）、改五壳 / APP_PORTS。

---

## 附录 · 审计方法备忘

- 必读已覆盖：`docs/architecture/doc-harness/*`、`ai-infra/deep-demo.md`、`ai-data/deep-demo.md`、三 app `README.md`。  
- 源码重点：`doc-harness` `App.tsx` / `seed.ts` / `mockDispatch.ts` / `annotationFidelity.ts`；`ai-infra` `AiInfraStore.tsx` / `seed.ts` / 各 page；`ai-data` `store.ts` / `seed.ts` / `types.ts` / 各 page。  
- 未跑浏览器点通；状态机结论来自 reducer/store 静态审计。若实现与 UI 接线漂移，以页面 `disabled`/`onClick` 与本文件路径为准复查。
