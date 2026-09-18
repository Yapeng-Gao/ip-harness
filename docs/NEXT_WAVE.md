# N 波优先序（2026-09-18）

> 用户：额度刷新；下一刀由总控自定。

| 序 | 内容 | 状态 |
|----|------|------|
| **N1** | UI：`apple-design` + `make-interfaces-feel-better` + `web-design-guidelines` 重评 → 质感排修 | **Go** `6dc1675` / 复评 `6f24ea9` |
| **N2** | 样机缺口：跨口工作篮、深链/挂章、并行壳 e2e L0；e2e-hunt MVP | **Go**（篮+并行 L0+Hunt MVP `f5ab2a6`） |
| **N3** | 检索数据面 / 模型训练 **落地 MVP 任务单**（跟定稿规格） | **Pass** `acefd5d` / 评 `7ed0085` |
| **N4** | case-core · 真产业图谱 | 另立项 |

## N1 范围

1. UI评估：并行壳 `5182–5187` 全量 + 五壳 `5173–5177` 抽检；出 `docs/ui-polish/REVIEW_N1_*.md`  
2. 总控验收报告后：UI质感只修 P0/P1（有验收标准的项）  
3. 不改 contracts / HITL / Persona / STEPS；禁 Cloud Agent  

入口：`docs/ui-polish/UI_SKILLS.md`

## 相关方案

- 猎虫 Harness：[`docs/architecture/e2e-hunt/`](./architecture/e2e-hunt/README.md) · **规格 Pass** `4c83476` / REVIEW `fab595f` · **完善版闭环** [`AGENTIC_CLOSED_LOOP.md`](./architecture/e2e-hunt/AGENTIC_CLOSED_LOOP.md) v1.2（不替代 L0；无 L5 自动修）

## N2 范围（进行中）

1. **跨口工作篮约定**：文档 + 样机最小示意（search→fto/mining；诚实：不同端口 localStorage 不共享的现状与目标）  
2. **并行壳 e2e L0**：5182–5187 路由冒烟进 Playwright（不替代 Hunt）  
3. **e2e-hunt**：规格已 Pass；开 MVP Owner/任务单（Cursor 浏览器 + 1 CasePack），实现可另派  

残余 UI P2 不挡 N2。

- ~~跨口工作篮规格~~ **Pass** `4681bd4` / 补记 `2c7d477`
- ~~并行壳 e2e L0~~ **Pass** `3d737e8`（21 passed，含 5182–5187）
- ~~e2e-hunt MVP~~ **Pass** `f5ab2a6` · `npm run hunt:search-smoke`

## N3 范围（进行中）

1. 从 `search-data/` + `model-training/` 定稿规格各切一张 **落地 MVP 任务单**（可开工、有边界）  
2. 不在本波上真 ES/GPU；任务单写清第一刀做什么 / 不做什么  

## N3 关闸

- search-data/MVP.md · model-training/MVP.md **Pass**
- 真实施：另开 PR / Owner，**不**自动改 apps/*
- 下一可选：按任务单开工检索 API 或 SFT 流水线；或 N4 另立

## I 波 · 落地实施（2026-09-18 · 总控自定）

| 序 | 内容 | 依据 | 状态 |
|----|------|------|------|
| **I1** | 检索数据面落地 MVP：`apps/search-api:5190` sqlite-fts | `search-data/MVP.md` | **Pass**（`4c3b303` · B席双Pass + 冒烟绿） |
| **I2** | 训练落地 MVP：SFT dataset@version + train.sft Job + 评测门禁记录 | `model-training/MVP.md` | **Pass**（数据 `d0a66f7` · Job `356e435` · 流水线接线；生产 Release No-Go） |
| **N4** | case-core / 真产业图谱 | dev-spec | 另立项 |

### I1 边界

- 可新建 `services/search-api` 或 `apps/search-api`（端口另定，**先不改 APP_PORTS**）
- 契约对齐 `SearchQuery`/`SearchHit`；`backend` 可标非 mock
- quarantine 必填失败；不做全球库/完整向量
- `apps/search` 接线用旗标另 PR 或本刀末尾最小切换；优先 API 可 curl 验收

### I1 验收（2026-09-18）

- SHA `4c3b303` @ `origin/dev`；`backend=sqlite-fts`；热索引 110 · quarantine 5
- 未改 `APP_PORTS`；未接线 `apps/search`（壳旗标另 PR）
- B席：架构评审 Pass · 业务深度审计 Pass；总控冒烟绿

### I2 数据切片验收（2026-09-18）

- SHA `d0a66f7` · `ds-ip-sft-mvp@v0.1.0` · `docs/ai-data/mvp-sft/`（76 行）
- B席：架构评审 Pass · 业务深度审计 Pass；checksum/泄漏复验绿
- 待：AI Infra `train.sft` Job + 门禁 + Registry

### I2 train.sft 验收（2026-09-18）

- SHA `356e435` · `tools/train-sft/` · pin `ds-ip-sft-mvp@v0.1.0` · stub revision `sft-mvp-29ff5e49`
- 门禁：生产 Release **No-Go**；流水线接线 **Pass**（诚实 stub，无假 GPU）
- B席：架构评审 Pass · 业务深度审计 Pass；总控 validate_job 绿
- 非阻断（下刀）：禁 DATA_PATH 旁路 / 无 manifest synthetic；`TRAIN_SFT_REAL` 命名易误读

### I2 边界（已完成，留档）

- ai-data 出一个 SFT version；ai-infra 一个 train.sft 形状（可先本地/脚本跑通）
- 不做预训练/DPO/真 K8s；禁 PatentCase/未脱敏直训；不经 Search API 旁路灌数
- 壳 deep-demo / UI 大改不在本刀；合入前挂 B 席轻扫

## P 波 · 原型主线（2026-09-18 · 用户口径）

> **冻**：真 GPU / 真 SFT / 扩训推落地。I1/I2 已 Pass 的 stub 与 search-api **封存可用**，不再加真权重刀。  
> **主攻**：业务逻辑梳理、业务表现、架构设计、UI/UX。

| 序 | 内容 | Owner | 状态 |
|----|------|------|------|
| **P1** | 业务深度扫：五壳+并行壳关键路径逻辑/空态/闸门/诚实文案；出缺口清单 + 必改 P0 | 业务深度审计 | **Pass** `a0b9eae` · `P_WAVE_GAPS.md` |
| **P2** | 架构补缺：跨壳工作篮样机策略 A 落地规格核对；search 旗标接线边界短文；case-core **仍 N4 不开工** | 架构设计 → 架构评审 | **Pass** `3f0d488` / 评 `5e50065` |
| **P3** | UI/UX：N1 后残余 P2/习惯债 + 全壳抽检；有验收标准再交质感 | UI评估 → UI质感 | **Go** `ee61d37`（P0=P1=0；P2 择机） |
| **P4** | 检索表现：`apps/search` 旗标接 `:5190`（可回退 mock）；不改 APP_PORTS | 检索服务 + 检索落地 | **Pass** `b6fcc3b` |
| **P5** | 工作篮样机策略 A：共享种子 + 诚实 toast；search→FTO/mining | 检索服务 · FTO · 挖掘 | **Pass** search `b6fcc3b` · fto `19d0c1d` · mining `76ccfb4`（landscape CN118 黄项可择机） |

**明确不做**：真 GPU、真 Release 模型、大规模 CPT/DPO、真 ES 全球库、N4 case-core/真产业图谱（另令）。

## T 波 · 测试闭环（文档）

| 序 | 内容 | 状态 |
|----|------|------|
| **T0** | Agentic 闭环完善版 v1.2：合并 e2e-hunt + 用户 L1–L7；噪声预算（积压 8）；样机白名单；Phase 0′ 可跑 L0 + `hunt:search-smoke` | **文档** · [`AGENTIC_CLOSED_LOOP.md`](./architecture/e2e-hunt/AGENTIC_CLOSED_LOOP.md) |

口播短剧本（search→篮→FTO）：[`DEMO_PLAYBOOK.md`](./DEMO_PLAYBOOK.md)。

下一批 CasePack（不挡本刀）：`CP-fto-five` · `CP-basket-strategy-a` · `CP-search-api-flag`。**不做** L5 自动修 / Hunt 挡合并 / 真 GPU·SFT。
