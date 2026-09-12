# EVAL · IP 垂类 Agent 平台（IP + AI + Harness + Agent）

日期：2026-09-11（UTC+8）  
对象：`/workspace/ip-harness` 当前源码 + README / HARNESS / COMMANDS / OPTIMIZE_NOTES（尾部）/ DEEP_NODE_EVAL / DEEP_BIZ_PRESENTATION / AgentHome（最新）/ AgentShell / Catalog / SessionWorkspace 略读 / `agents.ts` / App 双产品路由  
方法：只读评估，**不改代码**。刻度偏「客户会不会买 / 信」，不是像素 polish。

---

## 1. Verdict

作为 **IP 垂类 Agent 平台**叙事，这套东西已经越过「ChatGPT 套壳」和「纯表单 SaaS」两端，落到一个少见的中间态：**有真业务命令面的双产品 harness 原型**。九个专业办理人、差异化 HITL、试运行/正式执行、`actor: user|agent` 审计、与作业中台共用 `dispatchCommand`，再配上 Cursor 隐喻的会话壳与「写回中台」主线——**设计合伙人口播与深路径 demo 是可信的**。但它明确不做真 LLM、无持久化、无商业检索/国知局 API、编排全靠剧本：因此 **demo-ready，不是 production-shaped**。若按「最好的 IP 垂类 Agent 平台」标尺，今天是 **强架构样机 + 深 IP 作业故事**，不是可上线的智能办理系统。

**综合分：6.5 / 10**  
（+）：垂类作业深度与双表面命令同构远超同类包装；Harness 概念清晰。  
（−）：「Agent」里的 AI 几乎为空；若干 specialty 与列表「找活干」体验仍偏戏台；客户无法把信任押在自动办理结果上。

---

## 2. Four-pillar scores（各 1–5）

| 支柱 | 分 | 一句话 |
|------|----|--------|
| **IP 领域深度** | **4** | 中国发明全生命周期语汇齐（检索→交底→立项→撰写→OA→年费→监控→转化→布局）；RACI、发票阻塞、Docket、handoff 键、齐套门禁在调研/OA/立项上能抗浅盘问。长尾（监控处置枚举、转化法务会签、布局洞察）仍薄；数据全是种子 mock。 |
| **AI / Agent 体验** | **2.5** | 交互像 Agent（Composer → Session → Tool 卡 → HITL → 产物），Auto 路由与办理人目录像样；但 **无真实模型、无真实工具调用、无检索/生成质量**——正式执行 = 剧本回放。体验超前于智能，买「AI 能力」会失望，买「办理交互隐喻」能点头。 |
| **Harness 运行时** | **4** | 「一套运行时 + 多插件 Agent」立得住：Session / Orchestrator(mock) / Tools 声明 / 按 Agent 的 HITL / 唯一写库 Command。dry-run vs formal、闸门→命令映射、消防通道（EQ 阉割、禁工具抢跑、命中可核验、stepwise 默认）说明团队懂 harness 纪律。仍是 SPA 内存编排，不是可观测、可扩展的服务端 runtime。 |
| **产品双表面（中台 ↔ Agent）** | **4.5** | 本仓库最强差异化。`activeProduct` 双壳、共享领域命令、案件/工作台互跳、审计可对照——这是「垂直 Agent 平台」相对通用助手的护城河雏形。扣 0.5：深度仍不均匀；列表层「待谁确认/发票堵」弱于工作台队列；交底门户与 Agent 表面曾断层（后续已补台账，仍非独立交底 Flow）。 |

**支柱均分 ≈ 3.75**（与综合 6.5/10 同向：架构与领域拉高，AI 底盘拖低）。

---

## 3. What's uniquely strong（相对通用 ChatGPT 包装 / 纯 SaaS 表单）

1. **命令同构，不是聊天旁路**  
   Agent 不「建议你去点表单」，而是经同一 `dispatchCommand` 写交接 / 授权 / 递交 / 开票付款 / Docket；审计可对比 `user` vs `agent`。通用助手几乎做不到这一点。

2. **Harness 纪律可见**  
   试运行不写库、正式执行才写；HITL 按办理人差异化；企业/代理 RACI；发票阻塞同源；高风险路径（递交、建案派所）被反复「封消防通道」。这是平台思维，不是单次 Prompt Demo。

3. **IP 作业本体，而非「专利聊天」**  
   首页语汇是案件·期限·OA·交底·年费；办理人带 `handoffKey` / `workbenchPath` / guardrails / whenToUse；与七段工作台对齐。比「上传说明书 → 生成权利要求」单点工具更像 **办理操作系统**。

4. **双产品切换是产品战略，不是导航彩蛋**  
   作业中台（Form）保合规逐步面；IP 办理（Agent）保会话编排面；同一案件真相。对「中台已有、想叠 Agent」的买家，故事完整。

5. **Catalog 级专业 Agent 插件模型**  
   九办理人 + Auto 建议理由 + 阶段错配确认 + Skills meta——买家能看见「平台可插拔」，而不是一个 monolithic bot。

---

## 4. What still fails the vertical story（客户不买 / 不信）

| 失败点 | 为何致命 |
|--------|----------|
| **没有真 AI** | HARNESS.md 明文「不引入真实 LLM」。再深的剧本也无法回答「你们模型/检索准不准、幻觉谁负责」。采购会把你标成 UI 原型。 |
| **没有真外部系统** | 无商业专利库、无官费/电子申请、无对象存储 Drive（已诚实标演示内存）。写回「中台」只是同源 mock store。 |
| **智能深度 ≪ 表单深度** | 工作台有字段级齐套；Agent 侧大量靠工具卡 + ConfirmBar。懂行的代理人会问：「争点分析是算出来的还是演的？」 |
| **找活干的表面偏弱** | 会话列表长期偏运行态；换角色「待我批 / 发票堵」不如工作台队列——运营型买家第一天找不到活。 |
| **长尾 specialty 勿包装成闭环** | 转化无法务会签、监控缺升级/忽略、布局偏洞察建案——可标 beta，不可称「全生命周期 Agent 平台已完工」。 |
| **信任与责任空白** | 护栏文案有「非法律意见」，但缺租户权限模型、模型版本、人工签字证据链、失败补偿——律所/企业 IP 不会把递交权交给它。 |

**一句话**：客户可以 **信「你们懂 IP 作业与 harness」**；不会 **信「交给你们 Agent 就能办完」**。

---

## 5. Competitive framing

| 档位 | 是否匹配 | 说明 |
|------|----------|------|
| 空壳原型 / 概念片 | ❌ 已超过 | 命令面、闸门、双壳、深路径不是幻灯片。 |
| **设计合伙 / 销售深 Demo** | ✅ **当前位置** | 脚本化走调研或 OA：正式执行 → stepwise HITL → 中台对照审计，能打穿「是不是套壳」质疑。 |
| **产品 MVP（可周活试用）** | ⚠️ 差一截 | 缺真模型+真检索+持久化+权限+至少 1–2 条可独立创造价值的办理闭环（如 OA 草稿或调研报告真产出）。 |
| 生产平台 | ❌ | 不谈。 |

**市场座位**：介于「垂直 IP 作业系统的 Agent 外壳样机」与「早期 design-partner 平台」之间——**不是**另一家 PatSnap/智慧芽式检索产品，也**不是**通用 Copilot；最接近的自我定位应是：**IP 办理操作系统（中台）+ 可插拔专业 Agent 运行时（Harness）**，AI 层尚待填实。

---

## 6. Top 5 next bets（目标：「最好的 IP 垂类 Agent 平台」· 业务+产品，非 CSS）

1. **先钉死 1 条「真智能」办理闭环（建议：调研或 OA）**  
   接入真实 LLM + 至少一种可核验检索/文献源；输出可编辑产物进同一 handoff；保留现有 HITL/Command。用一条闭环证明「Agent」不是剧本——比再扩三个 specialty 更能抬估值叙事。

2. **把 Harness 从 SPA mock 升成可承诺的运行时契约**  
   Session/Run/ToolCall/HITLDecision/Command 事件模型持久化；失败可重试；审计导出；租户与角色服务端执法。UI 已超前，缺的是平台骨架。

3. **「待我办理」跨壳工作队列做成第一屏资产**  
   Agent 会话列表 + 工作台队列统一：待企业确认 / 待代理递交 / 发票阻塞 / 未绑案。运营日活靠找活，不靠 Composer 空态颜值。

4. **Specialty 诚实分层：Core / Assist / Beta**  
   Core（调研、OA、立项、交底包）对齐表单逐步与回执；Assist（年费、权利要求）明确「草稿+回中台」；Beta（转化、监控、布局）禁止销售口径说闭环。深度不齐不可用「九个 Agent」糊弄。

5. **信任产品化：责任边界与人工签字包**  
   每条正式写库附「模型/工具版本 · 人工闸门记录 · 非法律意见戳 · 可回放 transcript」；递交类强制企业授权证据。垂类买家买的是可追责，不是更会聊天。

（刻意不做的：继续堆 UI 审计轮次、再造一套交底 8 步平行 UI、用「一键演示」当主卖点。）

---

## 附录 · 当前产品形态速写（核验印象）

- **双产品**：`saas` 作业中台 ↔ `agent` IP 办理（`App.tsx` + ProductSwitcher）。  
- **Agent IA**：Home（composer-first · 写回中台）/ 办理人 Catalog / 会话 / 运行说明（harness）。  
- **Catalog**：9 AgentDef（research…layout），含 tools、hitlGates、handoff、RACI、skills meta。  
- **会话**：Timeline + ConfirmBar（stepwise）+ Context 审计；dry vs formal。  
- **约束**：纯前端 mock；HARNESS「不做真 LLM」。

---

## TLDR（给上级/父代理）

**综合 6.5/10** · 设计合伙深 Demo 级 · 非生产。

**3 强**  
1. 中台↔Agent **共用命令面**（真写库 + actor 审计）  
2. **Harness 纪律**（HITL / dry-formal / 闸门→命令 / 消防通道）  
3. **IP 作业本体**（全生命周期办理人 + 案件写回，而非通用聊天）

**3 缺口**  
1. **无真 AI / 真检索** → 「Agent 平台」智能底盘空  
2. **长尾 specialty + 找活队列** 不够买点化  
3. **信任与外部系统** 缺失 → 客户不把递交权交给它  

*只读评估产物；路径：`/workspace/ip-harness/EVAL_IP_AGENT_PLATFORM.md`。*
