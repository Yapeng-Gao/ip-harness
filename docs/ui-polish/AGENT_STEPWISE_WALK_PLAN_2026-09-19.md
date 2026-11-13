# Agent 逐步走查计划 · 2026-09-19

## 目标
从第一步起逐步走完 Agent :5175。每步用 e2e 和/或 CDP/猎虫取证，并评估：业务逻辑 · 页面逻辑 · 业务表现 · 页面表现 · 用户体验 · UI。一步一结，不跳步。对照规格 agent-entry-modes / agent-case-binding；硬闸：无 mid 深链、无 BillingHold 全宽黄条、Home 案件入口=1。

## 步骤
| ID | 用户动作 | 期望 URL/态 | 取证 |
|----|----------|-------------|------|
| S0 | 打开 /agent Home | 竖导航、待确认、compose、单套 CaseBind | CDP 截图+console |
| S1 | （可选）创建并绑定新案 | caseId 写入、入口仍可开工 | e2e/CDP |
| S2 | 无案点「开始办理」 | 进 /agent/sessions/:id，无强制案 | e2e |
| S3 | 会话轨迹/回复可见 | mock 剧本推进 | CDP |
| S4 | HITL Confirm 可见可点 | ConfirmBar 业务闸正确 | hunt CP-agent-hitl + CDP |
| S5 | 会话顶栏绑案 | 先聊后案 | e2e |
| S6 | 会话列表 + 待确认筛选 | segmented 全部/待确认/进行中 | CDP |
| S7 | Catalog 选 Agent | /agent/agents | CDP |
| S8 | 项目模式 general | /agent/projects 无专利步骤 | e2e |
| S9 | domain/patent + 专家私聊 | 总控/专家分剧本 | CDP |

## 每步产出模板
- 业务逻辑 Pass/Fail + 一句
- 页面逻辑 Pass/Fail
- 业务表现 / 页面表现 / UX / UI 各一句 + 级（Ok/Must/Should）
- 证据路径

## 总产出
`docs/ui-polish/AGENT_STEPWISE_WALK_2026-09-19.md` 逐步填；Must 汇总后排修。

Commit: `docs(ui): Agent stepwise walk plan S0–S9` and push if remotes work; otherwise leave committed locally.
