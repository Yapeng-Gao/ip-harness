# P 波 · 原型业务深度缺口清单（P_WAVE_GAPS）

> **审计口径**：逻辑缺口 / 空态 / 闸门 / 诚实文案。只读业务树；本文件为评估产出。  
> **用户口径（冻结）**：原型阶段 **不做真 GPU / 真 SFT**；主攻业务逻辑与表现。  
> **日期**：2026-09-18（CST）· Owner：业务深度审计（B 席）  
> **已引用、不复写长文**：[`EVAL_parallel_deep_demo.md`](../architecture/EVAL_parallel_deep_demo.md) · [`CROSS_PORT_DEBT.md`](./CROSS_PORT_DEBT.md) · [`cross-shell-basket.md`](../architecture/search/cross-shell-basket.md) · [`NEXT_WAVE.md`](../NEXT_WAVE.md) P 波表

---

## 1. 总判

**一句话**：五壳主办理闭环（中台台账 → 工作台闸门 → Agent HITL → IAM/运维诚实空态）大体能讲完；**挡演示的是并行检索链叙事撒谎 + 跨口工作篮策略 A 未码齐**——Search 仍写「下游未建」，FTO/挖掘壳已站着，点「送 FTO」像进了鬼城；种子 `id` 分叉，导入永远 toast「无跨口」却不兑现规格里的「共享种子可演示」。

抽检三壳（doc-harness / ai-infra / ai-data）：EVAL 所列 **Job↔version 钉死、按章 commandType、authorized:false 种子、draftNote UI、Pipeline 发布挂端点** 源码侧已收口，**不再当本波 P0 复开**；余下见 §3 摘要。

---

## 2. 按壳表格

| 壳 | 缺口 | 级 | 路径/证据 | Owner |
|----|------|-----|-----------|-------|
| **search** | **诚实文案翻车**：UI/README 仍写「下游未建 / 不建下游壳 / 可能 404」；FTO:5183、挖掘:5184、全景:5186、文档:5178 **壳已存在**。演示点「送 FTO」= 装残废。 | **P0** | `apps/search/src/pages/SearchPage.tsx`（`下游未建 / 占位`）· `SavedPage.tsx` · `AgentPanel.tsx` · `apps/search/README.md` C2-2 / 诚实表「壳未建」· `store.ts` `sendDownstream` note「下游壳占位」 | 检索服务助手 |
| **search / fto / mining** | **策略 A 未落地**：规格默认「共享种子 ID + 诚实 toast」；现状 seed **`id` 分叉**（`h01` vs `fto-h01` vs `mining-h01`），仅 `publicationNumber` 有交集；FTO「从 Search 导入」**永远** toast「无跨口…仍用/补种子」，**无**「已用共享种子」可讲路径。能点、办不圆。 | **P0** | `docs/architecture/search/cross-shell-basket.md` §3 策略 A · `apps/search/src/state/seed.ts` · `apps/fto/src/state/seed.ts` · `apps/mining/src/state/seed.ts` · `apps/fto/src/state/store.ts` `importFromSearchBasket` | 检索服务 · FTO · 挖掘（契约对齐总控） |
| **search** | 检索表现仍纯 `backend:'mock'`；`search-api:5190` sqlite-fts **I1 已 Pass 未接线**。旗标/回退未做——表现波（P4）债，不挡「假检索故事」，挡「落地可回退演示」。 | **P1** | `apps/search/src/state/types.ts` `backend: 'mock'` · `store.ts` · `docs/NEXT_WAVE.md` P4 / I1「未接线 apps/search」 | 检索服务 + 检索落地 |
| **mid** | 大块态跨口 **强依赖 mid:5173 bridge**；mid 未起则多壳「同一套案件」叙事塌。限制已写 `CROSS_PORT_LIMITS_ZH`，演示剧本须强制 mid 在跑，否则像故障。 | **P1** | `packages/app-state/src/crossPortStore.ts` · `docs/audit/CROSS_PORT_DEBT.md` 样机限制 | 中台应用助手（守 bridge）· 共享包助手（文案/契约） |
| **mid** | Insight / DataStrategy 为示意覆盖率与路线图 mock；横幅诚实（「未接真实库」）。**无 P0 闸门洞**；深演示勿吹真库同步。 | **P2** | `src/pages/DataStrategy.tsx` · Insight* + `InsightDataBanner` | 中台应用助手 |
| **workbench** | **Stage Module SKU**：规格写清未购 → 诚实空态 + 不写 handoff；**运行时无 entitlement / 未授权空态**。侧栏九段全开——「可卖单节点」故事装得上、验不了。 | **P1** | `docs/workbench/STAGE_MODULE_SKU.md` · `apps/workbench/src/stages/*`（无 SkuGate）· `OWNER_STATUS` 仅文档 | 工作台应用助手 |
| **workbench** | 主闸（Handoff / Persona / 交底六项 / OA 陈述 / 年费 payInvoice）源码侧站得住；诉讼维权诚实空态 OK。根 `src/pages/workbench` 与 app **分叉**——改错面会演「修了没生效」。 | **P2** | `HandoffActionBar.tsx` · `InventorPortal.tsx` · `MonetizeFlow` 诉讼空态 · `docs/workbench/OWNERSHIP.md` | 工作台应用助手 |
| **agent** | HITL ConfirmBar + `evaluateGuardrails` 主路径可用；「一键等效」已阉割并藏菜单。**README / AGENT_P0 仍声称 mid MetaRedirect 丢 path**——与 `apps/mid` `RedirectExternal` 保留 path/search/hash、`docs/mid/STATUS` **矛盾**，口播易踩旧雷。 | **P1** | `apps/agent/README.md` 已知限制 · `AGENT_P0_ACCEPTANCE.md` · 对照 `apps/mid/src/App.tsx` `RedirectExternal` | Agent应用助手（改文档）· 中台（代码已齐则确认回归） |
| **agent** | 无案会话 `no_case` banner / 闸禁用有提示；等效演示仍入口可见（已标阉割）。非挡演示，彩排勿点错当主路径。 | **P2** | `SessionWorkspaceHeader.tsx` · `AgentContext` 阉割 message | Agent应用助手 |
| **ops** | 全页 mock + 非 live / 不发真通道横幅到位；**无可跳过的业务闸**（本面本就不办案）。勿把 Overview 数字讲成 live SLA。 | **P2**（守口径） | `OverviewPage` · `MonitorPage` · `AlertNotifyPanel` · README | 运维平台助手 |
| **iam** | 非真 SSO / OIDC 禁用空态 / 样机 cookie 文案到位。共享 Login **不读** `return`/`next`（包装层另回跳）——深链回跳要走本壳区，否则像「登录丢目标」。 | **P1** | `IamLoginPage.tsx` · `OidcEmptyState.tsx` · README「共享 Login 不读 return」 | IAM应用助手（包装层已有则补联调清单） |
| **fto** | 五步门禁（空 hits / 空特征挡 Confirm）成立；假比对诚实。跨口导入见上表 **P0**。报告 Confirm **不写** PatentCase — 守住。 | （主债并入跨壳 P0） | `HitsPage` · `store.importFromSearchBasket` · README 门禁 | FTO |
| **mining** | 送立项/撰写 = 内存 intent + 深链占位，文案诚实「不写立案库」。与 Search 篮 id 不对齐 → 并入跨壳 **P0**。 | （并入 P0） | `SendPage.tsx` · `store.ts` send* | 挖掘 |
| **inspire** | 扩召种子拼装标非 LLM；送出占位诚实。纵深弱（不喂挖掘打分）——可演示、勿串成一条 DAG。 | **P2** | `store.ts` expandSparks toast · `SendPage.tsx` | 激发（并行壳 Owner） |
| **landscape** | 「加入工作篮」仅 toast、不跨口；非汽车域 disabled「另立项」诚实。N4 真图谱不开工。 | **P1** | `NodePage.tsx` · `store.showToast` 占位 · README | 全景 |
| **figure** | 生成→编辑→挂章主闭环可点；挂章 = toast + 事件 + 深链 doc-harness，**不写**文档 runtime。讲「已挂进文档章」会被戳穿。 | **P1** | `AttachPage.tsx` · `store.attachChapter` · README | 附图 |
| **doc-harness**（抽检） | EVAL P1（commandType / 整案闸种子）**已收**；批注重挂 orphan、headRevision 语义仍 P2。可深演示。 | **P2** 余 | 见 EVAL §2.3；`seed.ts` 含 `authorized:false` | doc-harness |
| **ai-infra**（抽检） | EVAL P0 version 钉死 / 队列=pool / Pipeline 发布挂端点 **已收**。仍非真 GPU；跨口靠种子。 | **P2** 余 | `JobsPage` `datasetCompositeKey` · `PIPELINE_PUBLISH` | AI Infra |
| **ai-data**（抽检） | draftNote UI / 部分 quality `pass` 种子 **已收**；导出候选绕质量门进 immutable（须口播「候选≠契约发布」）仍在。 | **P2** | EVAL §4.3；`createCandidateFromExport` | AI Data |

---

## 3. 跨壳 / 契约债

| 级 | 债 | 说明 | 对照 |
|----|----|------|------|
| **P0** | Search→下游 **文案与现实不一致** | 壳已建仍写「未建」；深链能开壳，篮传不过去，叙事双输。 | search UI + README vs 并行壳实际端口 |
| **P0** | 工作篮 **策略 A 未码** | 规格 Pass（N2）；种子 id 未统一；无「共享种子」toast 口径落地。 | `cross-shell-basket.md` · NEXT_WAVE **P5** |
| **P1** | 「发布」一词多义（训推面） | ai-data dataset version / ai-infra pipeline / endpoint status——串讲必须改口。EVAL §5.2 仍有效。 | EVAL_parallel_deep_demo |
| **P1** | cookie ≠ SSO；大块态 ≠ 共享后端 | 五壳联调必须口播；IAM/CROSS_PORT 已写，彩排脚本要钉死。 | CROSS_PORT_DEBT · IAM README |
| **冻结不动** | Docket×Maintain 分表 · Drive 双存 · 建案进调研台 | 设计债，本波不改。 | CROSS_PORT_DEBT |

跨口深链主路径（AppLink / navigateApp / Inbox→HITL）**已清**，见 CROSS_PORT_DEBT；**勿再当 P0 重开**。

---

## 4. 建议下一刀（只排序，不派工）

1. **改 Search 下游诚实文案 + 深链话术**（P0）  
   「下游未建」→「已开壳 · 篮未跨口同步 · 请用共享种子 / 本壳导入」；README C2 同步。否则并行演示第一句就翻车。

2. **落地工作篮策略 A 最小码**（P0 / 对齐 P5）  
   统一 search/fto/mining 种子 `id`（或明确以 `publicationNumber` 为演示键并改 toast）；FTO/挖掘导入改为「跨口 LS 不通 · **已加载共享种子篮**」。勿上真 basket API（规格 D 属落地）。

3. **Workbench Stage SKU 最小闸**（P1）  
   内存 entitlement + 直链未授权诚实空态（不写 handoff）。规格已有，缺的是能点到的拒绝态。

4. **Search 旗标接 :5190**（P1 / 波次 P4）  
   可回退 mock；不改 APP_PORTS。跟架构 P2 边界短文后开工。

5. **Agent/中台文档对齐 RedirectExternal**（P1 文档）  
   删「丢 path」过时警告，避免彩排按旧洞排障。

6. **附图挂章 / 全景加篮**：保持 toast，补一句「打开 doc-harness / search 需人工对照种子」——防装真写入。

---

## 5. 明确不在本波

- **真 GPU / 真权重 / 真 Release 模型**；I2 stub 封存可用，不加真训刀  
- **真 SFT 扩训**、大规模 CPT/DPO  
- **真 ES / 全球专利库 / 完整向量**（search-api sqlite-fts 旗标接线除外）  
- **N4 case-core / 真产业图谱**  
- **真 SSO / OIDC / 真 SMTP·短信·Webhook**  
- 改 `APP_PORTS`、为 SKU 拆新 Vite 壳、五壳 bridge 扛检索篮  
- 皮肤 polish（归 P3 UI 席）；本清单不派 UI 质感

---

## 附录 · 方法备忘

- 五壳：各 `README` + `App.tsx` 路由 + 关键闸（Handoff / ConfirmBar / guardrails）+ 已有 STATUS/OWNER/AGENT_P0。  
- 并行壳：`README` deep-demo 门禁 + `state/store|seed` + Search 下游文案交叉核对。  
- 抽检：对照 EVAL 路径复扫——已修项降级，不重复长文。  
- 未做全量浏览器点通；以 `disabled` / toast / seed id / 文案字面为据。验收以 Owner 自测清单 + 总控抽验为准。
