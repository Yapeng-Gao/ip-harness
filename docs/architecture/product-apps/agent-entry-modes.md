# Agent 入口模式（IA · 自由度冻结 · 2026-09-19）

> **冻结（用户澄清 · 覆盖名单 widget）**：  
> 1) **通用 Grok** = **自由**：用户可**自设 bot**；与每个 bot **一对一聊**；**bot 之间可通消息**（编排/转发）。  
> 2) **项目模式** = 同壳，但 **IP 专家固定**（默认：`orchestrator` / `search` / `draft` / `fto` ± `mining`）——把专利专家「焊」进夹内各 bot，**不如通用自由**（不可随意增删改专家身份）。  
> **样机诚实**：通用侧先 mock「新建 bot / bot 互通」形状；写库 **HITL → DomainCommand**；禁真 LLM / 真 case-core。  
> **本波优先**：[agent-grok-replica](./agent-grok-replica.md)（通用壳视觉复刻）。  
> **对齐**：[agent-project-folder](./agent-project-folder.md) · [agent-case-binding](./agent-case-binding.md) · [agent-sessions-project-threads](./agent-sessions-project-threads.md)。

## 1. 两种主模式（冻结）

| 模式 | 壳形态 | 自由度 | 项目夹 |
|------|--------|--------|--------|
| **通用 Grok（默认）** | 侧栏 bot 列表 + 一对一聊 + 互通 | **高**：自设 bot、改名/归档、bot↔bot 消息 | 无（或弱关联） |
| **项目模式** | **同一套** Grok 壳 | **低**：IP 专家身份**固定**；不可当通用一样乱加专家 | **有**：夹内焊好专家 |

```text
/agent                              → 通用 Grok（默认）
/agent/bots/:botId                  → 与某 bot 一对一
/agent/bots/new                     → 新建 bot（样机 mock）
/agent/intercom 或会话内「转发」    → bot 互通（样机 mock）
/agent/projects                     → 项目列表
/agent/projects/:id                 → 项目夹（固定专家侧栏）
/agent/projects/:id/bots/:expertId  → 项目内专家聊（身份只读）
/agent/sessions                     → 历史聚合
```

**废止**：默认 = 无侧栏单 Composer；以及「通用壳侧栏焊死专利专家、与项目同自由度」的旧表述。

## 2. 自由 vs 固定（核心差异）

| 维度 | 通用 Grok | 项目模式 |
|------|-----------|----------|
| 增删 bot | **可**：新建/归档自定义 bot | **不可**改专家花名册（固定 Pack 成员） |
| 改身份/剧本 | 自定义 bot 可改展示名、短设定（样机） | 专家 `AgentDef`/四件套**只读引用**；禁用户改成别的领域 |
| 一对一聊 | 每个 bot 可聊 | 每个固定专家可聊 |
| bot 互通 | **有**：消息/转发/总控代派（mock） | 总控拆派**本夹**专家；专家间互通可选，但仍在固定名单内 |
| 专利四件套 | **可选挂载**：用户可添加「检索/FTO…」类 bot（可从模板创建），非焊死唯一列表 | **焊死**：夹创建时带上默认专家名单 |
| 案 | 不强制 | 可空开再绑 |

一句话：**通用 = 自由机器人工作区；项目 = 固定 IP 专家专班。**

## 3. 通用侧 · 样机形状（mock 即可）

### 3.1 新建 bot

| 字段（示意） | 说明 |
|--------------|------|
| `id` / `name` | 用户起名 |
| `kind` | `custom` \| `template:<expert-search|…>`（从模板克隆剧本） |
| `systemBrief` | 短设定（样机 textarea） |

列表可混：用户 bot + 可选「从模板添加的专利能力 bot」。  
**不**要求用户必须先有专利模板才能用通用壳。

### 3.2 bot 互通

| 能力 | 样机 |
|------|------|
| 转发 | 会话内「转发给 bot X」→ 在 X 线程出现一条引用消息（内存） |
| 编排 | 总控类 bot（可用户自建或系统种子）发「请 @search 做…」→ 目标 bot 收件箱事件 |
| 禁止 | 真 LLM 多 agent；跨项目乱传；绕过 HITL 写库 |

事件形状示意：`{ fromBotId, toBotId, body, refThreadId?, at }`。

## 4. 项目模式 · 固定专家

创建/打开项目时侧栏**仅**：

| id | 角色 |
|----|------|
| `orchestrator` | 总控（拆派本夹专家） |
| `expert-search` | 检索 |
| `expert-draft` | 撰稿/交底 |
| `expert-fto` | FTO |
| `expert-mining` | 挖掘（±；可配置缺省隐藏，但仍属固定池，非用户乱加） |

- UI：**无**「新建专家」；设置里最多「显示/隐藏 mining」，不能改成「营销 bot」。  
- 四件套与状态机见 [agent-project-folder](./agent-project-folder.md)。  
- 自由度文案建议角标：`项目 · 专家固定`。

## 5. 默认落地路由

1. `/agent` = 通用 Grok（自由 bot 列表；可含种子示例 bot）。  
2. 「项目」→ 固定专家夹。  
3. 单 Composer 若保留 → `/agent/compose` 降级入口。

## 6. sessions / Catalog

| 概念 | 关系 |
|------|------|
| sessions | 聚合通用 bot 线程 + 项目专家线程（标签区分） |
| Catalog | 模板/系统专家定义源；项目焊死引用；通用「从模板新建」也读此 |
| 自定义 bot | 只存在于通用壳用户配置（样机内存）；**不**自动进入项目花名册 |

## 7. 案绑定 / 写库

- 案不挡入口：[agent-case-binding](./agent-case-binding.md)。  
- 写库：HITL → DomainCommand；自定义 bot 默认可标「只读/无命令」直至挂模板。

## 8. 验收

- [ ] 通用：可 mock 新建 bot；可一对一；可 mock bot 互通/转发  
- [ ] 项目：侧栏专家固定；无「新建专家」；角标或文案标明固定  
- [ ] 通用 ≠ 项目自由度，UI 可感知  
- [ ] 默认仍进通用 Grok，非强制先建项目  
- [ ] 写库路径未放松  

## 9. Owner

- 规格：架构设计  
- 壳：Agent应用助手跟此落地  
