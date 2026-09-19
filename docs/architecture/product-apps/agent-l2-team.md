# L2 团队模式（bot 自发互通 · 协作任务）

> **冻结**：L1 Pass 后开 L2。L2 = 团队；**bot 之间能通信**；bot **自己**发给别的 bot，一块完成任务。  
> **边界**：仅 `/agent/team` 与 `/agent/bots/*`（及团队内深链）；**不**污染 L1 `/agent` 单助手主路径。  
> **样机诚实**：消息与协作可全 mock；无真 LLM；写库仍 HITL。  
> **对齐**：[agent-layers](./agent-layers.md) · [agent-grok-replica](./agent-grok-replica.md)。

## 1. 与 L1 边界

| | L1 `/agent` | L2 `/agent/team` |
|--|-------------|------------------|
| 主屏 | 单助手 + composer | 多 bot 侧栏 + 当前 bot 流 |
| bot→bot | **无**（或极弱） | **有**：自发消息 |
| 进入 | 冷启动默认 | 显式「团队」升级 |

禁止：在 L1 主路径塞多 bot 墙或自动互通噪音。

## 2. bot→bot 自发消息（非仅用户转发）

| 类型 | 谁触发 | 样机行为 |
|------|--------|----------|
| **用户转发** | 人 | 次级；已有可保留 |
| **自发消息（本刀重点）** | **源 bot 剧本/规则** | 源 bot 在「任务步」完成后，**自动**向目标 bot 线程投递一条 `BotMessage`（无需用户点转发） |

```ts
type BotMessage = {
  id: string
  fromBotId: string
  toBotId: string
  body: string
  taskId?: string          // 协作任务
  kind: 'request' | 'result' | 'note'
  at: string
  spontaneous: true        // 标记自发，区别于用户转发
}
```

投递后：目标 bot 会话流出现该条；可选侧栏未读点。

## 3. 协作完成任务（样机路径）

最小可点故事（mock 状态机）：

```text
1. 用户在团队模式对「编排 bot」说：请检索+摘要（或点「演示协作任务」）
2. 编排 bot 创建 Task { id, goal, steps[] }
3. 步骤A：编排 → 自发消息给 search-bot（kind=request）
4. search-bot 剧本：短延迟 → 自发回 result（假 Hit 摘要）给编排
5. 步骤B：编排 → 自发消息给 draft-bot（带上检索摘要）
6. draft-bot → 自发回 result（假段落）
7. 编排 bot 主线程汇总「任务完成」卡片
```

| 验收点 | 说明 |
|--------|------|
| 自发 | 步骤 3–6 **无**用户点「转发」 |
| 可见 | 各 bot 一对一线程能看到来去消息 |
| 任务卡 | 编排侧可见 task 状态：running → done |

## 4. 路由

```text
/agent              → L1（不动）
/agent/team         → L2 主壳（多 bot + 互通）
/agent/bots/:id     → L2 一对一（可从 team 选中）
/agent/bots/new     → L2 新建 bot
```

## 5. 不做（本刀）

- L3 中台端到端大拆  
- 真 LLM 多 agent  
- 在 L1 默认路径开互通  

## 6. 验收

- [ ] 仅 team/bots 路径具备自发 bot→bot  
- [ ] 一条协作任务可点完，消息自动落在相关 bot 线程  
- [ ] L1 `/agent` 仍是单助手、无多 bot 墙  

## 7. Owner

Agent应用助手 · 只改 `apps/agent`  
