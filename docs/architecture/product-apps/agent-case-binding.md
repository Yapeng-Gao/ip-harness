# Agent · 案绑定（先聊/先项目，案不挡入口）

> **冻结（用户拍板）**：**先聊或先项目**；案在工作区内 **创建或绑定**，**不挡入口**。  
> **样机诚实**：新案 = mock `caseId`（+ 可选 HITL/DomainCommand 形状）；**禁**真 case-core。  
> **对齐**：[agent-entry-modes](./agent-entry-modes.md) · [agent-surface](./agent-surface.md) · mid 案库仍是案权威列表。

## 1. 原则

| # | 原则 |
|---|------|
| 1 | 新建会话 / 新建项目：**不强制** `caseId` |
| 2 | **通用 Agent** 与 **general 项目**：可**一直无案**完成演示 |
| 3 | **domain/patent 项目**：允许**空开**；区内再「创建并绑定新案」或「绑定已有案」 |
| 4 | **不要求**用户先去 mid 中台建案再回来开聊 |
| 5 | 中台案库仍是**案权威列表**（落地后）；Agent 侧绑定是引用，不另起第二套案真相 |

## 2. 模式 × caseId

| 模式 | 开入口时 caseId | 工作区内 |
|------|-----------------|----------|
| 通用 Agent | 可选空 | 可选稍后绑定只读 Context；可一直空 |
| 项目 general | 可选空 | 默认可一直空；绑定不改变「无专利步骤」 |
| 项目 domain/patent | **可空开** | 工具栏：「创建并绑定新案」/「绑定已有案」；未绑时专家剧本可跑到「需案」闸再提示，**不**在进夹时拦 |

```ts
// 扩展 AgentProject / Session
caseId?: string           // 空 = 未绑
caseBindState: 'none' | 'bound' | 'pending_create'
```

## 3. 创建并绑定新案（样机）

| 步 | 行为 |
|----|------|
| 1 | 用户点「创建并绑定新案」→ 表单（标题等瘦字段） |
| 2 | 生成 **mock `caseId`**（如 `mock-case-<ts>`），写入项目/会话 |
| 3 | **可选**：走 Confirm → DomainCommand 形状（如建案命令名以 contracts 为准）；样机可只记事件 + 本地种子案 |
| 4 | CaseContext 只读摘要刷新为该 id |

**禁**：直连真库；无 HITL 的静默「真建案」。

## 4. 绑定已有案

| 来源 | 样机 | 落地 |
|------|------|------|
| 本壳种子案列表 | 下拉选 id | — |
| 中台案库 | 深链 mid 或只读 API 列表（有则用） | `GET /v1/cases` |
| 手输 caseId | 允许；校验存在与否可松 | 服务端校验 |

绑定后：`caseId` 写入项目；专家只读 Context；写库仍经 HITL→DomainCommand。

## 5. 与中台关系

```text
用户可：Agent 先聊 ──(可选)──► 创建 mock 案 / 绑已有案
也可：  mid 案库建案 ──深链──► Agent 绑该 caseId

权威列表（落地）= case-core / mid 所见；Agent 不另建「影子案库」。
```

## 6. 验收

- [ ] 新建会话/项目无 caseId 也能进  
- [ ] general / 通用可全程无案  
- [ ] patent 项目空开成功；区内可创建绑定或绑已有  
- [ ] 无「必须先去中台」门禁文案  
- [ ] 创建案路径诚实 mock；无真 case-core

## 评审

- [product-apps/REVIEW.md](./REVIEW.md) · B席轻扫段（对象 `fe64234`）
