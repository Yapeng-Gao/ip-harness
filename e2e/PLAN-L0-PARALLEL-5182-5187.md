# Playwright · 并行壳 L0 路由冒烟计划（5182–5187）

> **依据**：`e2e/REVIEW_RUBRIC.md`（R1–R6；L0 = goto + 地标，零 click）  
> **总控 N2**：各壳首页地标可见；只 L0；写 e2e/；更新 PLAN/RESULTS 口径；**Hunt 另立，不进本单**  
> **本交付**：计划已拍板；实现见 `l0-parallel-smoke.spec.ts` + `playwright.config.ts` projects（不改 `apps/`）  
> **日期**：2026-09-18（UTC+8）

---

## 1. 端口 / 壳对照表

| 壳 | 端口 | 包名 | Vite 固定 | Dev 脚本（根） | 首页路由 | 推荐地标（h1） | 侧栏品牌（非 heading，备援） |
|----|------|------|-----------|----------------|----------|----------------|------------------------------|
| search | **5182** | `@ip/search` | `apps/search/vite.config.ts` | `npm run dev:search` | `/` | **专利检索工作台** | 检索服务 |
| fto | **5183** | `@ip/fto` | `apps/fto/vite.config.ts` | `npm run dev:fto` | `/` | **FTO 样机项目** | FTO 自由实施 |
| mining | **5184** | `@ip/mining` | `apps/mining/vite.config.ts` | `npm run dev:mining` | `/` | **专利挖掘样机项目** | 专利挖掘 |
| inspire | **5185** | `@ip/inspire` | `apps/inspire/vite.config.ts` | `npm run dev:inspire` | `/` | **问题 / 技术点** | 创新激发 |
| landscape | **5186** | `@ip/landscape` | `apps/landscape/vite.config.ts` | `npm run dev:landscape` | `/` | **选择产业域** | 产业全景 |
| figure | **5187** | `@ip/figure` | `apps/figure/vite.config.ts` | `npm run dev:figure` | `/` | **附图资产** | 附图生成·编辑 |

**端口权威（本期）**：各并行壳 **仅** 写在本 app `vite.config.ts`（`defineAppConfig({ port })`），**不在** `packages/contracts` `APP_PORTS`（五壳 + api 仍为 5173–5177 / 5180）。与各 app README / `docs/architecture/product-apps/README.md` 一致。

**诚实前提**：host 一律 `localhost`（禁止 `127.0.0.1`）。**单端口绿 ≠ 六并行壳绿**（尺子 R3）。跑前 curl 六口；缺任一且宣称本单全绿 → 驳回。

---

## 2. 与现有五壳 L0 的关系（增量，不推翻）

| 既有 | 本单 |
|------|------|
| `PLAN-L0-L1.md` · L0-MID/WB/AG/OPS/IAM/API（六条） | **不动**用例 ID、不改断言口径 |
| `e2e/l0-smoke.spec.ts` 现有 describe | **本单不改写**；实现阶段另增文件或同文件增量 describe |
| `playwright.config.ts` projects mid…iam + chromium(L0-API/L1) | **扩展建议**见 §5；不删现有 project |
| `RESULTS.md` 端口矩阵 5173–5177 / 5180 | **追加** 5182–5187 行；未跑标「未跑」，禁止假绿 |

本单 = **加法**：六条并行壳首页 L0。不替代、不重跑、不重编号五壳 + api L0。

---

## 3. 用例表（仅 L0）

列：`ID | 层级 | 壳 | 端口 | 路由 | 断言要点 | 优先级 | 备注`

选择器纪律：`getByRole('heading', …)` 优先（各壳 `PageHeader` → `<h1>`）；允许 `.or(getByText(…))` 作备援。**禁止** click、填表、侧栏扫链、深链跳邻居、formal play。

| ID | 层级 | 壳 | 端口 | 路由 | 断言要点 | 优先级 | 备注 |
|----|------|-----|------|------|----------|--------|------|
| L0-SEARCH-01 | L0 | search | 5182 | `http://localhost:5182/` | HTTP 可达 + heading **「专利检索工作台」** 可见 | P0 | index=`SearchPage`；零 click；不验检索结果 |
| L0-FTO-01 | L0 | fto | 5183 | `http://localhost:5183/` | HTTP 可达 + heading **「FTO 样机项目」** 可见 | P0 | index=`HomePage`；不进 ①–⑤ 步骤页 |
| L0-MINING-01 | L0 | mining | 5184 | `http://localhost:5184/` | HTTP 可达 + heading **「专利挖掘样机项目」** 可见 | P0 | index=`HomePage`；不进交底/候选/评分/送出 |
| L0-INSPIRE-01 | L0 | inspire | 5185 | `http://localhost:5185/` | HTTP 可达 + heading **「问题 / 技术点」** 可见 | P0 | index=`PromptPage`；不点扩召/收藏 |
| L0-LANDSCAPE-01 | L0 | landscape | 5186 | `http://localhost:5186/` | HTTP 可达 + heading **「选择产业域」** 可见 | P0 | index=`DomainPage`；不点域卡进 `/tree`；注意历史 Vite 504 白屏（环境，非断言） |
| L0-FIGURE-01 | L0 | figure | 5187 | `http://localhost:5187/` | HTTP 可达 + heading **「附图资产」** 可见 | P0 | index=`HomePage`；不进 new/generate/edit |

**L0 合计（本单）：6**  
**不进本单**：子路由（`/saved`、`/features`、`/disclosure`、`/sparks`、`/tree`、`/new`…）、深链邻居、L1 click、L2、**Hunt**（见 `docs/architecture/e2e-hunt/`）。

---

## 4. 排除清单（硬）

| 排除 | 理由 |
|------|------|
| L1 / L2 | 总控 N2：只 L0 |
| Hunt / 探索猎虫 | 另立；不替代 L0（尺子 §0） |
| 深 click、填表、步骤向导 | L0 禁止（尺子 §1 L0） |
| 侧栏全 link 扫 | R1 装饰过度 |
| 改 `APP_PORTS` / 五壳业务 | 并行壳策略：端口只在 app Vite |
| 写/改 spec（本交付） | 先计划评审 |
| 宣称「全仓 e2e 绿」却未起 5182–5187 | R3 单端口假绿 |

---

## 5. 技术备注（实现阶段建议 · 本文件不改代码）

1. **host**：一律 `http://localhost:<port>/`（禁止 `127.0.0.1`）。  
2. **零 click**：仅 `page.goto` + heading 可见（可先 `expect(res.ok())`）。  
3. **文件建议**：`e2e/l0-parallel-smoke.spec.ts`（或 `l0-smoke.spec.ts` 增量 describe，ID 前缀如上）；**勿**改写既有 L0-MID…API。  
4. **config projects 扩展建议**（对齐现有 mid…iam 模式）：

```ts
// 示意 · 实现时再改 playwright.config.ts
{ name: 'search',    use: { ...chrome, baseURL: 'http://localhost:5182' }, testMatch: /l0-parallel-smoke\.spec\.ts/, grep: /L0-SEARCH/ },
{ name: 'fto',       use: { ...chrome, baseURL: 'http://localhost:5183' }, testMatch: /l0-parallel-smoke\.spec\.ts/, grep: /L0-FTO/ },
{ name: 'mining',    use: { ...chrome, baseURL: 'http://localhost:5184' }, testMatch: /l0-parallel-smoke\.spec\.ts/, grep: /L0-MINING/ },
{ name: 'inspire',   use: { ...chrome, baseURL: 'http://localhost:5185' }, testMatch: /l0-parallel-smoke\.spec\.ts/, grep: /L0-INSPIRE/ },
{ name: 'landscape', use: { ...chrome, baseURL: 'http://localhost:5186' }, testMatch: /l0-parallel-smoke\.spec\.ts/, grep: /L0-LANDSCAPE/ },
{ name: 'figure',    use: { ...chrome, baseURL: 'http://localhost:5187' }, testMatch: /l0-parallel-smoke\.spec\.ts/, grep: /L0-FIGURE/ },
```

   用例内亦可 `test.use({ baseURL })` + 显式 URL（与现 `l0-smoke.spec.ts` 一致）。**无 webServer**；跑前人工确认六口。  
5. **RESULTS 口径**：端口矩阵追加 5182–5187；本单 6 条单独成表；缺口写「未跑」；不得用五壳绿掩饰并行壳未跑。  
6. **PLAN 口径**：`PLAN-L0-L1.md` 保留五壳+api；本文件为并行壳增量权威；交叉引用互指即可。

---

## 6. 已决（评审拍板 · 2026-09-18 UTC+8）

| # | 议题 | 已决 |
|---|------|------|
| A | 地标以 h1 还是侧栏品牌为准？ | **h1** 为准：`getByRole('heading')`；侧栏品牌文案仅备援 |
| B | inspire 首页 h1「问题 / 技术点」是否够「壳身份」？ | **主断言**「问题 / 技术点」；`.or(getByText('创新激发'))` 备援 |
| C | landscape 白屏 / Vite 504？ | **curl≠200 → RESULTS「未跑」**；已跑无 h1/白屏 → **FAIL** |
| D | spec 文件名？ | **独立** `e2e/l0-parallel-smoke.spec.ts` + 六 project |
| E | 是否写入 `APP_PORTS`？ | **本期不写** |

地标文案来源（只读核对，2026-09-18）：各 `apps/*/src/pages/*Page.tsx` 的 `PageHeader title=…` → `<h1>`；侧栏见 `*Shell.tsx`。

---

## 7. 成功标准

### 7.1 计划交付（已完成）
- [x] 计划路径：`/workspace/ip-harness/e2e/PLAN-L0-PARALLEL-5182-5187.md`
- [x] 端口/壳对照 + 6 条 L0 用例表 + 与五壳增量关系 + 技术/排除
- [x] 对齐 `REVIEW_RUBRIC.md`：仅 L0、零 click、多端口诚实、Hunt 不进
- [x] §6 已决（A–E）

### 7.2 实现交付（本轮）
- [x] `e2e/l0-parallel-smoke.spec.ts`（六条 L0 · 零 click）
- [x] `playwright.config.ts` 六 project（search/fto/mining/inspire/landscape/figure）
- [x] RESULTS 追加 5182–5187；curl≠200 →「未跑」；禁止假绿
- [x] 未改 `apps/`；未写 `APP_PORTS`

---

## 8. 用例 ID 速查

`L0-SEARCH-01` · `L0-FTO-01` · `L0-MINING-01` · `L0-INSPIRE-01` · `L0-LANDSCAPE-01` · `L0-FIGURE-01`
