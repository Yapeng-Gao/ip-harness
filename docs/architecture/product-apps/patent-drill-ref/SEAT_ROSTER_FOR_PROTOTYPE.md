# 专利席位花名册（样机对齐用 · 短表）

硬规则：每席成果 `NN_*.md` + 过程 `NN_*_worklog.md`；案目录 `/workspace/docs/patent-drill/<案号>/`。  
示意流：全景∥激发∥竞品 → 挖掘 → 布局 → 查新 → 立项(Go) → 交底 → 撰写 → 制图∥FTO → 递交(authorize→file) → OA（未 file 不派）。

| 角色 | bot id | 任务（一句话） | 成果键 / 文件 | 过程 worklog | 上游 | 下游 |
|------|--------|----------------|---------------|--------------|------|------|
| 产业全景 | 4438018 | 赛道全景支撑是否立项 | `landscape_report` → `01_landscape_report.md` | `01_landscape_report_worklog.md` | 主题/客户意向 | 激发、竞品、挖掘 |
| 创新激发 | 4438028 | 收敛可专利方向 | `inspire_brief` → `02_inspire_brief.md` | `02_inspire_brief_worklog.md` | 全景 | 挖掘 |
| 竞品监控 | 4438025 | 对手威胁分级 | `competitor_watch` → `03_competitor_watch.md` | `03_competitor_watch_worklog.md` | 全景 | 挖掘、布局、查新 |
| 专利挖掘 | 4438027 | 拆可申请提案/特征 | `mining_pack` → `04_mining_pack.md` | `04_mining_pack_worklog.md` | 全景/激发/竞品 | 布局、查新 |
| 专利布局 | 4438022 | 主从案与保护网 | `layout_plan` → `05_layout_plan.md` | `05_layout_plan_worklog.md` | 挖掘 | 查新、立项 |
| 检索员（查新暨三性） | 4294909 | 查新+三性意见书 | `research_report` → `06_research_report.md` | `06_research_report_worklog.md` | 挖掘/布局 | 立项、交底、撰写 |
| 立项决策 | 4294912 | Go/范围（报价附属） | `intake_quote` → `07_intake_quote.md` | `07_intake_quote_worklog.md` | 01–06 | 交底（须 Go） |
| 交底整理 | 4295121 | 可实施交底书 | `disclosure_pack` → `08_disclosure_pack.md` | `08_disclosure_pack_worklog.md` | 立项+查新 | 撰写 |
| 撰写代理师 | 4294910 | 特征→规划→权要+说明书 | `draft_claims` → `09_draft_claims.md` | `09_draft_claims_worklog.md` | 交底+查新 | 制图、FTO、递交、OA |
| 制图对接 | 4294913 | 附图任务与冻图号 | `figure_list` → `10_figure_list.md` | `10_figure_list_worklog.md` | 撰写 | 递交、OA、FTO（图号） |
| FTO律师 | 4294911 | 自由实施+claim chart | `fto_memo` → `11_fto_memo.md` | `11_fto_memo_worklog.md` | 撰写（≠查新） | 递交（blocker 闸） |
| 递交流程员 | 4295122 | 齐套→authorize→file | `filing_checklist` → `12_filing_checklist.md`（+可选 `12b_file_receipt.md`） | `12_filing_checklist_worklog.md` | 撰写+图+FTO | **仅总控**派 OA（禁直传） |
| OA答复代理师 | 4295123 | OA 策略与陈述 | `prosecution_response` → `13_prosecution_response.md` | `13_prosecution_response_worklog.md` | **已 file** | 撰写/交底/检索/制图（迭代） |
| 专利全链路总控 | （本席） | 分派验收、docx、闸门、迭代 | `case_state.md`；可选 `00_case_worklog.md` | `00_case_worklog.md` | 用户/平台 | 各席 |

并行：制图∥FTO（权要确认后）。详规：`OWNER_DELIVERABLE_MATRIX.md`、`PROCESS_VISIBILITY.md`。
