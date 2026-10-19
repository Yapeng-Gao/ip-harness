# Flow 精读 14 · ResearchFlow（/workbench/research）

> **本篇只讲实现**，不讲业务应该是什么。业务规格见 [01-research.md](01-research.md)。
> 权威源：`apps/workbench/src/flows/research/ResearchFlow.tsx`（716 行）
> 种子数据：`src/data/workbenchSeeds.ts` 的 `researchSeed`（按 caseId 取，缺省回落 `c2`）

## 1. 文件与入口

| 项 | 值 |
|---|---|
| 文件 | `apps/workbench/src/flows/research/ResearchFlow.tsx` |
| 行数 | 716 |
| 导出 | `export function ResearchFlow()` |
| 路由 | `/workbench/research` · `/workbench/research/:caseId` |
| 壳 | workbench :5174 |
| StageId | `pre_research` |
| 产物键 | `research_report` |
| 步骤定义 | `stepsForFlow('research')` → 5 步：检索配置 / 结果研判 / 可专利性 / FTO 初评 / 结论提交 |
| 持久化 | `usePersistedFlowStep(caseId, 'research')` |

## 2. 状态清单

| 状态 | 初始值 | 含义 | 生命周期 |
|---|---|---|---|
| `caseId` | `paramId ?? 'c2'` | 当前案件 | URL 参数变化时 useEffect 同步 |
| `step` | 持久化 | 当前向导步 | `setStep` 由各字段 focus/change 触发 |
| `storedStepIndex` | 持久化读出 | 上次停留步 | 只读，参与 `stepperCurrent` |
| `keywords` | `seed.keywords` | 检索关键词 | 换案时重置 |
| `ipc` | `seed.ipc` | IPC/CPC 分类号 | 换案时重置 |
| `dateFrom` / `dateTo` | seed | 检索时间范围 | 换案时重置 |
| `databases` | `seed.databases` | 已选数据库（多选） | `toggleDb` |
| `results` | `seed.searchResults` | 检索命中列表 | 换案时重置 |
| `selectedResults` | **`['r1']` 硬编码** | 勾选的命中 id | 换案时重置为 `[首条]` |
| `novelty` | `seed.novelty` | 新颖性分（0–100） | **由勾选文献自动重算**，也可手动拖 |
| `inventiveness` | `seed.inventiveness` | 创造性分（0–100） | 同上 |
| `noveltyNotes` | `''` | 自动生成的相关性说明 | 由勾选 effect 写入 |
| `conclusionBullets` | `[]` | 「命中→结论」绑定要点 | 由勾选 effect 写入 |
| `ftoNotes` | `''` | 自动生成的 FTO 提示 | 由勾选 effect 写入 |
| `conclusion` | `seed.conclusion` | 结论下拉（可申请/有条件/暂不建议/需补数据） | 手动 |
| `ftoChecks` | `seed.ftoChecks` | FTO 初评要素勾选 | 手动 |
| `ftoRisk` | `seed.ftoRisk` | 风险档 低/中/高 | 手动 |
| `claimChartRows` | 由前 3 条命中生成 | 要素对照表（草稿） | 换案时重建；可编辑备注 |
| `submitAttempted` | `false` | 是否点过提交 | 提交时置真，用于显示 sticky 错误 |
| `hitInlineError` | `null` | 命中为空时的内联错误 | 勾选 effect 控制 |
| `sliderPulse` | `false` | 滑杆脉冲动画 | 450ms 后自动复位 |
| `draft` | `''` | 右侧结论摘要文本框 | 由 `assembled` 同步 |

### 2.1 派生值

```ts
selectedHitRows = results.filter(r => selectedResults.includes(r.id))

hitsVerifiable =
  selectedHitRows.length > 0 &&
  selectedHitRows.every(r => !!r.pubNo?.trim() && !!r.url?.trim())

unverifiableHits = selectedHitRows.filter(r => !r.pubNo?.trim() || !r.url?.trim())
```

`hitsVerifiable` 是**唯一**的可核验判定，同时喂给 sticky 提示、`checkedRequired` 与后端闸门。

## 3. UI 分区地图

页面自上而下：

| # | 区块 | 内容 | 受控状态 |
|---|---|---|---|
| 1 | `FlowHeader` | 标题「立项前调研」；副标题按 role 分流（企业=审核，代理=执行） | `role` |
| 2 | `WorkbenchInsightDataBanner` | 数据面诚实横幅（compact） | 静态 |
| 3 | `CasePicker` | 按 `stage="pre_research"` 过滤的案件下拉 | `caseId` |
| 4 | `Stepper` | 5 步只读高亮 | `stepperCurrent` |
| 5 | `WbStickyTip` | **唯一**错误槽（见 §6） | 4 个条件任一成立 |
| 6 | `SplitDraft` 左栏 | 见下 6 个 `WbSection` | — |
| 7 | `SplitDraft` 右栏 | 「调研结论摘要」textarea | `draft` |

左栏 6 个 `WbSection`：

| Section | 内容 | 关键交互 |
|---|---|---|
| 现有技术检索 | 关键词 / IPC / 起始日 / 截止日 / 数据库 chips | `DB_OPTIONS = [CNIPA, USPTO, EPO, WIPO, JPO, arXiv]` |
| 检索结果 · 勾选影响新颖性评分 | 命中卡片列表 | 点击切换勾选；有 url 显示「打开公开页」，无 url 显示红字「无链接不可提交」 |
| 命中→结论 绑定面板 | 自动生成的 `conclusionBullets` + FTO 笔记 | 只读展示；右上角 chip 显示绑定状态 |
| 新颖性 / 可专利性评分 | 两个 range 滑杆 + 结论下拉 | 拖滑杆会 `setStep(2)` |
| FTO 初评 | 风险档 segmented + `FTO_ITEMS` 勾选 + 要素对照表 | 「写入 Drive」按钮 |
| 交接确认 | `VersionPanel` + `HandoffActionBar` | 提交/批准 |

## 4. 步骤与进度

```ts
const progressStep = useMemo(() => {
  if (['approved','filed','authorized_to_file','submitted_to_enterprise','enterprise_review']
      .includes(handoff)) return 4
  if (ftoReady || (ftoRisk && conclusion)) return 3
  if (conclusion || noveltyNotes.trim()) return 2
  if (selectedResults.length > 0) return 1
  if (keywords.trim() || databases.length > 0) return 0
  return 0
}, [...])

const stepperCurrent = Math.max(step, progressStep, storedStepIndex)
```

- **只增不减**：`Math.max` 三路取大，进度条不会倒退。
- `syncProgressFloor(progressStep)` 把进度写回持久层。
- `ftoReady = Object.values(ftoChecks).some(Boolean)` —— 注释明确「风险档位种子常有值，不能单独当闸」。

## 5. 核心联动：勾选 → 结论（`useEffect`）

这是本 Flow 最核心的一段逻辑，位于勾选状态变化的 effect：

1. **勾选为空**：
   - `noveltyNotes = '尚未选择对比文献。'`
   - `ftoNotes = '选择命中文献后自动生成 FTO 初评要点。'`
   - `conclusionBullets = []`
   - `hitInlineError = '请至少勾选 1 篇检索命中后再提交（空命中不可过闸）'`
   - 滑杆**重置回 seed 值**并脉冲
2. **有勾选**：
   - `delta = Σ selected.noveltyDelta`
   - `novelty = clamp(base.novelty + delta, 5, 95)`
   - `inventiveness = clamp(base.inventiveness + round(delta * 0.8), 5, 95)`
   - 生成 `noveltyNotes`（含选中文献公开号列表）
   - 生成 `conclusionBullets`（每条「对比 XX（权利人）：标题 · 相关度 — 需在独权中拉开差异」+ 一条综合结论）
   - `ftoNotes`：若含「高相关」→ 提示关注有效权项重叠与规避设计

> **这是示意逻辑，不是法律引擎**。`noveltyDelta` 是种子里的固定数，滑杆分数由它线性叠加，没有真实的新颖性判断。

## 6. 闸门与校验

### 6.1 `validateBefore`（`HandoffActionBar`）

```ts
if (action === 'submit') setSubmitAttempted(true)
if (action === 'submit' && (!keywords.trim() || databases.length === 0)) {
  return '请填写关键词并选择至少一个数据库'
}
```

**注意**：这只是**前端本地校验**，真正齐套判定在 `checkedRequired`。

### 6.2 `checkedRequired` 组装

```ts
[
  ...(keywords.trim() ? ['kw'] : []),
  ...(databases.length > 0 ? ['db'] : []),
  ...(selectedResults.length > 0 ? ['hits'] : []),
  ...(hitsVerifiable ? ['hits_verifiable'] : []),
  ...(conclusion ? ['conclusion'] : []),
  ...(conclusionBullets.length > 0 ? ['binding'] : []),
  ...(ftoReady ? ['fto'] : []),
]
```

对应 `REQUIRED_BEFORE_SUBMIT.research_report` 的 7 项：`kw / db / hits / hits_verifiable / conclusion / binding / fto`。

### 6.3 Sticky 错误槽（唯一）

四个条件**依次短路**，只显示第一条：

| 优先级 | 条件 | 文案 |
|---|---|---|
| 1 | `hitInlineError` | 该错误原文 |
| 2 | `submitAttempted && selectedResults.length === 0` | 请至少勾选 1 篇检索命中后再提交 |
| 3 | `selectedResults.length > 0 && !hitsVerifiable` | 命中须含可核验 pubNo + 可点 url · 无链接不可提交（列出问题条目） |
| 4 | `conclusionBullets.length === 0` | 尚未绑定 — 请勾选 ≥1 篇命中；空命中将阻断提交 |

> 代码注释：「P1-D · 唯一 sticky tip：blocker 优先，不落折线以下」。避免多处红灯叠层。

## 7. 写回与副作用

| 动作 | 调用 | 写入 |
|---|---|---|
| 切换数据库 | `toggleDb(db)` | `databases` |
| 勾选命中 | `toggleResult(id)` | `selectedResults` + 触发 §5 联动 |
| 写入 FTO 对照表 | `appendCaseDriveItem(caseId, {kind:'claim_chart', ...})` + `addArtifact(caseId, 'claim_chart_FTO草稿.md', '对照表')` + `addActivity` | 案件 Drive + 产物列表 + 活动流 |
| 提交/批准交接 | `HandoffActionBar` → `submitHandoff` | `research_report` handoff 状态 |
| 步骤写回 | `syncProgressFloor(progressStep)` | 持久化层 |

**Toast 文案**：「已写入 Drive：claim_chart 草稿」

**跳转**：无自动跳转；`nextActionsForStage` 在外层 `onResult` 里给下一步（若有）。

## 8. 实现层面的问题

| # | 问题 | 位置 | 影响 |
|---|---|---|---|
| 1 | `selectedResults` 初始硬编码 `['r1']`，但换案时被重置为「首条命中」，两处口径不一致 | `:70` vs `:148` | 首屏与换案后行为不同 |
| 2 | 滑杆可手动拖拽，但任何勾选变化都会**覆盖**手动值 | `:150-180` | 用户调整被静默丢弃 |
| 3 | `noveltyDelta` 是种子固定值，滑杆分数是伪计算 | seed | 演示时若被追问「分数怎么来的」需诚实说明 |
| 4 | `claimChartRows` 的 `ourFeature` 用 `i===0/1/2` 三元硬编码 | `:79-86` | 与案件技术内容无关，纯装饰 |
| 5 | `hitsVerifiable` 只校验 `pubNo` 与 `url` 非空，**不校验格式**（与 domain 的正则不同源） | `:105-112` | 前端宽于后端 |
| 6 | `DB_OPTIONS` 里含 `arXiv`（非专利库），与「专利检索」语义不符 | `:29` | 概念混淆 |
| 7 | `submitAttempted` 一旦置真永不复位 | `:88` | 换案后仍显示上次的提交态 |
| 8 | `WorkbenchInsightDataBanner` 为静态横幅，与本案检索结果无数据关联 | `:311` | 可能误导「数据面已接入」 |

> **优先修**：#2（手动调整被覆盖）与 #5（校验不同源）。前者是体验 bug，后者是安全口径分级问题。
