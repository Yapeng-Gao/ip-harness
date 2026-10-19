# Flow 精读 20 · WatchFlow（/workbench/watch）

> 权威源：`apps/workbench/src/flows/watch/WatchFlow.tsx`（395 行）· `packages/app-state/src/AppContext.tsx`（`processWatchAlert`/`patchWatchAlert`/`addCase`）· 节点总览见 [07-monitoring.md](07-monitoring.md)

## 1. 步骤序列（3 段）

规则配置 → 告警处理 → 交接确认（`stepsForFlow('watch')`）。深链 `?alert=<id>` 直接落 step 1（告警处理）。

## 2. 关键分支逻辑

- **规则配置**（step 0）：关键词 / 竞品 / 规则列表（本地 state）；add-rule 按钮、启用开关、阈值——纯配置示意，无真数据源
- **告警收件箱**（`getWatchAlerts(caseId)`）：
  - 每条告警双栏意见：`agencyOpinion`（**仅 agency 角色可编辑**）/ `enterpriseDecision`（**仅 enterprise 角色可编辑**），经 `patchWatchAlert` 写回——角色字段级互斥是本 Flow 最细的权限粒度
  - 深链定位当前告警并高亮
- **三态处置**（`processAlert(id, status)`）：`已确认 / 已升级 / 已关闭`；`已确认` 追加 drive item kind `approval`，其余 `other`（`appendCaseDriveItem`）
- **升级维权两档**（企业角色视角，:301、:334-335）：
  - **建案升级**（`escalateEnforcement`）：`addCase({ stage: 'commercialization', fulfillmentMode: 'delegated', risk: '高', agency: '北京德恒知识产权代理有限公司（默认代理）' })` → 携 `linkedAlertId` 跳转 `/workbench/monetize/{newId}`——维权案默认**高风险 + 委托模式**，溯源挂告警
  - **仅标记**（菜单项「仅标记已升级（不建案）」）：只改 `status='已升级'`，不建案——留给「内部观察、暂不立案」
- **生成调研案**（「更多」菜单）：`addCase({ stage: 'pre_research', fulfillmentMode: 'self_serve', risk: 由告警级别映射 })` → 跳 `/workbench/research/{newId}`——告警反向喂养调研线（monitoring → pre_research 回流）
- **claim_chart 草稿**：每条告警可出对照表草稿 → 写 Drive + `addArtifact`（与 research 的 FTO claim_chart 同形）

## 3. 闸门与条件

- `validateBefore`：`submit` 需 `agencyOpinion` 非空 + `level` 已选；`approve/authorize/file` 走 `evaluateGuardrails({ agent: agent-watch, … })`（assist 档，gate `approve_strategy`）
- `REQUIRED_BEFORE_SUBMIT.watch_alert` 3 项：`alert` 告警意见 / `risk` 风险评级 / `opinion` 代理所意见
- 成功（提交）→ `markChecklistDone(['c1','c2','c3'])` + `addArtifact('告警处理意见.md','监控')`

## 4. 写回与命令

- `processWatchAlert` / `patchWatchAlert` 写 `watchAlerts` store；建案走 `addCase`（同壳内存 + audit）
- handoff `watch_alert` 7 态；「官方期限请走 Docket」——本 Flow **不裁决期限**，docket 升级只在 21 §待办 出现为来源之一（分工断言，FlowHeader 原文）

## 5. 诚实口径

- 告警/竞品数据全 seed（`watchSeed`，默认案 c9）；「重叠初判」行静态「待核」；无真监测流

## 6. 缺口

- 告警级别→风险映射只有建案时一次转换，无级别升级/降级路径（与 07 §8 同源）
- 「生成调研案」建的是自助 `pre_research` 案，后续仍走 01 的提交闸，无「告警驱动的简化调研」快车道
- 建案后 `linkedAlertId` 只有溯源单向：案件侧不回写告警处置结果
