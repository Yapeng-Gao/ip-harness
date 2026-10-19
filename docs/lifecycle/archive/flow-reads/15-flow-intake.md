# Flow 精读 15 · IntakeFlow（/workbench/intake）

> **本篇只讲实现**。业务规格见 [02-decision.md](02-decision.md)。
> 权威源：`apps/workbench/src/flows/intake/IntakeFlow.tsx`（583 行）
> 种子：`src/data/workbenchSeeds.ts` 的 `intakeSeed`（缺省回落 `intakeDefaultsFromCase`）

## 1. 文件与入口

| 项 | 值 |
|---|---|
| 文件 | `apps/workbench/src/flows/intake/IntakeFlow.tsx` |
| 行数 | 583 |
| 导出 | `export function IntakeFlow()` |
| 路由 | `/workbench/intake` · `/workbench/intake/:caseId` |
| 壳 | workbench :5174 |
| StageId | `decision` |
| 产物键 | `intake_quote` |
| 步骤 | `stepsForFlow('intake')` → 4 步：发明披露 / 双维评分 / 委员投票 / Go-No-Go |
| 持久化 | `usePersistedFlowStep(caseId, 'intake')` |

## 2. 状态清单

| 状态 | 初始值 | 含义 |
|---|---|---|
| `caseId` | `paramId ?? 'c5'` | 当前案件 |
| `inventors` | seed | 发明人（单字符串） |
| `techSolution` | seed | 技术方案 |
| `scenario` | seed | 应用场景 |
| `disclosureRiskDate` | seed | 公开风险日期 |
| `techScore` | seed | 技术评分 1–5 |
| `bizScore` | seed | 商业价值 1–5 |
| `budget` | seed | 企业预算预估（字符串） |
| `quote` | seed | 接案报价（字符串） |
| `votes` | `Record<reviewerId, {vote, comment}>` | 委员投票 |
| `decision` | `''` | Go / No-Go |
| `reason` | `''` | 决策理由（**必填**） |
| `quoteSent` | `false` | 报价是否已发送企业 |
| `draft` | `''` | 决策纪要 |

### 2.1 派生值

| 名 | 定义 | 用途 |
|---|---|---|
| `gapHints` | `DISCLOSURE_PACK_CHECK_ITEMS.filter(i => !disclosureCheck[i.id]).length` | 展示未齐项数 |
| `hasPriorArt` | `!!disclosureCheck.prior_art_1_1` | 展示 1.1 是否有 |
| `patentTypeHint` | `c?.type ?? '发明'` | 展示专利类型 |
| `votesReady` | `REVIEWERS.some(r => !!votes[r.id]?.vote)` | 至少一票 |
| `committeeVoteHardBlockGo` | 来自常量 | 是否开「投票硬挡 Go」 |
| `hasAuditedCommitteeVote(caseId)` | 来自 AppContext | 是否有审计票 |

## 3. UI 分区地图

| # | 区块 | 内容 |
|---|---|---|
| 1 | `FlowHeader` | 企业视角「发明披露、评审、预算与 Go·No-Go」；代理视角「接案评估、报价并提交企业确认」 |
| 2 | `CasePicker` | `stage="decision"` |
| 3 | `Stepper` | 4 步 |
| 4 | `WbStickyTip` | 三选一：交底未批 / 投票硬闸 / Persona 不可 Go |
| 5 | `SplitDraft` 左 | 5 个 `WbSection` |
| 6 | `SplitDraft` 右 | 「立项决策纪要」自动生成 |

左栏 5 个 Section：

| Section | 内容 | 关键点 |
|---|---|---|
| 发明披露表 | 交底包摘要条 + 发明人 / 技术方案 / 应用场景 / 公开风险日期 | 摘要条显示专利类型、交接态、1.1 有无、缺口数；未批准时给「门户」「交底 Agent」两个跳转 |
| 技术评分 + 商业价值 | 两个 range（1–5） | — |
| 报价单 | 企业预算 + 接案报价 + 费用明细 inset | 明细写死「官费估算 ≈ ¥3,450」 |
| 评审委员投票 | `REVIEWERS` 逐个投票 + 意见 | 非委员 Persona 按钮 disabled |
| Go / No-Go 决策 | 两个大按钮 + 理由输入 | 非企业 IP Persona disabled |

## 4. 步骤与进度

```ts
const progressStep = useMemo(() => {
  if (decision) return 3
  if (votesReady) return 2
  if (techScore > 0 || bizScore > 0) return 1
  return 0
}, [decision, votesReady, techScore, bizScore])
```

**问题**：`techScore` / `bizScore` 的 range 最小值是 1，所以 `> 0` **永远为真**，第 1 步永远算已完成。这意味着进度条一开始就停在第 2 步之前（`return 1`），第 0 步形同虚设。

## 5. 核心逻辑：`submitGo()`

这是全部业务规则的集中地，按顺序执行 **9 道判断**：

| # | 判断 | 失败文案 |
|---|---|---|
| 1 | `!c` | 请先选择案件 |
| 2 | `!decision` | 请选择 Go / No-Go |
| 3 | `!reason.trim()` | 必须填写决策理由 |
| 4 | `!personaCanGo(persona)` | 按 persona 分三种文案（committee / inventor / 其他） |
| 5 | `role !== 'enterprise'` | Go/No-Go 需由企业身份确认 |
| 6 | `decision==='Go' && committeeVoteHardBlockGo && !hasAuditedCommitteeVote` | `COMMITTEE_VOTE_HARD_GATE_MSG` |
| — | **No-Go 分支**：`recordIntakeNoGo` + 写产物 + 写 Drive + toast | 提前 return |
| 7 | `mode==='self_serve' && !budget.trim()` | 自助立项须填写预算后方可 Go |
| 8 | `mode!=='self_serve' && !quoteOk && !payOk` | 委托模式：须报价已确认 / intake_quote 交接批准后方可 Go |
| 9 | `evaluateGuardrails({action:'go_nogo'})` 返回消息 | 该消息（典型为 `disclosure_approved`） |
| 10 | 清单 blocking 项 | 清单未齐：{labels}（晋级只认真实清单/交接） |

其中：

```ts
const mode = c.fulfillmentMode ?? 'delegated'
const quoteOk = ['approved','authorized_to_file','filed'].includes(handoff)
const payOk  = ['已确认待付款','部分付款','已结清'].includes(c.engagement.paymentStatus)
```

### 5.1 清单原子完成（`resolveDoneIds`）

代码注释明确禁止伪造批准：

```
// 禁止 Go 前宽写 markChecklistDone(c3/c4)。c3 须已由投票 useEffect 诚实勾选；
// c4「Go 决议已签署」由本动作经 resolveDoneIds 原子完成（非伪造批准）。
const resolveDoneIds = ['c4']
if (votesReady && c3 未完成) resolveDoneIds.push('c3')
```

然后 `advanceFromWorkbench(c.id, { note, resolveDoneIds })`。

### 5.2 投票的诚实勾选（useEffect）

```ts
useEffect(() => {
  if (!c || !votesReady) return
  const c3 = c.checklist.find(i => i.id === 'c3')
  if (c3 && !c3.done) markChecklistDone(c.id, ['c3'])
}, [votesReady, c?.id, c?.checklist, markChecklistDone])
```

投票齐套即勾 c3，与 Go 动作解耦。

## 6. 闸门与校验

### 6.1 `validateBefore`（交接条）

```ts
if (action === 'submit' && !quote.trim()) return '请填写报价后再提交'
if (action === 'submit' && !techSolution.trim()) return '请填写技术方案'
if ((action === 'approve' || action === 'authorize') &&
    committeeVoteHardBlockGo && !hasAuditedCommitteeVote(caseId)) {
  return COMMITTEE_VOTE_HARD_GATE_MSG
}
```

### 6.2 `checkedRequired`

`intake_quote` 3 项：`quote` / `scope` / `votes`。

### 6.3 Sticky 提示三选一

| 优先级 | 条件 | tone |
|---|---|---|
| 1 | `!disclosureApproved` | error：红灯：交底包未批准，不可 Go |
| 2 | Go + 投票硬闸未满足 | error：`COMMITTEE_VOTE_HARD_GATE_MSG` |
| 3 | `role==='enterprise' && !personaCanGo(persona)` | warn：当前 Persona 不可 Go/No-Go |

## 7. 写回与副作用

| 动作 | 调用 | 写入 |
|---|---|---|
| 投一票 | `recordCommitteeVote({caseId, reviewerId, reviewerName, vote, comment})` | 审计票（AppContext） |
| 填理由 | `setReason` | 本地 |
| 报价发送 | `setQuoteSent` + `addActivity` | 活动流 |
| 企业确认报价 | 更新 `engagement.paymentStatus` + `addActivity` | 商务线 |
| No-Go | `recordIntakeNoGo(c.id, reason)` + `addArtifact('立项No-Go决议.md','纪要')` + `appendCaseDriveItem({kind:'other'})` | 案件 + Drive |
| Go | `advanceFromWorkbench({note, resolveDoneIds})` + `addArtifact('立项Go决议.md','纪要')` + `appendCaseDriveItem({kind:'approval'})` | 阶段推进 + Drive |

**Toast 后续跳转**：No-Go → 回案件 / 去期限 / 打开工作台；Go → `nextActionsForStage('decision', caseId)`。

## 8. 实现层面的问题

| # | 问题 | 位置 | 影响 |
|---|---|---|---|
| 1 | `techScore > 0` 恒真（range min=1），第 0 步进度失效 | `:255` | 进度条撒谎 |
| 2 | 投票 `disabled={!personaCanVote(persona)}` 但 `onClick` 内无二次校验，若 Persona 切换可绕过 | `:415` | 与 `submitGo` 的 persona 检查不同层 |
| 3 | 费用明细官费写死 `≈ ¥3,450`，与 `quote` 无关，也与 docket 官费口径不同源 | `:400` | 两套数 |
| 4 | `inventors` 是单字符串，与实际多发明人场景不符 | `:64` | 署名无法表达 |
| 5 | `budget` / `quote` 都是字符串，无法比较或合计 | `:70-71` | 无法做预算校验 |
| 6 | `mode` 缺省为 `delegated`，但 `addCase` 缺省是 `self_serve` —— 两处默认相反 | `:216` vs `AppContext` | 新案可能误走委托校验 |
| 7 | `quoteSent` 只影响纪要文案，不影响任何闸门 | `:80` | 状态无实际作用 |
| 8 | `decision` 在换案时被重置，但 `votes` 不重置 | `:107` | 换案后看到上一案的票 |
| 9 | 投票按钮无「撤销/改票」的审计留痕，只覆盖 `votes` 本地对象 | `:428` | 审计票与本地态可能不一致 |

> **优先修**：#1（进度撒谎）、#6（默认值冲突）、#9（审计一致性）。
