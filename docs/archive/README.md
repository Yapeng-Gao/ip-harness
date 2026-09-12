# 冷归档

只读历史材料。现状以 `docs/architecture/` 与根 `README` 为准。

## reviews/ — 历史页面 / UX / 节点审计

含：`AGENT_*`、`UI_AUDIT_*`、`*_PAGE_REVIEW*`、`DEEP_*`、`RESIDUAL_ISSUES`、`A11Y_NOTES` 等（2026-09-11 波次）。

## evals/ — 历史评测报告

含：`EVAL_2026-09-11`、`EVAL_IP_AGENT_PLATFORM`、`EVAL_POST_R5`。

## shots/ — 评测/QA 截图子树

从根 `shots/{eval-*,qa}` 迁入。根 `shots/*.png` 仍为演示编号图。

## 何时再归档

- 根或 `docs/` 出现「只服务某一轮评审、且已被新稿取代」的 md/图 → 挪入本目录对应子夹，并在本页补一行。
- 不要归档仍被 architecture README 链为权威的活文档。
