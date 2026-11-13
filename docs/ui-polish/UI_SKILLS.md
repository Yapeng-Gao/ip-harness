# UI Skills（冻结 · 2026-09-18）

后续 **所有** UI 评估 / 质感打磨 / 评审，一律使用下列三套 skill：

| Skill | 来源 | 管什么 |
|-------|------|--------|
| `apple-design` | [emilkowalski/skills](https://github.com/emilkowalski/skills/tree/main/skills/apple-design) | 苹果动效手感：按压反馈、拖拽跟随、弹簧、排版字距、可中断动画（Web） |
| `make-interfaces-feel-better` | [jakubkrehel](https://github.com/jakubkrehel/make-interfaces-feel-better) | 微交互与视觉细节：hover、阴影、边框、光学对齐、排版 |
| `web-design-guidelines` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | Web 规范 / 无障碍 / 可用性审查 |

## 分工

| 问题类型 | 先读 |
|----------|------|
| 动效 / 手感 / 弹簧 / 拖拽 | `apple-design` |
| 视觉毛刺 / hover / 阴影 / 对齐 | `make-interfaces-feel-better` |
| a11y / 焦点 / 对比度 / aria | `web-design-guidelines` |
| 仓内 token / 多壳语言 | `DESIGN_SYSTEM.md` + `src/index.css` |

## 已退役

`apple-hig-full`（旧 HIG 大包）已退役，**勿再引用**。

## 角色

- **UI评估助手**：只评不改；三 skill + EVAL_RUBRIC
- **UI质感助手**：只改视觉；三 skill + DESIGN_SYSTEM
