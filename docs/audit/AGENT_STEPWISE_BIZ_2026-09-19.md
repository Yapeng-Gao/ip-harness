# Agent 逐步业务/呈现审计 · S0–S2

> **口**：`apps/agent` · `:5175` · 分支 `dev` · HEAD `1fb148255e7757295e45d07327f08768c883e81d`  
> **日期**：2026-09-19（CST / Asia/Shanghai）  
> **性质**：只评、不派工；**不改**产品码。  
> **范围**：冻结步 **S0–S2**（入口 · 通用单聊/sessions · 案绑定）。S3+ 仅 stub。

## 总判

默认落地 `/agent` 通用单聊、不强制建项目、不自动填案——**入口规格大体立住**。案绑定路径（`CaseBindControls` + `mock-case-*` +「未进中台库」文案）对 domain/general 分权重，**诚实度明显好于半成品壳**。缺口在**壳级诚实横幅**：规格建议的「样机 · 无真 LLM · 通用/项目分入口」在 Home/Shell **缺席**，只在项目 HITL 桥脚注出现——演示官若只扫 Home，会把 Composer 当真 LLM。sessions 已降为次级导航，但列表仍叫「全部会话」，未钉死「通用历史」心智；项目线程与 sessions **两套真相**尚未用标签合流。S0–S2 **无 P0 级静默真写/强绑案**；写库闸与 dry-run 标签在会话侧可查。

## 对照规格（方法备忘）

| 规格 | 路径 | blob SHA（本仓） | 内容 SHA256（前 12） |
|------|------|------------------|----------------------|
| 入口模式 | `docs/architecture/product-apps/agent-entry-modes.md` | `d82dc569d93c` | `e1eb00ead2c1` |
| 案绑定 | `docs/architecture/product-apps/agent-case-binding.md` | `13bbe68edf8b` | `db46cfcd6bae` |
| 产品面 HITL | `docs/architecture/product-apps/agent-surface.md` | `4756e7c163e7` | `e1e18e82bfda` |
| README / 口播 | `apps/agent/README.md` | — | `35b5af9498ae` |
| P0 验收（深链/字体，非本步主据） | `apps/agent/AGENT_P0_ACCEPTANCE.md` | — | 已读 |

**方法**：对照规格静态追 `apps/agent/src` 路由与文案；未做浏览器点通。关键禁用/诚实句以源码字面为准（`data-testid` / 横幅字符串）。共享写库逻辑只读引用 `@ip/app-state` · `playMockSession`（非本 app 改动面）。

**明确不做**：真 LLM、真 case-core、改 `apps/**` 产品码、本波派工 Owners、S3+ 深审。

---

## S0–S2 短表

| 步 | 业务故事 | 屏上 | 代码证据 | 判 | 级 |
|----|----------|------|----------|----|-----|
| **S0** · 进壳默认入口 | 打开 :5175 / `/agent` = **通用单聊**；不强制建项目；案可选空；样机诚实（mock / 无真 LLM） | `/`→`/agent` 居中 Composer+Chip+Catalog；文案「默认通用单聊 · 项目模式（次级）」；案区 soft「可稍后创建或绑定」；**壳顶无**「无真 LLM」横幅 | `App.tsx` `/`→`/agent` index=`AgentHome`；`AgentHome.tsx` 无 `resolvePreferredCaseId`、默认 `caseId=''`；`CaseBindControls` soft；`AgentShell.tsx` 无样机横幅（Billing 横幅亦卸） | **半立** | **P1**（诚实横幅缺） |
| **S1** · 通用单聊 / sessions 兼容 | Composer+Catalog；sessions=通用历史；不与项目抢主心智；无案 banner/闸诚实；试运行不写库 | 侧栏主链：开始 / Agent / **会话**；「项目（次级）」藏「更多」；会话顶栏 `no_case`：「无案也可继续聊 · 确认后不会写入案件」；「预览一下」→ Timeline「预览不写库」 | `AgentSessionSidebar.tsx` nav；`SessionWorkspaceHeader.tsx` `activeBanner==='no_case'`；`playMockSession` 默认/`dry-run` 文案「不写入业务台账」；`SessionTimeline.tsx` `toolWriteTag`；`AgentSessionsList.tsx` 标题仍「全部会话」（未写「通用历史」） | **半立** | **P1**（列表心智）/ **P2**（项目线程未入 sessions 标签） |
| **S2** · 案绑定 | 通用可一直无案；项目区「创建并绑定 / 绑已有」；mock caseId；禁静默真建案；与 mid 关系诚实 | Home/会话 soft；项目顶栏 domain **strong**「写入案件前须绑定」、general soft；创建确认钮「生成 mock 案并绑定」+ 琥珀说明「不进真 case-core / 中台库」；已绑 mock 标「· 样机」；列表新建案可选「可稍后…」 | `CaseBindControls.tsx` + `lib/mockCase.ts` `newMockCaseId`；`addCase` 本地种子 summary 写明非 case-core；`ProjectListPage.tsx` / `ProjectWorkspacePage.tsx` `patchProject`；`ProjectFolderContext` 演示项目 `caseBindState:'none'`；时间线「样机绑定 · 非真 case-core」；**无**「必须先去中台」门禁文案 | **立得住** | —（仅 P2 毛刺） |

### 逐步行判（严厉）

#### S0 · 进壳默认入口 — **半立**

- **立得住**：路由与 IA 对齐 `agent-entry-modes` §1/§2——默认通用、项目可选次级；`caseId` 默认空，URL `?case=` 仅在种子存在时回填，**禁止**静默 `resolvePreferredCaseId`（源码注释已钉规格）。
- **塌一半**：规格 §7 横幅建议未进壳。用户打开 Home 看到的是「知产 Agent / 确认后写入案件」产品口吻，**没有**一眼可读的「样机 · 无真 LLM」。项目区 `ExpertHitlBridge` 脚注有「无真 LLM」，但那是进夹之后——**默认入口撒谎成本最高的地方反而最软**。
- **级**：P1（呈现诚实，非写库洞）。

#### S1 · 通用单聊 / sessions — **半立**

- **立得住**：侧栏把项目标「次级」；无案横幅与「无案确认不会写入案件」一致；dry-run / 预览路径明确不 `dispatchCommand`（`@ip/app-state` `playMockSession`：`mode==='formal' && caseId` 才准备领域写入叙事；HITL `if (sess.caseId)` 才跑命令链）。
- **半立**：`AgentSessionsList` 仍叫「全部会话」，规格 §4 主心智是「通用历史」——和项目文件夹并列感虽被导航压住，**文案未钉死**。项目 1:1 线程在 `ProjectFolderContext`，**未**按规格「sessions 列表标签过滤」合流——两套真相并存（可接受为样机债，须记账）。
- **级**：列表心智 P1；线程合流 P2。

#### S2 · 案绑定 — **立得住**

- **立得住**：创建路径强制走 UI「生成 mock 案并绑定」；id=`mock-case-<ts>`；本地 `addCase` 摘要自证「未进中台库 / 非真 case-core」；绑已有走 `visibleCases` 下拉；解除绑定清 `caseId`。domain strong / general soft 与「写回须绑」叙事匹配。演示项目种子无案。与 mid：**引用本地/种子案，不声称第二套权威库**；无「先去中台再建聊」闸。
- **毛刺**：`CaseBindState` 含 `pending_create`，`caseBindStateFromId` 只映射 `none|bound`——类型超前、UI 未用（P2）。创建案**未**走 Confirm→DomainCommand（规格写「可选」）——样机可接受，但别在口播里吹成「已过 HITL 建案」。

---

## 缺口清单

### P0

（空）— 未发现强制 caseId/强制建项目、或无 HITL 静默真 case-core 写库。

### P1

1. **壳/Home 缺样机诚实横幅** — 规格 `agent-entry-modes` §7 建议「样机 · 无真 LLM · 通用/项目分入口」；`AgentShell` / `AgentHome` 无对等呈现。证据：`apps/agent/src/components/AgentShell.tsx`；对比 `ExpertHitlBridge.tsx` 脚注。
2. **sessions 列表心智未钉「通用历史」** — `AgentSessionsList` PageHeader「全部会话」；侧栏「会话」与「项目（次级）」并存时，列表页自身未复述兼容定位（规格 §4）。

### P2

1. **项目线程 ↔ sessions 未标签合流** — 规格允许过滤；现两套存储（`AgentContext` sessions vs `ProjectFolderContext` threads）。
2. **`pending_create` 死类型** — `types.ts` / `mockCase.ts` 有枚举，运行时未进入该态。
3. **Home 副文案偏领域闭环** — 「专利检索 · OA · 交底 · 年费 · 确认后写入案件」对「通用单聊」略抢戏（Catalog 本身即领域 AgentDef，可忍）。

---

## 待续 · S3+（本波不深审）

| 步（预告） | 焦点 | 状态 |
|------------|------|------|
| S3 · HITL ConfirmBar | gate→`dispatchCommand(actor:'agent')`；试运行 vs 正式；无案禁用诚实 | **待续** |
| S4 · DomainCommand / 写库唯一入口 | 禁直写；命令链预览；发票/Full-check | **待续** |
| S5 · 项目 general \| domain | 分剧本隔离；patent 步骤条不泄漏 general；总控禁一键写库 | **待续** |

---

## 证据索引（路径）

- 路由：`apps/agent/src/App.tsx`
- Home / 无强制案：`apps/agent/src/pages/AgentHome.tsx`
- 壳 / 侧栏：`apps/agent/src/components/AgentShell.tsx` · `AgentSessionSidebar.tsx`
- 案绑：`apps/agent/src/components/case/CaseBindControls.tsx` · `apps/agent/src/lib/mockCase.ts`
- 会话无案横幅：`apps/agent/src/components/session/SessionWorkspaceHeader.tsx` · `pages/AgentSessionWorkspace.tsx`
- 预览不写：`apps/agent/src/components/session/SessionTimeline.tsx`；逻辑 `@ip/app-state` `playMockSession`
- 项目绑案：`pages/projects/ProjectListPage.tsx` · `ProjectWorkspacePage.tsx` · `projects/ProjectFolderContext.tsx` · `projects/types.ts`
