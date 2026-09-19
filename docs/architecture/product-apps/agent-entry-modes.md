> **叠层主心智**：[agent-layers.md](./agent-layers.md)。**默认冷启动 = L1**；**L2 与 L3 并列独立入口**（顶栏可达），勿写成「L3 只能从 L2 升」。
# Agent 入口模式（IA · 并列入口钉 · 2026-09-19）

> **冻结（入口钉）**：  
> 1) **L1 默认** = `/agent` 单助手（一会话一助手 + composer）。  
> 2) **L2 独立入口** = `/agent/team`（顶栏「团队」）+ `/agent/bots/*`；见 [agent-l2-team](./agent-l2-team.md)。  
> 3) **L3 独立入口** = `/agent/projects`（顶栏「专利项目」）；夹内 **IP 专家焊死**；见 [agent-l3-patent](./agent-l3-patent.md)。  
> **废止**：「L3 只能从 L2 升级进入」「项目埋在团队里无顶栏」。  
> **样机诚实**：写库 **HITL → DomainCommand**；禁真 LLM / 真 case-core。  
> **对齐**：[agent-layers](./agent-layers.md) · [agent-project-folder](./agent-project-folder.md) · [agent-case-binding](./agent-case-binding.md)。

## 1. 入口分层（冻结 · 并列）

| 入口 | 路由 | 顶栏 | 形态 |
|------|------|------|------|
| **L1 单助手（默认）** | `/agent` | （主） | 一助手 + composer |
| **L2 团队（独立）** | `/agent/team`、`/agent/bots/*` | 「团队」 | 多 bot + 自发互通 |
| **L3 专利项目（独立）** | `/agent/projects…` | 「专利项目」 | 焊死 IP 专家 + 中台映射示意 |

```text
/agent                              → L1 单助手（默认冷启动）
/agent/team                         → L2 团队主壳（多 bot）
/agent/bots/:botId                  → L2 一对一（仅团队域）
/agent/bots/new                     → L2 新建 bot（样机 mock）
/agent/projects                     → 项目列表
/agent/projects/:id                 → 项目夹（固定专家侧栏）
/agent/projects/:id/bots/:expertId  → 项目内专家聊（身份只读）
/agent/sessions                     → 历史聚合
```

**废止**：  
- 「`/agent` = 通用 Grok / 默认多 bot 侧栏」  
- 「默认 = 无侧栏单 Composer」的旧废止句（现已恢复为 L1 默认）  
- 「通用壳侧栏焊死专利专家、与项目同自由度」

## 2. 自由 vs 固定（L2 团队 vs 项目）

| 维度 | L2 通用团队（`/agent/team`） | 项目模式 |
|------|------------------------------|----------|
| 增删 bot | **可**：新建/归档自定义 bot | **不可**改专家花名册（固定 Pack 成员） |
| 改身份/剧本 | 自定义 bot 可改展示名、短设定（样机） | 专家 `AgentDef`/四件套**只读引用** |
| 一对一聊 | 每个 bot 可聊 | 每个固定专家可聊 |
| bot 互通 | **有**：自发消息 + 转发（见 [agent-l2-team](./agent-l2-team.md)） | 总控拆派**本夹**专家；仍在固定名单内 |
| 专利四件套 | **可选挂载**（从模板添加），非焊死 | **焊死**：夹创建时带上默认专家名单 |
| 案 | 不强制 | 可空开再绑 |

一句话：**L1 = 单助手；L2 通用 = 自由机器人工作区；项目 = 固定 IP 专家专班。**

## 3. L2 通用侧 · 样机形状（仅 /team · bots）

### 3.1 新建 bot

| 字段（示意） | 说明 |
|--------------|------|
| `id` / `name` | 用户起名 |
| `kind` | `custom` \| `template:<expert-search|…>` |
| `systemBrief` | 短设定（样机 textarea） |

**不**在 L1 `/agent` 暴露新建 bot。

### 3.2 bot 互通

| 能力 | 样机 |
|------|------|
| 自发消息 | 源 bot 剧本完成后自动投递目标 bot（本刀重点） |
| 转发 | 会话内「转发给 bot X」（次级） |
| 禁止 | 在 L1 开互通；真 LLM 多 agent；绕过 HITL 写库 |

## 4. 项目模式 · 固定专家

创建/打开项目时侧栏**焊死全链路**（见 [agent-l3-patent](./agent-l3-patent.md)）：

| id | 角色 |
|----|------|
| `orchestrator` | 总控 |
| `expert-research` | 调研（`research_report`） |
| `expert-intake` | 立项（`intake_quote`+`go_nogo`） |
| `expert-disclosure` | 交底整理 |
| `expert-draft` | 撰稿 |
| `expert-figure` | 附图（辅席） |
| `expert-fto` | FTO（辅席） |
| `expert-filing` | 递交/形式 |
| `expert-oa` | OA答复 |

- UI：**无**「新建专家」。  
- 四件套见 [agent-project-folder](./agent-project-folder.md)。  
- 角标：`项目 · 专家固定`。

## 5. 默认落地路由（并列入口）

1. `/agent` = **L1**（默认冷启动）。  
2. 顶栏「团队」→ `/agent/team`（**L2 独立**）。  
3. 顶栏「专利项目」→ `/agent/projects`（**L3 独立**；不经 L2）。  
4. 旧 `/agent/compose` 若保留 → 重定向 L1。

## 6. sessions / Catalog

| 概念 | 关系 |
|------|------|
| sessions | 聚合 L1 会话 + L2 bot 线程 + 项目专家线程（标签区分） |
| Catalog | 模板/系统专家定义源；项目焊死引用；L2「从模板新建」也读此 |
| 自定义 bot | 只存在于 L2 用户配置（样机内存）；**不**进入 L1；**不**自动进项目花名册 |

## 7. 案绑定 / 写库

- 案不挡入口：[agent-case-binding](./agent-case-binding.md)。  
- 写库：HITL → DomainCommand；自定义 bot 默认可标「只读/无命令」直至挂模板。

## 8. 验收

- [ ] **默认冷启动进 L1**  
- [ ] 顶栏可直接进 **L2 `/agent/team`** 与 **L3 `/agent/projects`**（并列，互不埋）  
- [ ] 多 bot / 互通仅 L2 路由；L3 专家焊死且无「新建专家」  
- [ ] 写库路径未放松  

## 9. Owner

- 规格：架构设计  
- 壳：Agent应用助手跟此落地  
