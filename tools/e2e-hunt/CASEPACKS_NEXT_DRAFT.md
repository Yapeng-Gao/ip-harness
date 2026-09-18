# CasePack 下一批（对齐 AGENTIC_CLOSED_LOOP.md §8.2）

> **状态**：`CP-fto-five` / `CP-basket-strategy-a` / `CP-search-api-flag`（A）/ `CP-search-api-fallback`（B）/ **`CP-agent-hitl`** / **`CP-figure-dual`** 已接线  
> **依据**：`docs/architecture/e2e-hunt/AGENTIC_CLOSED_LOOP.md` v1.2 §8.2  
> **阶段**：Phase 0′ · 样机诚实白名单 · **不开 L5**（无自动修 / 禁 CloudAgent 改产品）  
> **约束**：不改 L0（`e2e/l0-*` / `test:e2e`）；Hunt 不挡合并；不要求真 FTO 引擎 / 真跨口 LS

## 优先序（方案 §8.2）

1. **`CP-fto-five`** · 已接线  
2. **`CP-basket-strategy-a`** · 已接线  
3. **`CP-search-api-flag`** / **`CP-search-api-fallback`** · 已接线  
4. **`CP-agent-hitl`** · 已接线  
5. **`CP-figure-dual`** · 已接线

## 总览

| ID | 壳/端口 | 目标（一句话） | 状态 | 前置 |
|----|---------|----------------|------|------|
| `CP-search-smoke` | search:5182 | 关键词→列表→DetailDrawer | **已有** | `npm run dev:search` |
| `CP-fto-five` | fto:5183 | 五步走到报告页（不要求真引擎） | **已接线** | `npm run dev:fto` |
| `CP-basket-strategy-a` | search:5182 → fto:5183 | 加篮→送 FTO→导入共享种子 + 诚实 toast | **已接线** | 两壳同起 |
| `CP-search-api-flag` | search:5182 + api:5190 | 旗标 sqlite-fts | **已接线（分支 A）** | `dev:search-api` + `dev:search:api` |
| `CP-search-api-fallback` | search:5182（:5190 宕） | 旗标开但 API 不可用 → mock + toast | **已接线（分支 B）** | `dev:search:api` + **停** :5190 |
| `CP-agent-hitl` | agent:5175 | 进入办理 → HITL ConfirmBar 可见 | **已接线** | `npm run dev:agent` |
| `CP-figure-dual` | figure:5187 | 上下文 → mock 生成 → 画布编辑双闭环 | **已接线** | `npm run dev:figure` |

字段对齐方案：Evidence Pack 本地 `artifacts/`；可选逐步 `agent_reasoning`（规则短路填 `rule:…`）；Finding 白名单见 `rules.ts`；schemaVersion 仍为 `1.0`。

---

## 1. `CP-fto-five`（fto:5183）· Phase 0′ 本波

**baseURL**：`http://localhost:5183/`  
**脚本**：`npm run hunt:fto-five`  
**maxSteps**：16 · `abortOnHard: true`  
**种子**：`createInitialState` 已有 features/hits → 通常可直接步进，不必真填表 / 真引擎

| # | checkpointId | 断言地标（heading/text/url，忌写死 CSS） | decide（规则短路） |
|---|--------------|------------------------------------------|-------------------|
| 1 | `cp-home` | heading「FTO 样机项目」 | `goto /` |
| 2 | `cp-features` | heading「产品特征表」 | click「进入特征表」 |
| 3 | `cp-hits` | heading「检索命中 / 工作篮」 | click「下一步：命中」 |
| 4 | `cp-matrix` | heading「特征 × 文献矩阵」 | click「下一步：矩阵」 |
| 5 | `cp-risk` | heading「风险汇总与覆盖」 | 可选先「自动填假比对」再「下一步：风险」 |
| 6 | `cp-report` | heading「报告预览与 Confirm」 | click「下一步：报告」→ stop success |

**诚实白名单**：banner「样机 · 无真 FTO 引擎」；toast「已填假比对（非真 FTO 引擎）」；策略 A 相关 token（「跨口未共享」「共享种子」「已用共享种子」）已写入 `rules.ts`（本 Case 主要走 fto，亦为下一批 basket 预留）。  
**不做**：真引擎、写 case-core、跨口读 LS、L5 自动修。

---

## 2. `CP-basket-strategy-a`（跨口策略 A · 样机）· Phase 0′ 本波

**入口**：`http://localhost:5182/` → 深链 `http://localhost:5183/`  
**脚本**：`npm run hunt:basket-strategy-a`  
**maxSteps**：16 · `abortOnHard: true`  
**验的是**：链路可点 + 诚实 toast 可见；**不是**真跨端口 storage

| # | checkpointId | 断言 | decide 建议 |
|---|--------------|------|-------------|
| 1 | `cp-search-wb` | heading「专利检索工作台」 | goto 5182 |
| 2 | `cp-has-results` | 列表有结果 | fill+click「检索」 |
| 3 | `cp-in-basket` | 「已加入工作篮」或篮计数 >0 | click「加入工作篮」 |
| 4 | `cp-send-fto` | 策略 A toast（含「跨口未共享」/「共享种子」） | click「送 FTO」 |
| 5 | `cp-fto-hits` | fto `/hits`「检索命中 / 工作篮」 | 跟深链或 goto 5183/hits |
| 6 | `cp-import-seed` | toast「样机·跨口未共享 LS，已用共享种子」且篮非空 | click「从 Search 工作篮导入」 |

**fail_hard 例**：声称「已跨口同步工作篮」且无诚实 disclaimer。  
**不做**：真 basket API、读邻居 localStorage、L5。

---

## 3. `CP-search-api-flag`（旗标 :5190）· Phase 0′ 本波（分支 A）

**baseURL**：`http://localhost:5182/`  
**env**：`VITE_SEARCH_API_URL=http://localhost:5190`（须 `npm run dev:search:api`，**勿**裸 `dev:search`）  
**脚本**：`npm run hunt:search-api-flag`  
**maxSteps**：12 · `abortOnHard: true`  
**前置**：`npm run dev:search-api`（:5190）+ `npm run dev:search:api`（:5182）  
**口径**：mock 回退 toast **白名单不记缺陷**；旗标开时 quarantine/热索引诚实；observer 勿把常驻 mock 横幅误判为已接 API

### 分支 A · API 存活（本波已接线）

| # | checkpointId | 断言 | 动作 |
|---|--------------|------|------|
| 1 | `cp-wb` | heading「专利检索工作台」 | goto |
| 2 | `cp-sqlite` | custom `backend-sqlite-fts`（页文含 `backend: sqlite-fts` 或「已接 Search API」） | fill+检索 |
| 3 | `cp-results-fts` | custom `search-results` 有命中 | wait；sqlite+results 都达 → stop success |

### 分支 B · API 宕机 → 独立 CasePack `CP-search-api-fallback`（已接线）

**id**：`CP-search-api-fallback`（文档：flag 分支 B）  
**脚本**：`npm run hunt:search-api-fallback`  
**探活**：只要 `:5182` 起来；**不要**要求 `:5190/health` 成功（与分支 A `EXTRA_BASES` 相反）  
**CLI**：`REQUIRE_DOWN_BY_PACK` — 若 `:5190/health` 仍通 → fail-fast exit 2，提示停掉 `:5190`  
**前置**：`npm run dev:search:api` + **停掉** `dev:search-api`

| # | checkpointId | 断言 | 动作 |
|---|--------------|------|------|
| 1 | `cp-wb` | heading「专利检索工作台」 | goto |
| 2 | `cp-fallback` | custom `api-fallback-toast`（页文含「Search API 不可用，已回退样机 mock」） | fill+检索；toast 短暂 → 短 wait |
| 3 | `cp-mock-chip` | custom `backend-mock-after-search`（`backend: mock` 且无 sqlite-fts 成功态） | wait |
| 4 | `cp-results-mock` | custom `search-results` 有 mock 命中 | wait → stop success |

白名单：「Search API 不可用」「已回退样机 mock」「API fallback」；`requestfailed` URL 含 `localhost:5190` / `:5190/`。该 toast **不记缺陷**。

**不做**：改 APP_PORTS / apps/*；无旗标时行为应与 `CP-search-smoke` 一致；不开 L5。

---

---

## 4. `CP-agent-hitl`（agent:5175）· Phase 0′ 本波

**baseURL**：`http://localhost:5175/`  
**脚本**：`npm run hunt:agent-hitl`  
**DEV**：`npm run dev:agent`  
**maxSteps**：12 · `abortOnHard: true`  
**目标**：进入办理 → HITL ConfirmBar 可见（种子 `sess-oa-1` · `needs_human` + `hitlPending`）

| # | checkpointId | 断言 | decide |
|---|--------------|------|--------|
| 1 | `cp-home` | custom `agent-home`（url `/agent` 或「会话待确认」/知产 Agent） | `goto /` |
| 2 | `cp-session` | custom `agent-session-oa1`（url 含 `sess-oa-1`） | goto 深链 `…/sessions/sess-oa-1?focus=hitl` |
| 3 | `cp-hitl` | custom `hitl-confirm-bar`（批准策略 / 授权递交 / 立项决定 / 确认报价 / 付款解锁 · `.agent-confirm-cta` / `#agent-confirm-reason-primary` / 「待确认」） | wait（或兜底点「会话待确认」）→ stop |

**白名单**：Beta/非采购闭环、样机横幅、HITL 等待态（「会话待确认」「等待你确认」）**不记缺陷**。  
**不做**：真审批写回、L5、改 apps/*。

---

## 5. `CP-figure-dual`（figure:5187）· Phase 0′ 本波

**baseURL**：`http://localhost:5187/`  
**脚本**：`npm run hunt:figure-dual`  
**DEV**：`npm run dev:figure`  
**maxSteps**：20 · `abortOnHard: true`（生成 1–2s 假延迟）  
**目标**：首页 → 新建上下文 → mock 生成 → 打开画布编辑（样机级双闭环）

| # | checkpointId | 断言 | decide |
|---|--------------|------|--------|
| 1 | `cp-home` | heading「附图资产」 | `goto /` |
| 2 | `cp-context` | heading「填写生成上下文」 | click「新建附图」 |
| 3 | `cp-generate` | heading「套用模板草图」 | click「生成草图」（标题可默认）；wait generating→ready |
| 4 | `cp-canvas` | custom `figure-canvas`（「③ 画布编辑」或「保存版本」） | click「打开画布编辑」→ stop |

**白名单**：无真文生图、假延迟、样机横幅。  
**不做**：真文生图 / CAD、L5、改 apps/*。


## 实现挂钩

| 项 | 落点 |
|----|------|
| CasePack | `cp-fto-five.ts` · `cp-basket-strategy-a.ts` · `cp-search-api-flag.ts` · `cp-search-api-fallback.ts` · **`cp-agent-hitl.ts`** · **`cp-figure-dual.ts`** |
| Adapter | `adapter/ip-harness.ts` · `CASE_PACKS` · `DEV_SCRIPT_BY_PACK` · `EXTRA_BASES_BY_PACK`（flag A 探活 :5190）· `REQUIRE_DOWN_BY_PACK`（fallback B 要求 :5190 down） |
| CLI | `ensureBasesUp` + `ensureRequiredDown`（分支 B fail-fast） |
| 脚本 | `hunt:fto-five` · `hunt:basket-strategy-a` · `hunt:search-api-flag` · `hunt:search-api-fallback` · **`hunt:agent-hitl`** · **`hunt:figure-dual`**；**勿动** `test:e2e` |
| 白名单 | `rules.ts` 策略 A / 假比对 / Search API / Agent HITL·Beta / Figure 无真文生图 token + `:5190` requestfailed |
| Observer custom | `agent-home` · `agent-session-oa1` · `hitl-confirm-bar` · `figure-canvas` |
| L7 轻量 | 可选 `StepRecord.agent_reasoning`（§3.2）；schemaVersion 仍 1.0 |
| L5 | **明确不做** |

## 待定 / 后置

- decide：继续规则短路 vs 接 LLM  
- `CP-basket-strategy-a` 已同 runId 探活 5182+5183；flag A 探活 5182+5190；fallback B 探活 5182 且要求 5190 down  
- `CP-agent-hitl` / `CP-figure-dual` 已接线；下一批尾巴可继续扩壳（仍不挡合并 · 不开 L5）  
