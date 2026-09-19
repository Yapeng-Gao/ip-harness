# Agent 入口模式（IA 改向 · 2026-09-19）

> **冻结（用户拍板 · 改向）**：  
> 1) **通用 Agent** = **复刻 Grok Bot 形式** + **专利 Agent 侧栏**（多 bot、可单独聊、可总控）——**不是**「默认单聊 Composer」主心智。  
> 2) **项目模式** = 在上述 Grok 壳上，再**设项目夹**并挂好 IP 专家。  
> **样机诚实**：mock 剧本；写库 **HITL → DomainCommand**；禁真 LLM / 真 case-core。  
> **对齐**：[agent-project-folder](./agent-project-folder.md) · [agent-case-binding](./agent-case-binding.md) · [agent-sessions-project-threads](./agent-sessions-project-threads.md) · [agent-surface](./agent-surface.md)。

## 1. 两种主模式（冻结）

| 模式 | 壳形态 | 项目夹？ | 专利专家？ | 案 |
|------|--------|----------|------------|-----|
| **通用 Agent（默认）** | Grok：左 **bot 列表** + 中一对一聊 + 可选总控席 | **否**（无文件夹导航） | **是**：专利专家包直接挂在壳级侧栏 | 不强制；可后绑 |
| **项目模式** | **同一套** Grok 壳 | **是**：先有/再建项目夹，专家挂在夹内 | **是**：夹内挂 IP 专家（同 Pack） | 可空开再绑 |

```text
/agent                         → 通用 Agent（默认）：侧栏专利 bots + 总控 + 当前 bot 会话
/agent/bots/:botId             → 与某专家一对一（通用壳）
/agent/projects                → 项目列表（进入项目模式）
/agent/projects/:id            → 项目夹：侧栏=该夹专家+总控
/agent/projects/:id/bots/:id   → 项目内专家聊
/agent/sessions                → 历史聚合（通用线程 + 项目线程）
/agent/agents                  → Catalog 管理/说明（非默认干活入口）
```

**废止心智**：默认落地 = 无侧栏的单 Composer、靠 Catalog 下拉换皮。

## 2. 通用 vs 项目 · 差异表

| 维度 | 通用 Agent | 项目模式 |
|------|------------|----------|
| 默认打开 | `/agent` Grok 多 bot | 从「项目」进夹；不抢默认 |
| 侧栏内容 | **壳级**专利专家 + 总控 | **该项目**成员专家 + 总控 |
| 总控 | 有：拆派给壳级专家、汇总 | 有：拆派给**本夹**专家、汇总 |
| 专家剧本 | 专利四件套（检索/撰稿/FTO/挖掘…） | 同 Pack；可按项目裁剪成员 |
| 会话归属 | `source: general`（可带 expertId） | `source: project` + projectId |
| 案 | 可选绑到「当前通用上下文」 | 可选绑到项目（见 case-binding） |
| 协作边界 | 跨会话弱；无夹级归档 | 夹级时间线/成员/案引用 |

## 3. 默认落地路由

1. 打开 `apps/agent:5175` → **`/agent`** = Grok 壳 + **默认选中总控或检索专家**（实现择一，须可点换 bot）。  
2. 顶栏/侧栏入口「项目」→ `/agent/projects`。  
3. **不得**把「先建项目」做成唯一能聊专家的路径。

## 4. 默认专利专家名单（建议 · 可改）

> 用户未另选时，按此默认；Catalog/`AgentDef` 仍是权威定义源。

| 侧栏 id | 角色 | 说明 |
|---------|------|------|
| `orchestrator` | 总控席 | 只拆派+汇总；不替代领域剧本 |
| `expert-search` | 检索 | search 故事状态机 |
| `expert-draft` | 撰稿/交底 | 文档/交底剧本 |
| `expert-fto` | FTO | 五步分析 |
| `expert-mining` | 挖掘 | 交底→发明点（可选，样机可先灰显） |

细则与四件套：[agent-project-folder](./agent-project-folder.md)。  
**通用壳与项目夹共用同一套专家 id**；差别是「挂在壳级还是夹级」。

## 5. 与旧 sessions / Catalog

| 旧概念 | 新关系 |
|--------|--------|
| 单聊 Composer 默认 | **降级**：可作为某 bot 会话区实现，不再是整壳主心智 |
| `/agent/sessions` | 历史聚合仍有效（通用专家线程 + 项目线程）见 [sessions-project-threads](./agent-sessions-project-threads.md) |
| `/agent/agents` Catalog | **管理/发现**面板；干活从侧栏 bot 点进 |
| `AgentDef` / `AGENT_CATALOG` | 专家插件源不变；通用壳侧栏 = Pack 默认成员列表 |
| 旧「general 项目=无专利步骤」 | **改向**：专利专家已在**通用壳**；项目夹用于**归档/绑案/裁剪成员**，不是「才出现专利 bot」的门槛 |

## 6. DomainPack

- **patent** 仍为首包，定义专家成员与剧本。  
- 通用 Agent：壳启动即加载 patent 默认成员。  
- 项目：创建项目时选择 Pack（默认 patent）并拷贝/引用成员列表。  
- 预留其他 Pack：灰显 +「另立项」。

## 7. 案绑定（不变）

先聊/先项目；案不挡入口。见 [agent-case-binding](./agent-case-binding.md)。

## 8. 写库与诚实

- 试运行不写；正式 HITL → DomainCommand。  
- 横幅：`样机 · 无真 LLM · Grok 多专家壳`。

## 9. 验收

- [ ] 默认 `/agent` 即见多 bot 侧栏（含总控+≥2 专利专家），可单独聊  
- [ ] 非「仅 Catalog 下拉的单 Composer」主心智  
- [ ] 可进入项目模式：设夹并挂专家；与通用壳形态一致  
- [ ] sessions 聚合仍可用  
- [ ] Catalog 不抢默认干活入口  
- [ ] 写库路径未放松  

## 10. Owner

- 规格：架构设计  
- 壳：Agent应用助手（`apps/agent`）  
