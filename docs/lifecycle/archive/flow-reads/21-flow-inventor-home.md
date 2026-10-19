# Flow 精读 21 · InventorPortal（/inventor）+ 办理台首页待办（/workbench）

> 权威源：`apps/workbench/src/flows/inventor/InventorPortal.tsx`（793 行）· `apps/workbench/src/flows/home/WorkbenchHome.tsx`（288 行）· `src/data/workspaces.ts`（`filterWorkbenchQueue` :156-208）· `packages/app-state/src/AppContext.tsx`

## A. InventorPortal —— 发明人披露门户

### 1. 双层分离（UI 显式声明）

① **发明人提报状态机**（门户表单，「与办理交接无关」）；② **disclosure_pack 办理交接**（agent/企业侧，六项齐套硬闸）。两层不可混用——门户的「已立案」≠ 交底包批准。

### 2. 提报状态机（`DisclosureStatus`）

```
草稿 → 已提交 → 部门审核 → IP受理 → 已立案
                    ↘ 退回（两个审核态均可退回）
```

- **提交**：表单必填发明名称 + 发明人；`submitDisclosure({ title, inventor, dept, tech, techTheme(缺省=名称), patentType(发明/实用新型/外观), contact, riskDate, targetStage: pre_research|decision })` → 落「已提交」+ 时间线条目；toast 三个去向：查看状态 / 交底 Agent（`/agent/agents?agent=agent-disclosure`）/ 回案件库
- **角色双 chip**（`actingAs: 'dept' | 'ip'`，同一登录显式切身份）：
  - 部门审核人：通过 → `advanceDisclosure(id, 'IP受理')`（后自动切到 ip chip）；驳回 → `advanceDisclosure(id, '退回')`
  - IP 受理人：受理 → `advanceDisclosure(id, '已立案')` **返回 `res.caseId`——立案即建案**（toast 给「打开案件 / 交底 Agent / 交底包区」）；驳回 → 退回
  - 越级拦截：`actingAs` 不匹配时所有动作拒绝（「不可跳过 IP 受理直接立案」）
- **时间线**：展开卡片显示 `d.timeline`（time/status/note 逐条）+「查看关联案件」链接

### 3. 交底包办理区（② 层）

- `visibleCases` 取带 `handoffs.disclosure_pack` 的案件；每案关联 `agent-disclosure` 会话（`visibleSessions`）、相关产物（名称/类型含「交底/披露」）、关联披露记录
- 深链 `?case=` / `?pack=` 自动展开 + `scrollIntoView`
- **批准仅企业**：6 项 `DISCLOSURE_PACK_CHECK_ITEMS` 勾选面板（`getDisclosurePackCheck` / `toggleDisclosurePackCheck` 持久化）；`disclosurePackComplete` = 硬闸（`blockPrimary`，「空壳不可批准」）；`evaluateGuardrails({ agent: agent-disclosure, disclosureCheck })` → `disclosure_pack` blocker（n/6 计数）
- 非企业 workspace：只读告示 + 表单禁用（`pointer-events-none`）

### 4. 诚实口径

附件上传为占位（「示意」）；表头「提交发明交底（示意）」；时间线本地打点。

### 5. 缺口

- 附件无真对象（只有占位）；`targetStage` 只决定立案时 stage，不决定后续路由差异
- 退回后重新提交无版本化（时间线追加，但无 diff）
- 门户 5 态与 `disclosure_pack` 7 态交接两体系靠「已立案建案」一次性衔接，之后门户不再出现

## B. 办理台首页（WorkbenchHome）—— 待办队列

### 1. Tab 与数据源

`?tab=` 两 tab：`queue`（默认，读参后剥除）/ `stages`。管道：`workspaceTodos`（AppContext 构造：handoff 待办 + docket 升级 + 商务线）→ 按 优先级 rank（高 0/中 1/低 2）+ `daysUntil(due)` 排序 → `filterWorkbenchQueue(sorted, cases, role, persona)`。

### 2. 队列过滤规则（`filterWorkbenchQueue`，workspaces.ts:156-208）

- `todoVisibleToPersona`：persona 收窄（企业 IP / 代理 / 发明人 / 委员 各自可见面）
- **`self_serve` 案件仅企业可见**（代理一侧一律不可见，无论指派）
- `delegated`：`t.assignee` 必须匹配角色，除 `both` 外
- `source === 'handoff'` 或 `'docket'` 的待办**绕过阶段白名单**（升级/交接驱动的事项全局可见）
- `delegated` 阶段白名单：企业 = decision/drafting/prosecution/commercialization/monitoring/maintenance；代理 = pre_research/drafting/prosecution/maintenance/decision
- `layout_insight` 类（handoffKey 或 actionPath 含 `/workbench/layout`）**双角色恒放行**

### 3. 行级呈现

- 列：优先级 chip · 阶段短名/色（`getStageMeta`）· 指派人 persona 映射（enterprise_ip→企业IP / agency→代理 / both→双方）· 来源徽标（handoff→「交接驱动」/ docket→「期限升级」）· 履行模式（自助/委托）
- 紧急色阶：`urgencyLevel(days)` 按剩余天数染行
- 主 CTA = `queue[0]`「办理「…」」→ 其 `actionPath`（空队列落 `/pipeline`）

### 4. 阶段 tab

7 阶段卡片各带「本阶段可见案件数」；**第 4 张非阶段薄卡「布局洞察」**（`layoutPoolCount`，呼应 08 辅台不在 STAGE_ORDER 的口径）。

### 5. 周边件

`TenantBanner`（租户提示）、`WorkbenchBillingHoldBanner`（**商务 hold 挂首页**——`invoiceBlocked` 的可见化，见 12-billing）、`StageSkuDemoPanel`（SKU 权益演示：路由层 `StageSkuGate` 按模块闸控各 Flow 入口，App.tsx 每个路由裸挂 + `/:caseId` 双挂）。

## C. 横切汇总

- 门户建案（已立案）→ 案件进 pre_research/decision，此后全走主轴 7 节点
- 待办是**三来源汇流点**：交接驱动（handoff）、期限升级（docket）、商务 hold（billing）——生命周期 10/11/12 横切线在此同屏
- 队列过滤是 persona × 角色 × 履行模式 × 阶段白名单的四维断言，也是「同一案件不同人看到不同待办」的唯一规则源

## D. 缺口

- `workspaceTodos` 构造在 AppContext，无独立 todo 对象（无 id/assignee/历史），重算依赖全量 seed
- docket 升级只进队列展示，队列内无直接处置（需跳 Flow，与 11 §5 一致）
- SKU gate 是演示面板（`StageSkuDemoPanel`），非真权益系统
