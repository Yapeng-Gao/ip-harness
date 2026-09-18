# CasePack 下一批（对齐 AGENTIC_CLOSED_LOOP.md §8.2）

> **状态**：`CP-fto-five` / `CP-basket-strategy-a` 已接线；flag 仍为草案  
> **依据**：`docs/architecture/e2e-hunt/AGENTIC_CLOSED_LOOP.md` v1.2 §8.2  
> **阶段**：Phase 0′ · 样机诚实白名单 · **不开 L5**（无自动修 / 禁 CloudAgent 改产品）  
> **约束**：不改 L0（`e2e/l0-*` / `test:e2e`）；Hunt 不挡合并；不要求真 FTO 引擎 / 真跨口 LS

## 优先序（方案 §8.2）

1. **`CP-fto-five`** · 已接线  
2. **`CP-basket-strategy-a`** ← 本波实现  
3. **`CP-search-api-flag`**

## 总览

| ID | 壳/端口 | 目标（一句话） | 状态 | 前置 |
|----|---------|----------------|------|------|
| `CP-search-smoke` | search:5182 | 关键词→列表→DetailDrawer | **已有** | `npm run dev:search` |
| `CP-fto-five` | fto:5183 | 五步走到报告页（不要求真引擎） | **已接线** | `npm run dev:fto` |
| `CP-basket-strategy-a` | search:5182 → fto:5183 | 加篮→送 FTO→导入共享种子 + 诚实 toast | **已接线** | 两壳同起 |
| `CP-search-api-flag` | search:5182 + api:5190 | 旗标 sqlite-fts；宕机回退 mock | 草案 | `dev:search` + `dev:search-api` |

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

## 3. `CP-search-api-flag`（旗标 :5190）· 下一批

**baseURL**：`http://localhost:5182/`  
**env**：`VITE_SEARCH_API_URL=http://localhost:5190`  
**maxSteps**：建议 12  
**口径**：mock 回退不记缺陷；旗标开时 quarantine/热索引诚实

### 分支 A · API 存活

| # | checkpointId | 断言 | 动作 |
|---|--------------|------|------|
| 1 | `cp-wb` | 工作台可见 | goto |
| 2 | `cp-sqlite` | `backend: sqlite-fts`（或「已接 Search API」） | fill+检索 |
| 3 | `cp-results-fts` | 有命中且非假成功空列表装成真库 | wait |

### 分支 B · API 宕机

| # | checkpointId | 断言 | 动作 |
|---|--------------|------|------|
| 1 | `cp-fallback` | toast「Search API 不可用，已回退样机 mock」 | 停 5190 后检索 |
| 2 | `cp-mock-chip` | `backend: mock` 可见 | — |

**不做**：改 APP_PORTS；无旗标时行为应与 `CP-search-smoke` 一致。

---

## 实现挂钩

| 项 | 落点 |
|----|------|
| CasePack | `tools/e2e-hunt/src/casepacks/cp-fto-five.ts` · `cp-basket-strategy-a.ts`（+ 日后 flag） |
| Adapter | `adapter/ip-harness.ts` · `ENTRY_URLS.fto` · `CASE_PACKS` · decide 分支 |
| CLI | `ensureBaseUp`（按 pack 提示 `dev:search` / `dev:fto`） |
| 脚本 | `hunt:fto-five` · `hunt:basket-strategy-a`（根 `package.json`）；**勿动** `test:e2e` |
| 白名单 | `rules.ts` 策略 A / 假比对 token |
| L7 轻量 | 可选 `StepRecord.agent_reasoning`（§3.2）；schemaVersion 仍 1.0 |
| L5 | **明确不做** |

## 待定（flag 接线时）

- decide：继续规则短路 vs 接 LLM  
- flag Case 拆双 CasePack 或单包双分支  
- `CP-basket-strategy-a` 已同 runId 探活 5182+5183  
