# 冷归档

只读历史材料。现状以 `docs/architecture/`、`docs/README.md` 与根 `README.md` 为准。

## 子树一览（实码）

```text
docs/archive/
├── README.md          # 本页
├── reviews/           # 历史页面 / UX / 节点审计
├── evals/             # 历史评测报告
└── shots/             # 评测 / QA 截图（已从根 shots 迁入）
    ├── eval-2026-09-11/
    ├── eval-post-r5/
    └── qa/
```

## reviews/ — 历史页面 / UX / 节点审计

含（2026-09-11 波次）：`AGENT_APPLE_AUDIT`（+ R2/R3）、`AGENT_PAGE_REVIEW`（+ R4）、`AGENT_UX`、`UI_AUDIT_APPLE`、`SAAS_PAGE_REVIEW`、`WORKBENCH_REVIEW`、`DEEP_BIZ_PRESENTATION`、`DEEP_NODE_EVAL`、`RESIDUAL_ISSUES`、`A11Y_NOTES` 等。

## evals/ — 历史评测报告

| 文件 | 说明 |
|------|------|
| `EVAL_2026-09-11.md` | 当日评测 |
| `EVAL_IP_AGENT_PLATFORM.md` | 平台向评测 |
| `EVAL_POST_R5.md` | R5 后评测 |

## shots/ — 评测 / QA 截图子树

| 子目录 | 来源 |
|--------|------|
| `eval-2026-09-11/` | 评测截图（login / agent / saas / workbench 等） |
| `eval-post-r5/` | R5 后评测截图（含 HITL / catalog 等） |
| `qa/` | QA 冒烟图（agent-home / session / case-tabs / flow-chrome / saas-home） |

根 `shots/*.png` 仍为**演示编号图**（如 `01-dashboard.png`）；评测子目录勿再堆回根。

## 登记规则（何时再归档）

1. 根或 `docs/` 出现「只服务某一轮评审、且已被新稿取代」的 md/图 → 挪入本目录对应子夹（`reviews` / `evals` / `shots/<波次>/`）。
2. **本页补一行**（或补表行）：文件名 / 波次 / 一句话用途。缺登记视为未完成归档。
3. **不要**归档仍被 `docs/architecture/README` 或 `docs/README` 链为权威的活文档（`HARNESS` / `COMMANDS` / `PACKAGES_SPLIT` / architecture 主文等）。
4. 归档文内链到纪律文时，指向 `docs/` 下现行路径（如 `../HARNESS.md` 或文案提及即可）；历史正文可不整篇改写。
