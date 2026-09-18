# P 波 · 原型业务深度缺口清单（P_WAVE_GAPS）

> **审计口径**：逻辑缺口 / 空态 / 闸门 / 诚实文案。只读业务树；本文件为评估产出。  
> **用户口径（冻结）**：原型阶段 **不做真 GPU / 真 SFT**；主攻业务逻辑与表现。  
> **日期**：2026-09-18（CST）· Owner：业务深度审计（B 席）  
> **纠偏**：2026-09-18 尾巴5 — Search P4 旗标接 `:5190` 可回退 mock 已 Pass（SHA `b6fcc3b`）；同批一眼纠：下游诚实文案 / 策略 A toast+共享公开号 / Agent RedirectExternal 文档 / Workbench StageSkuGate。  
> **已引用、不复写长文**：[`EVAL_parallel_deep_demo.md`](../architecture/EVAL_parallel_deep_demo.md) · [`CROSS_PORT_DEBT.md`](./CROSS_PORT_DEBT.md) · [`cross-shell-basket.md`](../architecture/search/cross-shell-basket.md) · [`NEXT_WAVE.md`](../NEXT_WAVE.md) P 波表

---

## 1. 总判

**一句话**：五壳主办理闭环大体能讲完。原 P0（Search「下游未建」文案 + 工作篮策略 A）与 P4（旗标 `:5190`）在 `b6fcc3b` 等合入后**已收**——Search 写「已开壳 · 篮未跨口同步」、FTO/挖掘 toast「已用共享种子」、`VITE_SEARCH_API_URL` 接 sqlite-fts 失败回退 mock。

抽检三壳（doc-harness / ai-infra / ai-data）：EVAL 原 P0 **已收**，不复开。余下见 §2 仍开项（多为 P1/P2）与 §3。

---

## 2. 按壳表格

| 壳 | 缺口 | 级 | 路径/证据 | Owner |
|----|------|-----|-----------|-------|
| **search** | ~~下游未建文案~~ **已收**（`b6fcc3b`）：改为「已开壳 · 篮未跨口同步 · 请用共享种子/本壳导入」。 | **已收** | `SearchPage` / `SavedPage` / `types.ts` `DOWNSTREAM_*` · README 诚实表 | 检索服务助手 |
| **search / fto / mining** | ~~策略 A 未码~~ **已收**（`b6fcc3b` 及同波）：共享公开号对齐；导入 toast「样机·跨口未共享 LS，已用共享种子」。mining 壳内 id 可仍 `mining-h01*`（以公开号为演示键，规格允许）。 | **已收** | `seed.ts`（search/fto `h01…`）· `importFromSearchBasket` toast · README P5 | 检索服务 · FTO · 挖掘 |
| **search** | ~~P4 未接线~~ **已收**（SHA `b6fcc3b`）：`VITE_SEARCH_API_URL` 接 `:5190` → `backend: sqlite-fts`；超时/失败 **回退 mock** + 诚实 toast；UI 展示 backend。默认空旗标仍 mock。 | **已收** | `apps/search/src/lib/searchApi.ts` · `store.ts` · `SearchShell` · README「旗标接线（P4）」· `docs/architecture/search/search-api-flag-5190.md` | 检索服务 + 检索落地 |
| **mid** | 大块态跨口 **强依赖 mid:5173 bridge**；mid 未起则多壳「同一套案件」叙事塌。限制已写 `CROSS_PORT_LIMITS_ZH`，演示剧本须强制 mid 在跑，否则像故障。 | **P1** | `packages/app-state/src/crossPortStore.ts` · `docs/audit/CROSS_PORT_DEBT.md` 样机限制 | 中台应用助手（守 bridge）· 共享包助手（文案/契约） |
| **mid** | Insight / DataStrategy 为示意覆盖率与路线图 mock；横幅诚实（「未接真实库」）。**无 P0 闸门洞**；深演示勿吹真库同步。 | **P2** | `src/pages/DataStrategy.tsx` · Insight* + `InsightDataBanner` | 中台应用助手 |
| **workbench** | ~~SKU 运行时空~~ **已收**（一眼纠）：`StageSkuGate` + `StageSkuEmpty` + demo entitlement；未购不挂 Flow → 不写 handoff。 | **已收** | `apps/workbench/src/components/StageSkuGate.tsx` · `StageSkuEmpty` · `StageSkuDemoPanel` · `App.tsx` 包裹 | 工作台应用助手 |
| **workbench** | 主闸（Handoff / Persona / 交底六项 / OA 陈述 / 年费 payInvoice）源码侧站得住；诉讼维权诚实空态 OK。根 `src/pages/workbench` 与 app **分叉**——改错面会演「修了没生效」。 | **P2** | `HandoffActionBar.tsx` · `InventorPortal.tsx` · `MonetizeFlow` 诉讼空态 · `docs/workbench/OWNERSHIP.md` | 工作台应用助手 |
| **agent** | HITL 主路径可用。~~「丢 path」旧文档~~ **已收**：README / `AGENT_P0_ACCEPTANCE` 已写 mid `RedirectExternal` **保留** path+search+hash。 | **已收**（文档） | `apps/agent/README.md` · `AGENT_P0_ACCEPTANCE.md` | Agent应用助手 |
| **agent** | 无案会话 `no_case` banner / 闸禁用有提示；等效演示仍入口可见（已标阉割）。非挡演示，彩排勿点错当主路径。 | **P2** | `SessionWorkspaceHeader.tsx` · `AgentContext` 阉割 message | Agent应用助手 |
| **ops** | 全页 mock + 非 live / 不发真通道横幅到位；**无可跳过的业务闸**（本面本就不办案）。勿把 Overview 数字讲成 live SLA。 | **P2**（守口径） | `OverviewPage` · `MonitorPage` · `AlertNotifyPanel` · README | 运维平台助手 |
| **iam** | 非真 SSO / OIDC 禁用空态 / 样机 cookie 文案到位。共享 Login **不读** `return`/`next`（包装层另回跳）——深链回跳要走本壳区，否则像「登录丢目标」。 | **P1** | `IamLoginPage.tsx` · `OidcEmptyState.tsx` · README「共享 Login 不读 return」 | IAM应用助手（包装层已有则补联调清单） |
| **fto** | 五步门禁成立；假比对诚实；跨口导入策略 A **已收**（共享种子 toast）。报告 Confirm **不写** PatentCase — 守住。 | **P2** 余 | `HitsPage` · `importFromSearchBasket` | FTO |
| **mining** | 送出占位诚实；策略 A **已收**（公开号对齐 + 共享种子 toast；壳内 id 可不同）。 | **P2** 余 | `SendPage` · `importFromSearchBasket` | 挖掘 |
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
| **已收** | Search→下游诚实文案 | `b6fcc3b`：已开壳 · 篮未跨口同步 | search UI + README |
| **已收** | 工作篮策略 A（P5） | 共享公开号 +「已用共享种子」toast | `cross-shell-basket.md` · `b6fcc3b` |
| **已收** | Search 旗标 `:5190`（P4） | 可回退 mock；不改 APP_PORTS | `searchApi.ts` · `b6fcc3b` |
| **P1** | 「发布」一词多义（训推面） | ai-data dataset version / ai-infra pipeline / endpoint status——串讲必须改口。EVAL §5.2 仍有效。 | EVAL_parallel_deep_demo |
| **P1** | cookie ≠ SSO；大块态 ≠ 共享后端 | 五壳联调必须口播；IAM/CROSS_PORT 已写，彩排脚本要钉死。 | CROSS_PORT_DEBT · IAM README |
| **冻结不动** | Docket×Maintain 分表 · Drive 双存 · 建案进调研台 | 设计债，本波不改。 | CROSS_PORT_DEBT |

跨口深链主路径（AppLink / navigateApp / Inbox→HITL）**已清**，见 CROSS_PORT_DEBT；**勿再当 P0 重开**。

---

## 4. 建议下一刀（只排序，不派工）

1. ~~Search 下游诚实文案~~ **已收**（`b6fcc3b`）

2. ~~工作篮策略 A / P5~~ **已收**（`b6fcc3b`）

3. ~~Workbench Stage SKU 最小闸~~ **已收**（`StageSkuGate`）

4. ~~Search 旗标接 :5190 / P4~~ **已收**（`b6fcc3b`：接 sqlite-fts，失败回退 mock）

5. ~~Agent RedirectExternal 文档~~ **已收**

6. **附图挂章 / 全景加篮**（仍开）：保持 toast，补一句「打开 doc-harness / search 需人工对照种子」——防装真写入。

7. **训推「发布」一词多义**（P1 口播）：串讲改口，见 EVAL §5.2。

---

## 5. 明确不在本波

- **真 GPU / 真权重 / 真 Release 模型**；I2 stub 封存可用，不加真训刀  
- **真 SFT 扩训**、大规模 CPT/DPO  
- **真 ES / 全球专利库 / 完整向量**（sqlite-fts 旗标接线 **P4 已收** `b6fcc3b`，仍非真 ES）  
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
- **尾巴5 纠偏**仅改本审计文档；代码事实以 `b6fcc3b` 及当前 `apps/search` / `workbench` / `agent` README 为准。
