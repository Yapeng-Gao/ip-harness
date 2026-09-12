# Playwright · api-mock 起/停样机冒烟计划

> **依据**：`apps/api-mock/README.md` · `e2e/REVIEW_RUBRIC.md` · `e2e/PLAN-L0-L1.md` · 现有 `e2e/l0-smoke.spec.ts`（L0-API-01）  
> **立场**：同仓接口样机（`@ip/api-mock` · 端口 **5180**）；**不是**生产后端契约回归  
> **本交付**：计划已决 + 实现 `e2e/` 冒烟（不改 `apps/`）  
> **日期**：2026-09-12（UTC+8）  
> **Owner 诉求**：① api-mock **起着**时壳关键路径能走通读/写示意；② **关掉**时壳仍可用（fallback 内存 seed，不白屏/不挂死）

---

## 1. 背景与诚实前提

| 事实 | 含义 |
|------|------|
| api-mock 是样机 | Node 内置 `http` + 内存 store；进程重启即丢；**勿当生产 API 契约** |
| 端口 | `APP_PORTS.api` = **5180**；`APP_DEV_URLS.api` = `http://localhost:5180`（host 一律 `localhost`，禁止 `127.0.0.1`） |
| 写路径（第二刀） | 默认优先 `POST /v1/commands/dispatch`；打到样机后仍执行本地内存镜像；失败 → fallback `dispatchCommandLocal` |
| 读路径 | 默认优先 `GET /v1/cases`（+ inbox）；按 id **merge** 瘦字段到 seed `PatentCase`；失败 → 保留内存 seed |
| 开关（README） | `VITE_IP_API_MOCK_WRITE` / `VITE_IP_API_MOCK_READ`：`=0` 关（仅内存）；未设 = 开。等价 localStorage：`ip-harness.api-mock.write` / `.read` |
| 客户端 baseUrl | `createApiClient()` 默认写死 `APP_DEV_URLS.api`；**当前无** `VITE_*` 可改 baseUrl 指向别的端口 |
| 现有 L0 | `L0-API-01` = `request.get('http://localhost:5180/health')` → 2xx；**无 UI、无起/停对照** |
| 本计划范围 | 样机冒烟窄条；**勿**深测装饰页、全命令矩阵、真后端 |

**诚实区分（评审必读）**

| 场景 | 代码路径 | 是否等于「api 挂了」 |
|------|----------|----------------------|
| 开关 `=0` | 跳过 HTTP，直接内存 | **否** — 「关开关」≠「服务不可达」 |
| 服务未起 / 网络失败 / `route.abort` | `try*` → `null` → fallback；写路径 message 可带「api-mock 不可达，已 fallback 内存」 | **是** — Owner ② 的目标路径 |
| 开关默认开且 5180 可达 | 读 merge / 写 via api-mock | Owner ① |

---

## 2. 分层建议（L0 扩展 vs 新 L1 窄条）

| 层 | 建议 | 理由 |
|----|------|------|
| **L0 扩展** | **保留** `L0-API-01`；可选 **升格断言**（JSON `ok`）+ 新增 **一条**纯 `request` 读烟（cases） | 尺子：api-mock L0 = health；仍禁止 UI click；「起着」服务侧秒级暴露 |
| **新 L1 窄条** | **2 条**：壳×api **起**（读或写示意 1 次）+ 壳×api **停/不可达**（fallback 不白屏） | Owner ①② 必须过壳；深度止于「示意走通 / 壳仍可用」 |
| **不进 L0** | 壳内 dispatch、route.abort、进仓链 | 多步或依赖壳状态 → L1 |
| **不进本计划必跑** | 全 CommandName 矩阵、Inbox persona 矩阵、装饰页 | L2 / 生产契约气味（尺子 R4） |

**建议落地文件（实现阶段 · 本文件不改代码）**

- L0 仍在 `e2e/l0-smoke.spec.ts`（或同目录薄扩）
- L1 窄条新建 `e2e/api-mock-smoke.spec.ts`（或并入 `critical-paths` 尾部并以 `L1-API-` grep）；`playwright.config` 用现有 `chromium` project 的 `L1-` grep，或加独立 project
- **跑前**：起场景需 5180 已起；停场景**不**要求杀进程（见 §4）

---

## 3. 用例表

列：`ID | 层级 | 壳/服务 | 前置（api 起/停）| 路径 | 断言要点 | 优先级 | 备注`

选择器纪律：对齐尺子 — `getByRole` / heading / 地标；禁止脆 CSS、装饰 click 链。

| ID | 层级 | 壳/服务 | 前置（api 起/停） | 路径 | 断言要点 | 优先级 | 备注 |
|----|------|---------|-------------------|------|----------|--------|------|
| **L0-API-01** | L0 | api-mock | **起**（5180 可达） | `GET http://localhost:5180/health` | HTTP 2xx；建议升格：body 含 `ok`（或 README 约定字段） | P0 | **已有** · `request` fixture · 非 UI · **保留并轻微升格** |
| **L0-API-02** | L0 | api-mock | **起** | `GET http://localhost:5180/v1/cases` | HTTP 2xx + JSON 数组（长度 ≥ 1 可选） | — | **已砍**（§7）· 读烟由 L1-API-UP-01 壳网络观察承担 |
| **L1-API-UP-01** | L1 | mid（+ api-mock） | **起**；读/写开关默认开（未设 `=0`） | 推荐：已进仓 mid `/` 或 `/cases/c1`（可复用 `enterWorkspace` → mid）；**读或写二选一示意** | **读**：壳可见案件/仪表盘地标（如「资产与任务」或案标题），且能观察到对 `localhost:5180` 的成功请求（`page.waitForResponse` / `listCases`）**或** console 出现 merge 类 info；**写（可选替代）**：触发一条文档化轻量 command 后，结果/审计文案含 `via api-mock:5180（样机）`（勿全命令矩阵） | P0 | **新建** · Owner ① · 窄条：health/cases **或** 壳内一次读/写示意即可；优先 **读**（更稳、少副作用） |
| **L1-API-DOWN-01** | L1 | mid | **停/不可达**（见 §4；**不杀**共享 5180 进程为默认建议） | mid 关键壳：`/` 或进仓后仪表盘 / 案列表 | `body` 可见；关键地标仍在（「资产与任务」或 seed 案）；**无**持续挂死（约定 timeout 内可交互）；**不**要求白屏；可选：console 出现 fallback info，或写路径若触发则 message 含 `fallback 内存` | P0 | **新建** · Owner ② · **禁止**为此测装饰页；失败信息应能区分「壳挂了」vs「仅 api 不可达」 |

**必跑合计：3（§7 已决）**

- P0 必保：**L0-API-01**（升格 · `ok === true`）+ **L1-API-UP-01**（只读）+ **L1-API-DOWN-01**（page.route abort）= **3**
- **L0-API-02 已砍**

---

## 4. 如何在 Playwright 里「关掉」api-mock

### 4.1 结论（以实现为准 · 诚实）

| 手法 | 是否推荐 | 说明 |
|------|----------|------|
| **A. `page.route('http://localhost:5180/**', r => r.abort())`（或 `fulfill` 连接错误）** | **推荐默认** | **不杀进程**；开关保持默认开 → 走真实「失败 → null → fallback」路径；与同机仍跑的 `L0-API-01` 可并存（L0 用 `request` 直打 5180，不受 page route 影响） |
| **B. 文档化开关 `VITE_IP_API_MOCK_READ=0` / `WRITE=0` 或 localStorage `…=0`** | **可选对照**；**不能单独充当 Owner ②** | README 明确：关 = **跳过 HTTP、仅内存**。测的是开关，不是「服务挂了」。Vite env 需 **重启 dev** 才生效；LS 可用 `addInitScript` 在 goto 前注入 |
| **C. 显式 URL 指向不可达端口** | **当前不可行（无改代码）** | `createApiClient()` **无** VITE baseUrl；除非改 `@ip/api` / 注入点。计划阶段记为「若产品加 `VITE_IP_API_BASE` 再启用」 |
| **D. 杀掉 / 不停 `npm run dev:api`** | **不推荐作默认** | 共享环境会打挂 `L0-API-01` 与其它依赖 5180 的手测；若 CI 隔离 job 可文档化为「整 job 不起 api」变体，须在 RESULTS 端口矩阵写「5180 未起」 |

**本计划默认拍板建议**：Owner ② → **手法 A**；若评审只要「关开关壳仍可用」可另加 P2 对照条（不占必跑）。

### 4.2 「起着」侧

- 跑前确认：`curl -s -o /dev/null -w '%{http_code}\n' http://localhost:5180/health` → 2xx（与现有 RESULTS 端口矩阵一致）
- 壳：mid `5173`（读 cases / 仪表盘地标最贴近 AppContext 读路径）；写示意若选，仍在 mid 或已有 audit 地标附近，**一次**即可
- 开关：默认开（不要在 UP 用例里设 `=0`）

### 4.3 超时与挂死口径（DOWN）

- 读路径失败应快速 `catch` → `null`（见 `apiMockRead.ts`）；壳应用 seed 渲染
- 断言用「地标可见 + 页面未空白」；避免无限等某一个 5180 响应
- **不要**把「console 无 fallback 文案」当硬失败（console 可能被过滤）；地标优先

---

## 5. 与现有 L0-API-01 的关系

| 项 | 处置 |
|----|------|
| **复用** | ID 保留 `L0-API-01`；继续 `request.get` + 绝对 URL `http://localhost:5180/health`；仍挂 `chromium` project / `L0-API` grep |
| **升格** | 现断言仅 `200≤status<300`；计划允许加 JSON `ok === true`（或 `mock`/`service` 字段）— **仍 L0、仍非 UI** |
| **不替代** | L0-API-01 **不能**代替 L1-API-UP/DOWN（无壳、无 fallback） |
| **新增** | `L0-API-02`（可选）+ `L1-API-UP-01` + `L1-API-DOWN-01`；**不**把 L0-API-01 改成 dispatch 全矩阵 |

对照 `PLAN-L0-L1.md`：原 L0 表「api-mock = GET /health」仍然成立；本文件是 **api-mock 起停窄条** 的增量计划，不推翻五壳 L0。

---

## 6. 排除项（明确不写进必跑）

| 排除 | 原因 |
|------|------|
| L2：全 `CommandName` / persona inbox 矩阵 | 样机非生产契约；尺子 R4 |
| 装饰页 / Insight / Billing / OrgSettings 深链 | Owner：「勿深测装饰页」；R1 |
| 真 SSO / 真投递 / 跨浏览器 | 与 api-mock 无关 |
| 用 `CaseSummary` 整表替换 UI 的断言 | README 禁止；会打爆 UI |
| 杀进程作为默认「停」手段 | 污染共享 5180；见 §4 |
| 把「开关 =0」标成「api 已停」 | 口径不诚实 |
| 九 Agent formal play / Catalog 深交互 | 已有 L1-06/07 边界；本计划不叠加 |

---

## 7. 已决（评审通过 · 2026-09-12）

1. **UP 只验读，不要写** — L1-API-UP-01：`waitForResponse` 成功匹配 `**/v1/cases`（或等价 listCases URL）+ 壳地标；**禁止**触发写 / dispatch。
2. **砍 L0-API-02** — 不单列；读烟由 UP 的壳网络观察承担。
3. **DOWN 仅 page.route abort** — `page.route('http://localhost:5180/**', r => r.abort())`；**无**开关 `=0` 对照进必跑。注释禁止「关开关=停服」；route 模拟不可达，**进程仍起**。
4. **壳仅 mid** — L1-API-* 只跑 mid:5173。
5. **UP/DOWN 强制 enterWorkspace** — `iam:5177/login` → 产品「作业中台」→ 工作区「星河智造」→ mid。
6. **L0-API-01 JSON `ok === true` 强制** — `GET /health`：status 2xx + `body.ok === true`（可兼看 `mock` / `service`）。

**必跑 P0×3**：`L0-API-01`（升格）+ `L1-API-UP-01` + `L1-API-DOWN-01`。

---

## 8. 数量汇总与成功标准（本交付）

| 项 | 值 |
|----|-----|
| 用例 ID（已决） | `L0-API-01`（升格）· `L1-API-UP-01` · `L1-API-DOWN-01`（**砍** L0-API-02） |
| P0 必保数 | **3** |
| P1 可选 | **无**（L0-API-02 已砍） |
| 起/停模拟结论 | **起** = 真 5180；**停** = 仅 `page.route` abort（不杀进程）；开关 `=0` ≠ 停服 |
| 本文件 | `/workspace/ip-harness/e2e/PLAN-API-MOCK-SMOKE.md` |
| 实现 | `e2e/l0-smoke.spec.ts` · `e2e/api-mock-smoke.spec.ts` · `playwright.config.ts` · `e2e/RESULTS.md`；**不改** `apps/` |

成功标准（计划评审用）：

- [x] 写明样机/非生产诚实前提
- [x] L0 扩展 vs L1 窄条分层清楚
- [x] 用例表含起/停前置与断言要点
- [x] 「关掉」手法以 README 为准并诚实区分开关 vs 不可达
- [x] 与 L0-API-01 关系写清
- [x] 排除项列出；§7 已决写入
