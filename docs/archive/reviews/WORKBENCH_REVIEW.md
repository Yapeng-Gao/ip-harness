# 业务工作台 · 只读评审（SaaS Workbench only）

日期：2026-09-11。范围：仅 `/workspace/ip-harness` **业务工作台**（WorkbenchHome、FlowChrome、七条 Flow、FormBlocks / VersionPanel / ClaimDiffView）。  
不含：作业中台 Dashboard / Pipeline / CaseDetail、Agent 产品、真实专利 API / LLM / Docket 引擎（mock 可接受）。  
对照：此前 `SAAS_PAGE_REVIEW.md` 写于 anti-slop 前（当时 FlowChrome 仍 indigo / soft-card）；**本文件按当前源码复审**，承认近期去 slop 已落地。

评分轴：**页面逻辑 / 布局 / UI / UX**（0–10）+ **AI 模板感**（高 / 中 / 低）。

---

## 总评打分（逻辑 / 布局 / UI / UX / 模板感）

| 维度 | 均分 | 一句话 |
|------|------|--------|
| 页面逻辑 | **7.9** | Research / Intake / Draft / Prosecution 闸门与交接扎实；Maintain / Monetize 的 `checkedRequired` 常绿造假；Draft·Prosecution Toast「下一步」错向「去立项」。 |
| 布局 | **7.6** | 七流统一 `FlowHeader → CasePicker → Stepper? → SplitDraft`；Maintain / Watch 无 Stepper；Home 在「待办」页签仍露出阶段网格。 |
| UI | **7.9** | **主路径已脱 indigo / soft-card**：`btnPrimary=cta-work`、`panelCls=flat-card`、Stepper 近黑。残余 violet 芯片与 VersionPanel `shadow-sm`。 |
| UX | **7.4** | Home 主 CTA→首条待办好；Toast「下一步」习惯已立，但部分文案/目标错；Watch 告警区五钮墙；Intake 报价双轨 CTA。 |
| AI 模板感 | **低–中** | 去 slop 后不再是 indigo 糖果墙；仍有 Zap「驱动过闸」、英文化 Acknowledge/Escalate、里程碑 pending 英文枚举、阶段入口完美网格。 |

**工作台综合 ≈ 7.7**（相对 `SAAS_PAGE_REVIEW` 中「七流 ≈7.0 / FlowChrome 6.5」明显上抬；相对 Agent R4 ≈8.5 仍差约 **0.8**）。

**诚实结论：近期 SaaS anti-slop 在工作台主壳已生效（cta-work / flat-card / slate Stepper / 零 indigo·soft-card 命中）。剩下不是「换皮」，而是闸门诚实度、下一步方向、七流同构（VersionPanel / Stepper / FormBlocks）与 Watch CTA 墙。暂无「整站仍紫」级 P0。**

### 量化信号（仅 workbench 路径）

| 信号 | 现状 |
|------|------|
| `indigo-` | **0** |
| `soft-card` | **0**（`panelCls` / `WbSection` 已 `flat-card`） |
| `cta-work` | FlowChrome `btnPrimary`、VersionPanel、PageHeader（Home）在用 |
| `flat-card` | FlowChrome `panelCls`、FormBlocks、WorkbenchHome 阶段卡 |
| violet 残余 | **0**（Agent 协助 / 委托 / 业务回写已改 slate） |
| VersionPanel 材质 | **`flat-card`**（P2 已落地） |

---

## 分入口 / 分流程表

| 页 / 组件 | 逻辑 | 布局 | UI | UX | 均分 | 模板感 | 首要问题 |
|-----------|------|------|----|----|------|--------|----------|
| WorkbenchHome | 8.0 | 7.5 | 8.0 | 8.2 | **7.9** | 低中 | 待办页签仍叠「阶段入口」网格；企业/代理 stage 过滤列表几乎同构（形同未过滤）。 |
| FlowChrome | 8.5 | 8.0 | 8.2 | 8.0 | **8.2** | 低 | 共享壳已收口；Agent 协助仍 violet；`btnPrimary` 仍 `rounded-xl`+hover 抬影（略软于 Agent 的 `rounded-md`）。 |
| ResearchFlow | 8.5 | 8.0 | 8.0 | 8.0 | **8.1** | 中低 | 命中→结论绑定 + 空命中阻断最好；Zap「驱动过闸」偏演示腔。 |
| IntakeFlow | 8.2 | 7.8 | 8.0 | 7.5 | **7.9** | 低中 | Go 闸门（自助预算 / 委托报价）清楚；`extra`「发送/确认报价」与 HandoffActionBar 主钮双轨。 |
| DraftFlow | 8.5 | 8.0 | 8.0 | 7.2 | **7.9** | 低 | 权项校验 + 5/5 清单阻断优秀；成功 Toast「去立项」**方向错误**（应去审查/期限）。 |
| ProsecutionFlow | 8.3 | 8.0 | 7.8 | 7.2 | **7.8** | 低中 | Docket 回写横幅好；ClaimDiff 实用；Toast 同样误推「去立项」；violet「业务回写」。 |
| MaintainFlow | 6.5 | 7.0 | 7.5 | 7.0 | **7.0** | 中 | 无 Stepper；seed 写死 `c6`；`checkedRequired={['schedule','budget']}` **常绿**；未用 FormBlocks。 |
| MonetizeFlow | 7.0 | 7.5 | 7.5 | 7.2 | **7.3** | 中 | 有 Stepper；`checkedRequired` 常绿；无 VersionPanel；里程碑状态英文枚举。 |
| WatchFlow | 7.2 | 7.0 | 7.5 | 6.5 | **7.1** | 中 | 无 Stepper / VersionPanel；告警区确认/升级/关闭/调研/维权 **五主钮**；`alert`/`risk` 清单常绿；按钮英文夹杂。 |
| FormBlocks | — | 8.0 | 8.5 | 8.0 | **8.2** | 低 | `flat-card` 已对齐；注释仍写「soft surface」（债）。 |
| VersionPanel | 7.5 | 7.5 | 7.0 | 7.0 | **7.3** | 低中 | 批注退回路径可用；材质未跟 `flat-card`；与 HandoffActionBar 退回区能力部分重叠。 |
| ClaimDiffView | 8.5 | 8.0 | 8.0 | 8.0 | **8.1** | 低 | 仅 Prosecution 使用；克制、可读，无装饰噪音。 |

---

## P0 / P1 / P2 剩余项

### P0

**暂无 P0（视觉断崖 / 阻断主办理已清）。**  
indigo / soft-card 墙与主 CTA 糖果色在工作台范围内已不存在；闸门造假与错向 Toast 属高优先但未到「演示即穿帮」的 P0（提交仍有 `validateBefore` 兜底）。

### P1 — 闸门诚实度 / 下一步习惯 / CTA 墙

1. **Toast「下一步」按阶段纠偏**  
   - `DraftFlow` / `ProsecutionFlow`：成功后勿推「去立项」；Draft → 去审查 / 去期限 / 回案件；Prosecution → 去期限 / 回案件 /（可选）去维持。  
   - 可抽共享 `nextActionsForStage(stage)`，避免七处复制粘贴。

2. **`checkedRequired` 禁止常绿**  
   - `MaintainFlow`：按年费日程是否存在、官费/服务费是否确认动态传入 `schedule` / `budget`。  
   - `MonetizeFlow`：按 `counterpart` / `royalty`（或条款字段）动态传入 `party` / `terms`。  
   - `WatchFlow`：`alert` / `risk` 应对应当前告警状态与级别，勿写死。

3. **WatchFlow 告警 CTA 收成 1 主 + 次要**  
   - 主：按角色「确认」或「升级」；「生成调研案 / 升级维权线索 / 关闭」降为文字链或「更多」。  
   - 按钮文案去英文夹杂（Acknowledge / Escalate / Dismiss）。

4. **Intake 报价双轨收口**  
   - `extra`「发送报价 / 确认报价」与 `HandoffActionBar` 提交/批准语义重叠 → 只留一条主路径（推荐只走交接条，extra 改为说明或去掉）。

5. **七流同构补齐**  
   - Maintain / Watch 补 Stepper（或明确「单页无步进」并在 Home/文案一致）。  
   - Monetize / Watch 接 VersionPanel（与交接产物一致）。  
   - Maintain / Monetize / Watch 优先改用 `WbSection` / `WbField`。

### P2 — 打磨与债

6. ~~**VersionPanel `panelCls` → `flat-card`**~~（已落地）。  
7. ~~**violet 芯片改 slate / 语义色**~~（已落地）。  
8. ~~**WorkbenchHome** 待办网格 / 角色 stage 过滤~~（已落地）。  
9. **MaintainFlow**：按 `caseId` 读 `maintainSeed[caseId]`（勿写死 `c6`）；`accent-emerald` 复选框与全局 `accent-slate-700` 对齐。  
10. ~~**ResearchFlow** Zap「驱动过闸」~~（已落地）；Monetize 里程碑中文已在 P1。  
11. **FormBlocks** 注释「soft surface」改为 flat；`btnPrimary` 圆角与 PageHeader（`rounded-md`）统一。  
12. **HandoffActionBar vs VersionPanel** 企业退回：两处都能批注退回，择一主入口，另一处只读历史。

---

## Top 5（按性价比）

1. **纠偏 Draft / Prosecution Toast 下一步**（错向「去立项」最伤习惯路径，改动面小）。  
2. **Maintain / Monetize / Watch 的 `checkedRequired` 改为真实条件**（清单 UI 否则是假反馈）。  
3. **Watch 告警五钮墙 → 1 主 + 次要**，并中文化。  
4. **七流同构：Maintain/Watch Stepper + Monetize/Watch VersionPanel + FormBlocks 覆盖**。  
5. **VersionPanel / violet 芯片跟 flat-card · slate 令牌**，收尽 anti-slop 尾巴。

---

## 分维速记（供复审）

### 页面逻辑（闸门 / 交接 / 下一步）

- **强**：Research（空命中阻断 + 批准后 `toIntake`）；Intake（Go/No-Go + 自助/委托报价条件）；Draft（权项实时校验 + filing 5/5 `blockPrimary`）；Prosecution（争点策略校验 + 递交→Docket 横幅）；FlowChrome `HandoffActionBar`（角色/模式/发票停权/必填清单）。  
- **弱**：Maintain / Monetize / Watch 清单常绿；Draft·Prosecution 成功下一步错向；Watch 生成案/维权与交接条并行，主路径不清；Maintain 无阶段推进叙事。

### 布局

- 共享骨架清晰：左表单 / 右实时文书（`SplitDraft` sticky）。  
- 不一致：5 流有 Stepper，Maintain / Watch 无；Home 双段（队列+网格）在默认页签同时出现。

### UI（cta-work / flat vs 残余）

- **已过关**：主 CTA 近黑、面板发丝边、Stepper/chip/focus 走 slate；工作台路径 **无 indigo、无 soft-card**。  
- **尾巴**：violet 三处、VersionPanel 阴影卡、主钮 `rounded-xl`+抬影、Zap 演示徽章。

### UX 习惯

- Home「办理首条待办」+ Toast「下一步」是正确习惯；错向与 CTA 墙会破坏信任。  
- Agent 协助仅出现在调研/撰写/答复（合理），但视觉仍「产品彩糖」。

### AI 模板感

- 去 slop 后整体 **低–中**：不再像 ChatGPT 紫卡墙。  
- 残留味：完美四列阶段卡、英文状态机、Zap 过闸徽章、多枚同等实心主钮并排。

---

## 与 `SAAS_PAGE_REVIEW.md` 的差额（避免双重标准）

| 项 | SAAS_PAGE_REVIEW（当时） | 本复审（当前源码） |
|----|--------------------------|-------------------|
| FlowChrome 主 CTA | `bg-indigo-600` | **`cta-work`（#0f172a）** |
| `panelCls` | soft-card | **`flat-card`** |
| Stepper 激活 | indigo | **slate-900** |
| workbench indigo 计数 | 计入全仓 ~371 | **本范围 0** |
| 七流均分印象 | ~7.0 / 模板中 | **~7.6 / 模板低–中** |

请以本文件为准评工作台；中台其余页（Dashboard 等）仍以 `SAAS_PAGE_REVIEW.md` 为准，二者不要混算。

---

## 已落地（P1 · 2026-09-11）

对照上文 P1 五项，源码已落地（`npm run build` 通过 · Vite `0.0.0.0:5173` · 中文 · cta-work/slate · Command/handoff 未改语义 · mock OK）：

1. **Toast「下一步」按阶段纠偏** — 新增共享 `nextActionsForStage(stage, caseId)`（`FlowChrome`）。Draft → 去审查/去期限/回案件；Prosecution → 去期限/去维持/回案件；**不再**从撰写/OA 误推「去立项」。Research/Intake/Maintain/Monetize/Watch 亦统一走该 helper。
2. **`checkedRequired` 禁止常绿** — Maintain：日程有到期日+金额才亮 `schedule`；勾选「已确认官费与代缴服务费」才亮 `budget`。Monetize：`counterpart`/`royalty` 动态驱动 `party`/`terms`。Watch：告警状态/意见、风险级别、代理意见分别驱动 `alert`/`risk`/`opinion`。Intake 亦按报价/技术方案点亮清单。
3. **WatchFlow 告警 CTA** — 五主钮收成 **1 主**（代理「确认」/ 企业「升级」）+ **「更多」** 溢出（确认/升级/关闭/生成调研案/升级维权线索）；文案去英文夹杂。
4. **Intake 报价双轨收口** — 去掉 extra「发送报价/确认报价」实心钮；交接条为唯一确认路径；文案标明工作台交接为报价真相源、费用中台仅开票/付款。
5. **七流同构补齐** — Maintain / Watch 补 `Stepper`；Monetize / Watch 接 `VersionPanel`；Maintain / Monetize / Watch 改用 `WbSection` / `WbField`。Maintain 按 `caseId` 读 seed；年费复选框 `accent-slate-700`；Monetize 里程碑状态中文化（待办/进行中/完成/逾期）。

### 已落地 P2（2026-09-11）

1. **VersionPanel** → `flat-card p-5`，去掉独立 `shadow-sm` 白卡。
2. **violet 芯片改 slate**：FlowChrome「用 Agent 协助」、Home「委托」徽章、Prosecution「业务回写」pill。
3. **WorkbenchHome**：`tab=queue` 不再叠阶段入口网格（仅「阶段入口」页签）；企业/代理 queue stage 列表收窄且互异（企业无检索主队列；代理无转化/监控决策）。
4. **ResearchFlow**：Zap「驱动过闸」改为平静文案「提交前须绑定命中」/「已绑定命中」。


