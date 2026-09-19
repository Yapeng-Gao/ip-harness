# Agent L1 默认单助手（2026-09-19）

对齐规格：`docs/architecture/product-apps/agent-layers.md`（`24a6d8f` / `a789c3d`）。

禁 Cloud；仅 `apps/agent/**` + 本短记/截图。

## 心智

| 层 | 入口 | 用户一句话 |
|----|------|------------|
| **L1** | `/agent` | 跟**一个**助手聊（ChatGPT/Kimi 形） |
| **L2** | `/agent/team` 或侧栏「团队模式」 | 一队 bot，可互转 |
| **L3** | 项目/专利专家（次级，本波不推销） | 专家产出对接中台 |

**禁止**：冷启动 `/agent` 甩多 bot 侧栏墙。

## 路由表

| Path | 层 | 行为 |
|------|----|------|
| `/agent` | L1 | 单助手 + sticky composer；顶栏「团队模式」显式升级 |
| `/agent/team` | L2 | Grok 多 bot 侧栏 + 主聊（保留 `7ea0a16` 一带） |
| `/agent/bots/:id` | L2 | 一对一 |
| `/agent/bots/new` | L2 | 自设 bot |
| `/agent/compose` | 兼容 | 旧 Composer，非主心智 |
| `/agent/sessions*` | — | HITL / 历史，未破 |
| `/agent/projects*` | L2/L3 容器 | 次级，未破 |
| `/agent/lab` | 展廊 | 各版活口；L1 标「当前默认」 |

## 实现要点

- 新页 `AgentL1Shell`：无 bot 侧栏；复用 `GeneralBotChatPane`（`showForward={false}`）
- `App` index → L1；新增 `team` → `GeneralGrokShell`
- `AgentShell`：L1 品牌「知产助手」；L2「团队 · Grok」；均隐藏会话 inbox 侧栏
- Lab 卡片：L1 默认 + L2 团队分卡

## 截图

见 `docs/ui-polish/agent-l1/`：

- `l1-home.png` — `/agent` 主屏（无多 bot 墙）
- `l2-team.png` — 点「团队模式」进 L2

## 自点

- [ ] `/agent` 第一眼单助手聊天 + 底栏输入
- [ ] 可见「团队模式」→ `/agent/team` 多 bot 侧栏
- [ ] sessions / projects / lab / HITL 仍可达
- [ ] `npm run typecheck -w @ip/agent` 通过
