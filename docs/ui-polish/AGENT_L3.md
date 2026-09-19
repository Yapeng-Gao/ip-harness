# Agent L3 专利专家 · 中台映射（2026-09-19）

对齐规格：`docs/architecture/product-apps/agent-l3-patent.md`（`5ade0b3`）· `agent-layers.md` §5。

禁 Cloud；仅 `apps/agent/**` + 本短记/截图。**勿污染 L1**（`/agent`）与 **L2**（`/agent/team`）。

## §6 验收对照

| 验收 | 落地 |
|------|------|
| 项目夹侧栏 = 固定专家（检索/FTO/撰稿；附图/挖掘 ±） | `PATENT_PROJECT_EXPERT_IDS`：orchestrator + search/draft/fto + mining/figure |
| 每专家可走通各自 mock 剧本 | 各席独立 steps/tools/shortcuts；侧栏切换可见差异 |
| 至少一条 Confirm→DomainCommand 写库示意 | 撰稿 Confirm → `saveDraft` 形状记入 `domainCommandWrites`（正式闸未过时仍诚实记示意）；可深链 mid 案详 |
| L1 `/agent`、L2 `/agent/team` 无焊死专利花名册 | 未改 L1/L2 路由与 GeneralBots |
| 无真 LLM / 真 case-core | mock 剧本 + 内存写库示意 |

## 可点闭环

1. `/agent/projects/proj-demo-patent` 进入专利项目  
2. 总控点「演示 L3」→ 自发派 `expert-draft` → 跳至 Confirm  
3. 撰稿席 Confirm → DomainCommand.`saveDraft` 写库示意 + 右侧中台映射面板  
4. （可选）深链 mid 案详看 handoff 示意  

## 截图

`docs/ui-polish/agent-l3/`：

- `l3-patent-home.png` — 专利项目：固定专家侧栏 + L3 中台映射  
- `l3-demo-confirm.png` — 演示 L3 后撰稿 Confirm / 写库示意  
- `l3-mid-map.png` — 右侧 bot→节点映射表与 DomainCommand 日志  

## 自点

- [x] 专利项目侧栏见检索/FTO/撰稿/挖掘/附图（差异化剧本）
- [x] 「演示 L3」→ Confirm → DomainCommand 写库示意
- [x] `/agent` 仍 L1；`/agent/team` 仍 L2 自由 bot
- [x] `npm run typecheck -w @ip/agent` 通过
