# e2e 分层标准（评审尺子）

> **适用**：`/workspace/ip-harness` Playwright 样机冒烟与关键路径。  
> **立场**：多壳 + 共享内核样机；**不是**生产全量回归。  
> **分工**：本文件由「e2e用例评审」维护；「e2e测试助手」按此尺子写/改 spec。  
> **总控约束**：用户说「页面都加 e2e」≠ 全页深度交互。装饰页、Catalog 全深链、Insight/Billing 细则 → **L2 暂缓**。  
> **探索猎虫**：过程遥测 + LLM 环见 [`docs/architecture/e2e-hunt/`](../docs/architecture/e2e-hunt/README.md)；**不替代**本文件 L0/L1。

---

## 0. 诚实前提（写进每条评审）

| 事实 | 含义 |
|------|------|
| 多壳多端口 | mid `5173` · workbench `5174` · agent `5175` · ops `5176` · iam `5177` · api-mock `5180` · 并行壳 `5182–5187`（search/fto/mining/inspire/landscape/figure） |
| 共享内核 | 壳薄、业务在 `@ip/*` / 根 `src`；e2e 验的是**壳路由可达 + 关键路径**，不是每个装饰页的视觉回归 |
| ops / iam | 占位或薄壳；L0 只验入口可见，不验 ELK / 真 SSO |
| api-mock | `GET /health` 即可；禁止把 mock HTTP 当成生产契约回归 |
| 现有 config | `playwright.config.ts` 当前 `baseURL=5174`；**单端口绿 ≠ 多壳绿** |

违反上表的用例/报告 → **驳回**（见 §4）。

---

## 1. 分层定义

### L0 — 路由冒烟（必保）

**目标**：各壳主入口 HTTP 可达 + 可见标题/地标；失败应秒级暴露「壳挂了 / 端口错了」。

| 壳 | 端口 | 最小断言（示例口径） |
|----|------|----------------------|
| mid | 5173 | `/` 或 `/login`：可见产品/仪表盘地标（如「IP Harness」或「资产与任务」） |
| workbench | 5174 | `/workbench`：可见「业务工作台」 |
| agent | 5175 | `/agent`：可见办理入口（composer /「要办哪件事」/「发送|启动」） |
| ops | 5176 | 运维入口页：可见占位标题（不要求真实监控数据） |
| iam | 5177 | 登录/工作区薄壳：可见登录或 Persona/工作区切换地标 |
| api-mock | 5180 | `GET /health` → 2xx + 健康 JSON（`ok === true`） |
| search | 5182 | `/`：h1「专利检索工作台」 |
| fto | 5183 | `/`：h1「FTO 样机项目」 |
| mining | 5184 | `/`：h1「专利挖掘样机项目」 |
| inspire | 5185 | `/`：h1「问题 / 技术点」（可 `.or` 壳品牌「创新激发」） |
| landscape | 5186 | `/`：h1「选择产业域」 |
| figure | 5187 | `/`：h1「附图资产」 |

**并行壳增量**：`e2e/PLAN-L0-PARALLEL-5182-5187.md` · `l0-parallel-smoke.spec.ts`；端口权威在各 app `vite.config.ts`（本期**不**写入 `APP_PORTS`）。**Hunt 不进 L0**。

**L0 允许**：`request.get` / `page.goto` + `getByRole('heading'|…)` / 稳定 `data-testid`。  
**L0 禁止**：多步 click 链、填表、formal play、等动画、扫侧栏每一个 link。

**通过线**：五壳 + api + 并行六壳各自独立 baseURL（显式 `http://localhost:<port>`，禁止 `127.0.0.1`）；报告里写清端口。缺任一已宣称覆盖的壳却标「全绿」→ 驳回。跑前 curl≠200 → RESULTS 该口写「未跑」（不得假绿）；已跑但无 h1 / 白屏 → **FAIL**。

---

### L1 — 关键路径（必保，沿用并扩展 `critical-paths`）

**目标**：覆盖样机演示与交接风险最高的路径；深度止于「关键闸门可见/可点一次」，不为装饰页堆交互。

| # | 路径 | 最小范围 | 不做 |
|---|------|----------|------|
| 1 | 登录进仓 | `/login` → 选产品（作业中台 / 知产 Agent）→ 进入工作区（星河智造 / 德恒）→ 落在预期壳首页 | 穷尽所有租户/Persona |
| 2 | Inbox → HITL | Agent 侧待办/会话进入 `needs_human` 会话；ConfirmBar / `.confirm-hitl` 可见；专科 CTA 可见（批准策略 / 立项决定 / 确认告警等） | 每个 Agent 的完整 formal play（见 L2） |
| 3 | 案详 `tab=audit` | mid（或约定壳）案件详情打开审计/「最近领域命令」类 tab，可见审计列表地标 | 全 tab 遍历、导出、筛选矩阵 |
| 4 | ops 通知试发 | ops 占位页上「试发/通知」类控件可见并可点一次（或明确空态文案）；**不**要求真投递 | 告警规则 DSL、渠道矩阵、ELK |
| 5 | 工作台一阶段入口 | `/workbench` + 至少一个阶段入口（如 research / intake / draft…）可达且标题正确 | 全阶段 Flow 深填表 |

**与现有 `e2e/critical-paths.spec.ts` 的对照**

| 现有用例 | 分层裁定 | 说明 |
|----------|----------|------|
| Login SaaS → dashboard | **L1** | 保留 |
| Workbench 业务工作台 | **L1**（偏薄） | 保留；可升为「一阶段入口」 |
| Agent home composer | **L1** | 保留 |
| HITL 抽样（oa / layout / intake / watch） | **L1** | 保留；代表 Inbox→HITL |
| Catalog 全 9 heading | **L0/L1 边界** | 仅 heading 可见 → 可算 L1 清单烟；**禁止**再对 9 卡各开深交互 |
| `all agents session` ×9 formal play | **超标（暂降级建议）** | 样机冒烟过重；评审默认要求收敛为 **1～2 条代表路径**（如 1× needs_human + 1× queued→启动→HITL），其余回 L2 |

**L1 选择器偏好（硬）**

1. `getByRole` / label / 可见 heading  
2. 业务作用域（如 `.confirm-hitl`）内再匹配 CTA — **禁止**全局 `getByText('批准策略')`（易命中 textarea 文案假绿）  
3. 稳定 `data-testid`（仅关键闸门）  
4. **禁止**：长 CSS 链、nth-child 脆选择器、依赖动画/绝对文案像素的断言

---

### L2 — 暂缓（默认不写、不评「缺了就驳回」）

以下**明确不作为**当前样机 e2e 必保：

- 全 Catalog 九 Agent 各自 formal play / 全闸门矩阵  
- 全 Insight 图表交互、筛选、下钻  
- 全 Billing 细则（发票阻塞矩阵以外的会计路径）  
- mid 装饰页（OrgSettings 深表、Pipeline 拖拽细节、Docket 全列操作等）逐页 click 链  
- 无障碍全量、视觉回归像素、跨浏览器矩阵  
- 真 SSO / 真可观测 / 真消息投递

**例外**：总控或用户**点名**某条风险升 L1 时，单开一条窄用例，并在本文件 §1 L1 表追加一行（带日期）。

---

## 2. 评审输出格式（评审员必用）

结论只能是其一：

- **通过** — 分层正确、选择器稳健、多端口口径诚实、无 §4 驳回项  
- **驳回** — 列出对照表（问题 → 改法）；不代写大批量 spec（可给 ≤15 行示例片段）

对照表模板：

| 项 | 现状 | 裁定 | 改法 |
|----|------|------|------|
| 分层 | … | L0/L1/L2 / 超标 | … |
| 端口 | … | 诚实 / 单端口假绿 | … |
| 选择器 | … | 稳健 / 脆 / 假绿风险 | … |
| 覆盖风险 | … | 够 / 缺关键 / 过度 | … |

---

## 3. 新增用例准入清单（写之前勾选）

- [ ] 属于 L0 或 L1；若像 L2，已获总控/用户升格  
- [ ] 写明目标端口；跨壳用显式 URL，不靠「碰巧同仓单 Vite」  
- [ ] 断言用角色/地标/作用域 CTA，不用脆选择器  
- [ ] 不为「页面清单完整」而堆 click；样机深度够演示风险即可  
- [ ] 失败信息能区分：壳未起 / 端口错 / 业务回归  

任一项否 → 评审预驳回。

---

## 4. 驳回标准（一票否决）

| 编号 | 症状 | 为何驳回 |
|------|------|----------|
| R1 | 为装饰页堆 click 链 | 样机不要求全页深度；维护成本 > 信号 |
| R2 | 脆选择器（深 CSS、nth、无作用域文案） | 一改布局就红；或假绿 |
| R3 | 单端口假绿（只打 5174 却宣称 mid/agent/ops/iam 全覆盖） | 多壳口径不诚实 |
| R4 | 把 L2（全 Catalog 深交互 / 全 Insight / 全 Billing）塞进必跑套件 | 违背总控「不过度」 |
| R5 | CTA 断言未限制在 ConfirmBar / HITL 区域，命中页面说明文案 | 已知假绿模式（见 `RESULTS.md`） |
| R6 | 依赖未文档化的「某个壳顺便代理了别的壳」 | 与多壳样机诚实不一致 |

---

## 5. 给测试助手的落地建议（非本员代写）

1. **拆文件**：`e2e/l0-smoke.spec.ts`（多 baseURL/多 project）+ `e2e/critical-paths.spec.ts`（仅 L1）。  
2. **config**：`projects` 按壳分 port；或用例内 `test.use({ baseURL })`；api health 用 `request` fixture。  
3. **收敛**：`all agents session` ×9 → 代表路径 1～2；Catalog 停在 heading 清单。  
4. **报告**：`RESULTS.md` 必须列出端口矩阵；缺端口写「未跑」而非「通过」。

---

## 6. 修订记录

| 日期 (UTC+8) | 变更 |
|--------------|------|
| 2026-09-12 | 初版：总控要求「建评审标准」；L0/L1/L2 + 驳回 R1–R6；路径 `e2e/REVIEW_RUBRIC.md` |
| 2026-09-18 | 并行壳 L0（5182–5187）纳入尺子；host=`localhost`；未跑 vs FAIL 口径；Hunt 不进 L0 |
