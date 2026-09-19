# Agent 入口模式（通用单聊 · 项目 general/domain）

> **冻结（用户拍板）**：入口**不是**「只留项目夹」二选一；默认进 **通用 Agent**，项目为可选模式且分两型。  
> **样机诚实**：mock 剧本；写库仍 **HITL → DomainCommand**；**禁**真 LLM / 真 case-core。  
> **对齐**：[agent-surface](./agent-surface.md) · [agent-project-folder](./agent-project-folder.md) · [agent-plugins](./agent-plugins.md)。

## 1. 三种入口（冻结）

| 模式 | 默认路由心智 | 强制项目？ | 绑案 / 专利步骤？ |
|------|--------------|------------|-------------------|
| **通用 Agent** | `/agent` **单聊**（Catalog 选一个 AgentDef 或默认助手） | **否** | 否；可选挂只读 CaseContext |
| **项目 · general** | 项目文件夹 + 多 bot + 总控席（Grok Bot 形式） | 是（进该模式才有夹） | **否**；无专利步骤条、无案绑死 |
| **项目 · domain** | 同上文件夹形态 + **DomainPack 可插拔** | 是 | 由 Pack 决定；**patent** 为首包 |

```text
/agent                          → 通用 Agent（默认落地）
/agent/projects                 → 项目列表（general | domain）
/agent/projects/:id             → 文件夹：总控 + 专家侧栏
/agent/projects/:id/bots/:botId → 一对一专家聊（带该 bot 剧本）
/agent/sessions*                → 见 §4（兼容）
```

实现可微调 path，但**默认打开壳 = 通用单聊**，不得强制先建项目。

## 2. 通用 Agent

| 项 | 规格 |
|----|------|
| IA | 单会话 Composer；可选 Catalog 切换当前 `AgentDef` |
| 剧本 | 可用**该 AgentDef** 自有短剧本；无项目步骤条 |
| 总控席 | **不出现**（无项目则无编排夹） |
| 写库 | 试运行不写；正式仍 Confirm → DomainCommand |

## 3. 项目模式两型

### 3.1 `general`（通用项目夹）

- 形式：多 bot 列表 + 总控拆派/汇总（同 [agent-project-folder](./agent-project-folder.md) 形式）。  
- **无**专利五步 / FTO 矩阵等 DomainPack 步骤。  
- bot 仍须**分剧本**（禁换皮同 script）；但剧本是「通用协作」级（纪要、拆派、检索只读…），不绑 `StageId`/案。  
- `caseId`：**可选空**。

### 3.2 `domain`（领域包项目）

- 挂一个 **DomainPack**（可插拔）。  
- **`patent` 为首包**：现有专家四件套（工具 / 剧本状态机 / DomainCommand 候选 / 护栏）见 [agent-project-folder §2–3](./agent-project-folder.md)。  
- 预留槽：`DomainPackId = 'patent' | 'future_*'`（样机只实现 patent；其他 disabled +「另立项」）。  

```ts
type ProjectKind = 'general' | 'domain'

type AgentProject = {
  id: string
  title: string
  kind: ProjectKind
  domainPackId?: 'patent' // required when kind==='domain'
  expertIds: string[]
  caseId?: string        // domain/patent 可绑；general 默认无
}
```

### 3.3 专利专家包 = DomainPack，不是唯一项目

| 错误心智 | 正确心智 |
|----------|----------|
| 「做项目 = 必须跑专利专家」 | 可建 **general** 项目，零专利步骤 |
| 「Agent 产品 = 只有专利包」 | **patent** 是第一个 DomainPack；入口仍含通用单聊 |
| 「旧 Catalog 废弃」 | Catalog/`AgentDef` 仍是专家插件源；Pack 引用哪些 expertId |

## 4. 旧 `sessions` 定位

| 用法 | 说明 |
|------|------|
| **主心智** | 通用 Agent 的历史会话列表（`/agent/sessions`） |
| **兼容** | 旧深链 `/agent/sessions/:id` 仍打开；若无 `projectId` 视为通用历史 |
| **不** | 把「项目文件夹」与「sessions 列表」并列为两个主入口抢默认；项目从「项目」导航进 |

项目内专家一对一聊产生的线程：挂在 `projectId + expertId` 下；可在 sessions 列表用标签过滤，避免两套真相。

## 5. DomainPack 插拔（样机最小）

| Pack | 提供 | 样机 |
|------|------|------|
| `patent` | 专家 id 列表、步骤条组件键、命令候选表、深链（search/fto/…） | 启用 |
| （预留） | — | 侧栏灰显 |

切换 Pack ≠ 换壳端口；仍在 `apps/agent:5175`。

## 6. 写库与诚实

- 全模式：试运行不写；正式 **HITL → DomainCommand**。  
- `backend: 'mock'`（或剧本名）；禁真 LLM、禁本波真 case-core。  
- 横幅建议：`样机 · 无真 LLM · 通用/项目分入口`。

## 7. 验收

- [ ] 默认进通用单聊，不强制建项目  
- [ ] 可建 general 项目：多 bot+总控，无专利步骤  
- [ ] 可建 domain/patent 项目：专家四件套可区分  
- [ ] sessions 不与项目主心智打架  
- [ ] 写库路径未放松  

## 8. Owner

- 规格：架构设计（本稿）  
- 壳：Agent应用助手并行改 `apps/agent`

## 评审

- [product-apps/REVIEW.md](./REVIEW.md) · B席轻扫段（对象 `4cf2e47`）
