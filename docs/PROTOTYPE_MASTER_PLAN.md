# IP Harness 原型总方案（可按表执行）

> **口径冻结**：本阶段**只做前端样机 + 内存业务状态机**，**不做**真后台（无真库 / ES / 向量 / GPU / Spark / SSO）。  
> **日期**：2026-09-13 · Owner：平台总控  
> **分支**：`dev`

---

## 0. 总原则

| # | 原则 |
|---|------|
| 1 | 壳 ≠ 微服务；新能力默认**新 Vite 壳或独立平面文档**，端口 app 内固定，**不改** `APP_PORTS` 除非总控开闸 |
| 2 | 样机要有**可点业务闭环**（对标 ai-infra / ai-data / doc-harness），禁止空表单 |
| 3 | 人用 UI 与 Agent 工具尽量**同一契约形状**（先检索面） |
| 4 | 训练语料（ai-data）≠ 检索语料/检索引擎（search） |
| 5 | 办案写库唯一远期入口：DomainCommand → case-core（**本期不写码**） |
| 6 | 执行顺序：规格短文 → 可点样机 → UI/业务短评 → P0 排修 → 下一包 |

---

## 1. 已有资产（维持 / 择机打磨）

| ID | 壳/包 | 端口 | 状态 | 规格 | 说明 |
|----|-------|------|------|------|------|
| A1 | mid / workbench / agent / ops / iam | 5173–5177 | **冻结可用** | product-apps / TEAM_CHARTER | 五壳办理样机；非本波重点 |
| A2 | api-mock | 5180 | 冻结 | api-mock README | 内存读写示意 |
| A3 | doc-harness | 5178 | **Go** | `architecture/doc-harness/` | 文档 IDE + HITL；P2 择机 |
| A4 | ai-infra | 5179 | **Go** | `architecture/ai-infra/` + deep-demo | 训推基建状态机 |
| A5 | ai-data | 5181 | **Go** | `architecture/ai-data/` + deep-demo | **训练**语料 Pipeline |
| A6 | 架构包 | — | 已过评多包 | landing / enterprise / dev-spec / product-apps | case-core **未开工** |
| A7 | 评估档 | — | 已归档 | `EVAL_parallel_deep_demo.md` · `REVIEW_parallel_shells*` | 三并行已 Go |

**维持动作（低优先级）**：五壳 UI P2、doc-harness P2、并行壳文案；无需求不主动开大波。

---

## 2. 在建（按方案收口）

| ID | 项 | 端口 | Owner | 规格 | 验收 |
|----|----|------|-------|------|------|
| B1 | **search 检索样机** | **5182** | 检索服务助手 | `architecture/search/`（`623df3d`） | **已收口** `a56b1cd` · 架构评审 Pass · 总控验收 Pass（:5182 curl 200 · 可点清单齐） |

**B1 执行清单**

1. 架构评审 `docs/architecture/search/` → REVIEW  
2. `apps/search` 可点 deep-demo（内存 store）  
3. 总控验收 curl :5182  
4. （可选）UI 短评 / 业务短评  

---

## 3. 待建队列（按优先级 · 一律「先规格后样机」）

### P0 · 检索面收口后立刻可排

| ID | 项 | 建议壳 | 端口建议 | 逻辑要点（样机） | 规格目录（待建） |
|----|----|--------|----------|------------------|------------------|
| C1 | 检索语料/索引运维示意 | 可并入 `apps/search` 子路由 `/corpus` 或轻量 Tab | 5182 | 入库任务假进度、index version、字段覆盖；**非** ai-data | `architecture/search/corpus-ops.md` |
| C2 | Search → 下游动作打通示意 | search 工作篮 | 5182 | 「送 FTO / 挖掘 / 全景 / 文档」只写事件+深链占位 | search deep-demo 扩一节 |

### P1 · 知识产权业务工作台（新壳或模块）

> 共同依赖：**Search Hit 工作篮**；不依赖 ai-data 训练集。

| ID | 项 | 建议壳 | 端口建议 | 人用主路径（状态机） | 规格目录（待建） |
|----|----|--------|----------|----------------------|------------------|
| D1 | **FTO** | `apps/fto` | 5183 | 产品特征拆解 → 检索命中 → 权利要求对比矩阵 → 风险等级 → 报告 Confirm | `architecture/fto/` |
| D2 | **专利挖掘** | `apps/mining` 或 workbench 模块 | 5184 或挂 workbench | 交底/技术点 → 候选发明点列表 → 评分 → 送立项/撰写 | `architecture/mining/` |
| D3 | **创新激发** | `apps/inspire` | 5185 | 问题/技术点 → 语义扩召卡片 → 收藏 → 送交底/挖掘 | `architecture/inspire/` |
| D4 | **全景图** | `apps/landscape` | 5186 | 检索集/工作篮 → 地图（技术×时间×申请人）→ 下钻文献 → 导出 | `architecture/landscape/` |
| D5 | **附图生成·编辑** | `apps/figure` 或 doc-harness 模式 | 5187 或 5178 扩 | **硬要求：能生成且能编辑**。上下文 → mock 生成草图 → 画布编辑（标注/图层/撤销）→ 版本资产 → 挂文档章；禁止只出图不可改 | `architecture/figure/` |

**模块 vs 独立壳（决策规则）**

- 默认：**独立壳**（与 ai-infra/ai-data/search 一致），便于 Owner 边界与演示 URL。  
- 若人力紧：D2/D3 可先做 **workbench 内阶段模块**，但规格仍按独立平面写清，避免和办理 Flow 搅成一锅。

### P2 · 平台与落地（明确本期不做码）

| ID | 项 | 说明 |
|----|----|------|
| E1 | case-core 真后端 | 跟 `dev-spec/`；**原型波不做** |
| E2 | 真检索引擎（ES/向量/湖仓） | 规格里只保留分层：列存湖 / 行存元数据 / 倒排 / 向量；样机继续 mock |
| E3 | 真 LLM / DSH·Codex 接线 | enterprise 已选型；样机保持 mock harness |
| E4 | APP_PORTS 正式登记并行壳 | 总控开闸再 additive |

---

## 4. 检索引擎逻辑方案（人对齐 + Agent · 已开做）

### 4.1 对标（用法）

- 智慧芽：检索式 + 语义 + 同族去重/过滤；人 Web + API。  
- Innojoy：简单 / 表达式 / AI 智能；字段算符丰富。  

### 4.2 样机必须有的闭环

见 `architecture/search/deep-demo.md`：`keyword | semantic | query` → `SearchRun` → `Hit[]` → 过滤/同族 → 详情 → 工作篮 → Agent JSON 形状。

### 4.3 与 ai-data

| | search | ai-data |
|--|--------|---------|
| 给谁 | 人 + Agent 检索 | 训推数据集 |
| 产物 | Hit / 工作篮 | dataset version |
| 壳 | :5182 | :5181 |

### 4.4 远期存储分层（只记方案，不建）

湖（列存 Parquet）→ 元数据行存（PG）→ 倒排 + 向量 → **唯一** Search API。

---

## 5. 标准执行剧本（每个新 ID 套用）

```text
1. 总控定调（壳/端口/≠谁）
2. 架构设计：docs/architecture/<id>/（README+overview+deep-demo+…）
3. 架构评审：REVIEW Pass
4. 对应 Owner：apps/<id> 内存状态机样机
5. 总控验收（边界+可点清单）
6. （可选）UI评估 / 业务审计 → P0 排修 → 复评 Go
```

**Owner 映射（现成）**

| 域 | Owner |
|----|--------|
| 总控编排 | 平台总控 |
| 规格 | 架构设计助手 |
| 评审 | 架构评审 |
| search | 检索服务助手 |
| ai-infra / ai-data / doc-harness | 各现有助手 |
| UI | UI评估 / UI质感 |
| FTO/挖掘/激发/全景/图编 | **待建助手**（开做时总控 CreateAgent） |

---

## 6. 建议排期（按波次，非日历承诺）

| 波次 | 内容 | 出口 |
|------|------|------|
| **W0（完成）** | B1 search 规格评审 + :5182 样机 `a56b1cd` | 可演示人三模式检索 · **总控 Pass** |
| **W1** | C1/C2 语料运维示意 + 工作篮下游占位 | 检索故事完整 |
| **W2** | **D1 FTO** 规格 + 样机（:5183） | 第一条分析业务壳（吃 Search Hit） |
| **W3** | **D5 附图** 规格 + 样机（:5187 或挂 doc-harness） | **生成+编辑**双闭环；挂 doc-harness / 撰写 |
| **W4** | **D2 专利挖掘**（:5184） | 交底→发明点→送立项 |
| **W5** | **D3 激发 + D4 全景**（:5185/:5186） | 演示矩阵补齐 |
| **Wx** | 五壳/并行壳 P2 打磨 | 观感 |
| **后端波** | case-core 按 dev-spec | **另立项，不插入原型波** |

> **排序冻结（2026-09-13 · 总控自定）**：FTO 先于附图（检索→对比→风险报告最能验 Search）；附图再于挖掘（已有 doc-harness 可挂）；激发/全景依赖工作篮体量，放后。
>
> **附图口径冻结（2026-09-13）**：W3/D5 **必须同时支持生成与编辑**（mock 生成草图 + 可点编辑画布）；只生成不可编辑 = 不验收。

---

## 7. 端口与命名一览（样机）

| 端口 | 壳 |
|------|-----|
| 5173–5177 | 五壳 |
| 5178 | doc-harness |
| 5179 | ai-infra |
| 5180 | api-mock |
| 5181 | ai-data |
| **5182** | **search（在建）** |
| 5183–5187 | fto / mining / inspire / landscape / figure（待建，可调） |

---

## 8. 明确不做清单（防范围漂移）

- 真全球专利库采购与入库管线工程化  
- 真 ES/向量/Spark/GPU/K8s  
- 把 FTO/挖掘塞进 ai-data  
- Agent 直连湖仓绕过 Search API  
- 未开闸改 `APP_PORTS` / 拆 monorepo  
- 本波 case-core 写库实现  

---

## 9. 下一动作（总控默认）

1. ~~B1 search~~ **Pass**（`a56b1cd` · :5182）  
2. **当前**：W1 语料运维示意 + 工作篮下游占位（仍 search Owner）  
3. W2：建 **FTO** Owner + `architecture/fto/` 规格 → 评审 → `apps/fto:5183`  
4. 其后按 W3 附图 → W4 挖掘 → W5 激发+全景  
5. 本文件为权威执行表；变更需总控改版并记一笔  

**回链**：`docs/architecture/README.md` · `docs/README.md` 已挂。
