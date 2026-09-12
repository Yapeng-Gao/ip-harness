# 状态提醒 / 通知 — 产品面与后端边界

> **样机诚实**：今日**无真出站通道**（不发邮件/短信/Webhook）、**无调度器**、**无事件总线**；ops「试发」写 sessionStorage；mid Inbox 存在纯函数待办与 `apiMockInbox` **双轨**。  
> **落地目标**：说清各产品面怎么接提醒、后端谁拥有什么、用户说「提醒不行」时的架构根因，以及 MVP 最小可行集。

## 1. 产品面怎么接（落地目标）

| 产品面 | 端口 | 用户看到的「提醒」 | 数据从哪来（目标） | 今日样机 |
|--------|------|-------------------|--------------------|----------|
| **mid Inbox** | 5173 | 待办 / 风险 / 期限条 | `case-core` Inbox 查询 + `notify` 投递回执（已读状态可本地） | 纯函数 sla/watch/maintain + 可选 `GET /v1/inbox` → `apiMockInbox`；**不拆**现有纯函数轨 |
| **workbench** | 5174 | 办理截止、闸失败、Flow 阻塞提示 | 同步 `CommandResult` + 订阅 `ip.handoff.changed` / guardrail 结果 | 即时 UI；无推送 |
| **agent** | 5175 | HITL 待确认、正式执行失败 | `agent-session` 闸状态 + `ip.command.failed` | 内存会话；无推送 |
| **ops** | 5176 | 开发者/运营告警、通道健康 | `notify` 投递日志 + `ops-platform` 规则；事件名对齐 `DOMAIN_EVENTS` | `/config#alerts` 试发 toast + sessionStorage；Monitor **非 live** |
| **iam** | 5177 | 登录/Persona 变更提示 | `ip.persona.changed`（会话级） | cookie；非真 SSO |

原则：**办案真相在 `case-core` / `docket`；出站与用户提醒收件箱在 `notify`；ops 不持有 `PatentCase`。**

---

## 2. 后端边界

```text
[docket 调度到期] --命令/事件--> [case-core] --DOMAIN_EVENTS--> [notify 队列]
[用户办理失败]   --ip.command.failed--> [notify]
[ops 规则配置]   --订阅表--> [notify] --出站--> 邮件/企微/Webhook
                              \--写--> 投递日志（ops 可查）
[mid Inbox GET]  <-- 读模型（case-core）± 提醒已读（notify）
```

| 组件 | 负责 | 不负责 |
|------|------|--------|
| `docket` | 到期扫描、升级命令、发 `ip.docket.escalated` | 发邮件正文、持有 SMTP 密钥（可引用 ops 密钥 id） |
| `case-core` | Inbox 读模型、交接/命令结果 | 出站重试、通道健康 |
| `notify` | 订阅、模板、出站、投递日志、用户提醒条目 | 改 handoff / 改 PatentCase |
| `ops-platform` | 通道开关、密钥引用、告警规则 UI 后端 | 办案写 |

事件名（真实常量，契约 only）：`ip.command.failed` · `ip.docket.escalated` · `ip.handoff.changed` · `ip.audit.appended` 等 — 见 `packages/contracts/src/events.ts`。**禁止**壳内私造事件串。

---

## 3. 用户说「提醒不行」——架构侧原因（诚实）

按优先级对照今日实现：

| 现象 | 架构根因（样机） | 是否产品 bug |
|------|-----------------|--------------|
| 到期了没人喊 | **无调度器 / 无 cron / 无队列消费者**；docket 只在有人点命令时动 | 否 — 设计空洞 |
| 邮件/短信没收到 | **无真 SMTP/短信/Webhook**；ops 明确 skipped/mock | 否 — 禁止接真通道 |
| Inbox 与 mock 不一致 | **双轨**：纯函数 Inbox ≠ `apiMockInbox`；merge 策略跳过仅 API 新 id | 部分样机局限 |
| 跨口看不到同一条提醒 | 大块态靠 cookie / bridge last-write-wins，**非共享后端** | 样机预期 |
| ops 试发成功但对方无感知 | 只写 **sessionStorage + toast** | 样机预期 |
| 事件名对了仍无反应 | `DOMAIN_EVENTS` **无 bus、无订阅者** | 契约占位 |

对外话术：提醒不行，首先不是「再加点 UI」，而是 **通道 + 调度 + 单一读模型** 三项缺失。

---

## 4. MVP 最小可行

### 4.1 必做

1. **一个真通道**（建议：SMTP 或企业 Webhook 二选一；可私有化配置）。  
2. **一个调度器**：Redis 任务或 DB `SKIP LOCKED` 扫描 `docket` 到期 → 调升级或直接投递「到期提醒」。  
3. **notify 投递日志**（成功/失败/跳过）供 ops 查询；事件名用现成 `DOMAIN_EVENTS`。  
4. **Inbox 读模型单源**：壳只打 `GET /v1/inbox`（或等价）；纯函数轨降为本地 demo fallback 并标废弃日。  
5. 失败命令 → 可选站内提醒（mid）+ 可选出站（按规则）。

### 4.2 明确不做（MVP）

- 全通道（邮件+短信+电话+推送）一次上齐  
- 营销类通知  
- 让 ops 壳直接持案发「提醒」绕过 `notify`  
- 无队列的「前端 setTimeout 假装调度」当生产

### 4.3 验收

- 插入 `nextDeadline` 已过的事件 → 调度跑过 → 投递日志有行（或站内 Inbox 有条）。  
- 关掉通道配置 → 日志为 skipped，且**不**假装已发送。  
- 与 [../ops-observability.md](../ops-observability.md) 一致：真通道需总控开闸；文档与实现同步改口径。

---

## 5. 相关链接

- [backends.md](./backends.md) § notify / docket · [stack.md](./stack.md) · [roadmap.md](./roadmap.md)
- [../ops-observability.md](../ops-observability.md) · [../backends.md](../backends.md) §2.10 notify
- [../../../apps/ops/README.md](../../../apps/ops/README.md)（通知渠道样机）
- [../../../apps/api-mock/README.md](../../../apps/api-mock/README.md)（`GET /v1/inbox`）
