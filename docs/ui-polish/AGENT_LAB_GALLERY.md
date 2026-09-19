# Agent 原型展廊（Lab Gallery）· 2026-09-19

禁 Cloud；仅 `apps/agent/**` + 本短记。默认 `/agent` 仍为 Grok 复刻（`7ea0a16`）。

## 路由

| Path | 行为 |
|------|------|
| `/agent/lab` | 原型卡片网格（主入口） |
| `/agent/gallery` | 重定向 → `/agent/lab` |

侧栏「更多」→ 原型展廊；Grok 壳顶角「展廊」同链。

## 卡片清单

| # | 版本名 | 一句话 | 入口 |
|---|--------|--------|------|
| 1 | V·Grok 复刻（当前默认） | 自由 bot 侧栏 + 主聊 | `/agent` |
| 2 | V·旧 Composer | 单聊开始办理 | `/agent/compose` |
| 3 | V·Catalog | Agent 目录 | `/agent/agents` |
| 4 | V·会话+HITL | 会话 + 请你确认闸 | `/agent/sessions/sess-oa-1?focus=hitl`（次链：会话列表） |
| 5 | V·项目·固定专家 | 项目夹固定专家 | `/agent/projects/proj-demo-patent`（次链：项目列表） |
| 6 | V·Harness 说明 | 编排鸟瞰 | `/agent/harness` |

## 实现要点

- 新页 `AgentLabGallery.tsx`；`App.tsx` 注册 `lab` / `gallery`。
- `GeneralBotSidebar`「更多」链 lab；`GeneralGrokShell` 顶角链 lab。
- **未**改动默认 index → `GeneralGrokShell`。

## 自点

- [ ] `/agent/lab` 六卡可点进活口
- [ ] `/agent` 仍是 Grok（侧栏 bot + 主聊）
- [ ] `npm run typecheck -w @ip/agent` 通过
