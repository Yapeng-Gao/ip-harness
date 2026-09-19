# Agent L3 专利全链路壳（2026-09-19）

对齐规格：`docs/architecture/product-apps/agent-l3-patent.md`（`afe94aa`）。

禁 Cloud；仅 `apps/agent/**` + 本短记/截图。**勿污染** L1 `/agent`、L2 `/agent/team`。**无**可点 mid 深链。

## 焊死名单（侧栏均可见）

`orchestrator` → `expert-search` → `expert-mining` → `expert-disclosure` → `expert-draft` → `expert-figure` → `expert-fto` → `expert-filing` → `expert-oa`

| 席 | 剧本要点 | 主产出 |
|----|----------|--------|
| 交底整理 | 技术点→交底结构→实施例提纲→Confirm | `disclosure_pack` |
| 撰稿 | 权项/摘要→修订→Confirm（**≠交底**） | `draft_claims` |
| 递交形式 | 国别→齐套→形式点→authorize 闸示意 | 禁真递交 |
| OA答复 | 假一通→策略→答复草稿→Confirm | `prosecution_response` |

## 演示全链路

总控席「演示全链路」：mock 延迟依次分派 8 席 → 各专家回执进私聊/时间线（类 L2 collab，落在项目专利专家上）。保留「演示 L3」单点撰稿 Confirm 路径。

## 截图

`docs/ui-polish/agent-l3-fullchain/`：

- `l3-fullchain-sidebar.png` — 九席侧栏 +「演示全链路」
- `l3-fullchain-running.png` / `l3-fullchain-done.png` — 全链路进行中 / 收齐回执
- `l3-disclosure-seat.png` / `l3-draft-seat.png` — 交底 ≠ 撰稿
- `l3-filing-seat.png` / `l3-oa-seat.png` — 递交 / OA 席

## 自点

- [x] 专利项目侧栏九席齐全（含 disclosure / filing / oa）
- [x] 「演示全链路」跑通 → 8 席回执
- [x] 撰稿 ≠ 交底（步骤条/工具卡可区分）
- [x] 无 mid 可点深链；未改 L1/L2
- [x] `npm run typecheck -w @ip/agent` 通过
