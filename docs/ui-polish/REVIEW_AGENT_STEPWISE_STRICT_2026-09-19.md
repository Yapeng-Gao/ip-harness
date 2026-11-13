# Agent 逐步严格复评 · S0–S9 · STRICT · 2026-09-19

| 项 | 值 |
|----|-----|
| **日期** | 2026-09-19（Asia/Shanghai · ~13:06 CST） |
| **HEAD** | `71fdc9cca4a7a6f100a2a6520ac8b8dca3481a25`（`dev`） |
| **对象** | Agent 壳 `@ip/agent` · **localhost:5175** |
| **计划** | `docs/ui-polish/AGENT_STEPWISE_WALK_PLAN_2026-09-19.md` |
| **对照** | `AGENT_STEPWISE_WALK_2026-09-19.md`（软评 Must=0 · 可过）→ **本轮作废「可过」心态**；Should 短复测 Go **不**橡胶章 |
| **Skills** | `apple-design` · `make-interfaces-feel-better` · `web-design-guidelines`（源 `command.md` **fetched 2026-09-19**） |
| **证据** | `docs/ui-polish/agent-stepwise-strict/`（**32 PNG** + per-step `_probe.json` / `_deep.json`） |
| **范围** | **只 docs/证据** · **未改产品代码** · **未 Cloud Agent** · **未 git commit/push** |
| **默认总评** | **Conditional** |

## 硬闸（保持）

| 闸 | 结果 | 证据 |
|----|------|------|
| 无 mid 深链 / `a[href*=5173]`（主面） | **Pass** | 全程 `origin=http://127.0.0.1:5175`；各步 `_probe.gates.midDeep=[]` |
| 无 BillingHold 全宽黄条 | **Pass** | `[data-billing-hold-banner]` 全步 null；非 BillingHold 的案件软黄见 **SS-M-S9-1** |
| Home 案件入口 = 1 | **Pass** | S0/S1 `home-case-bind` count=**1** |
| 不恢复 prototype 欠费诚实黄条 | **Pass** | 未见 BillingHold / 「不停审·仅提示」全宽条 |

## 方法

- 活口 Playwright Chromium · viewport 1440×900 · path-walk **S0→S9**（脚本 `_walk_strict_s0_s9.mjs` + S8/S9 修正补跑）
- 每步：页面逻辑 · 页面表现 · 体验 · UI；**Pass 仅当真扎实**；否则 Conditional/Fail
- 终端用户在 **layout / 密度 / 文案 / 主 CTA 层级 / 筛选 / HITL 呈现** 上不舒服 → **Must**（非 Should）
- ID：`SS-M-*`（strict Must）· `SS-S-*`（Should）

---

## S0 · 打开 `/agent` Home

| 维 | 级 | 结论 |
|----|----|------|
| **页面逻辑** | Pass | URL=`/agent`；竖导航 / 待确认 / compose / 单套 CaseBind；推荐 `<details>` 默认合上。 |
| **页面表现** | **Must** | 折叠「推荐」后 **6 枚 Core 快捷 pill 仍常驻 compose 下**；侧栏琥珀「待确认 · 3」视觉权重大于主 CTA「开始办理」(88×40)。首屏仍多故事。 |
| **体验** | **Must** | 用户以为「开工」是唯一下一步，实际被待确认 chip + Core 墙分流（apple Simplicity / Wayfinding）。 |
| **UI** | Conditional | 主 CTA press/高度尚可；辅文 11px 双行 meta（Core/Assist/Beta · general/domain）增加灰噪。 |

**硬闸**：Pass（case entry=1 · 无 mid · 无 BillingHold）

**推翻软评**：旧 SW-S0-1「推荐折叠」标 PASS **不够**——折叠未清 Core 墙。

**状态：Conditional**

### SS-M-S0-1 · Home Core 墙 + 待确认 chip 抢主 CTA
- **现象**：`home-recommend-fold` `open=false`，但 main 仍可见 6×「Core …」pill；侧栏「待确认 · 3」琥珀块比「开始办理」更抢眼。
- **为何糟**：首屏「下一步」不唯一；终端用户扫视成本高（EVAL D1 · apple Purpose/Simplicity）。
- **改法**：Core 快捷并入折叠或降为单行「常用」；待确认改弱 chip（描边/次级），主 CTA 独占实心 navy。
- **验收**：首屏实心主 CTA 仅「开始办理」；Core 默认不占 compose 下整行；待确认对比度低于主 CTA。
- **证据**：`S0/S0-home.png` · `S0/S0-cta-closeup.png` · `S0/_deep.json`（`visibleCore` 长度 6 · `chipBox` vs `sendBox`）

### SS-S-S0-1 · Home 双行 11px 产品分层 meta
- **现象**：「Core 主闭环 · Assist…」「默认通用单聊 · 项目模式…」叠在标题下。
- **改法**：收成一行或进「说明」popover。
- **证据**：`S0/_deep.json` metas

---

## S1 · 创建并绑定新案

| 维 | 级 | 结论 |
|----|----|------|
| **页面逻辑** | Pass | `case-create-bind` → 确认 → `case-bind-current` 显示样机案；入口仍=1。 |
| **页面表现** | Ok | 绑后控件收回为已绑态，无第二套 select。 |
| **体验** | Ok | 绑案不阻断「开始办理」。 |
| **UI** | Ok | 按钮高度 ≈40；文案可读。 |

**状态：Pass**（无新 Must；硬闸 Pass）

---

## S2 · 无案点「开始办理」

| 维 | 级 | 结论 |
|----|----|------|
| **页面逻辑** | Pass | 进 `/agent/sessions/:id`；无强制绑案 dialog。 |
| **页面表现** | **Must** | 中栏大段留白；顶条「切换到该 Agent」实心黑钮与底栏「启动」形成 **双主 CTA**；「Auto 已按 Core 匹配」行话条占带宽。 |
| **体验** | **Must** | 先聊后案路径上用户不知先「切换」还是「启动」；空轨迹无锚点（apple Achievement 弱）。 |
| **UI** | Conditional | CaseBind 软引导尚可；空态诚实不足。 |

**推翻软评**：旧 S2 Pass 只验「能进会话」——质感上终端不舒服。

**状态：Conditional**

### SS-M-S2-1 · 无案会话双主 CTA + 中栏空洞 + Auto/Core 行话
- **现象**：匹配条右侧实心「切换到该 Agent」+ 底卡实心「启动」；轨迹区几乎空；文案含「Auto 已按 Core 匹配」。
- **为何糟**：主行动分裂；空屏无「下一步」锚（D1/D2 · web-design Content & Copy · 忌行话）。
- **改法**：匹配结果改为弱提示 + 文案按钮；唯一实心 CTA=「启动」；空态给一句下一步；「Auto/Core」改人话（「已匹配：调研检索」）。
- **验收**：视口内实心主 CTA≤1；空态有锚；无 Auto/Core 暴露给终端用户。
- **证据**：`S2/S2-session.png`

---

## S3 · 会话轨迹 / 回复可见

| 维 | 级 | 结论 |
|----|----|------|
| **页面逻辑** | Pass | `sess-oa-1` timeline 可见；mock 步骤（解析 OA → 调用 → 产物 → 询问）齐。 |
| **页面表现** | Conditional | 轨迹高度 ≈558 尚可；工具调用重复「调用 · OA 争点分析」堆叠；右栏与底 Confirm 同权密度。 |
| **体验** | Conditional | 进入即见剧本 ✓；但工具卡噪音干扰「需要你确认」焦点。 |
| **UI** | Conditional | Confirm 已入 S4 专评；本步轨迹可读。 |

**状态：Conditional**

### SS-S-S3-1 · 工具调用重复行噪音
- **现象**：同屏多次「调用 · OA 争点分析」。
- **改法**：合并为可展开一组；默认折叠细节。
- **证据**：`S3/S3-timeline.png` · `S3/_deep.json`（toolCalls=3）

---

## S4 · HITL Confirm 可见可点

| 维 | 级 | 结论 |
|----|----|------|
| **页面逻辑** | Pass | `.confirm-hitl` 可见；未填元数据时「批准策略」disabled；业务闸正确。 |
| **页面表现** | **Must** | dock≈190（高度债已缓）；但补充折叠标「Full-check」· 文案混 Persona/HITL；闸门解释 **11px**；红字「请先选…」与「还有 3 条」/折叠补充空间脱节。 |
| **体验** | **Must** | 终端用户看到禁用主 CTA，却不清楚点「还有 3 条」还是展开补充才能解锁（HITL 呈现失败）。 |
| **UI** | **Must** | 主 CTA 高 40 ✓；次文 11px 与混中英破坏可读（make-interfaces typography · guidelines Content）。 |

**推翻软评**：旧 S4 Pass / FEEL Must 复测 Go **不**等于 HITL 呈现已舒适。

**状态：Conditional**

### SS-M-S4-1 · HITL 解锁路径不清 + 11px 混中英
- **现象**：红字「请先选争点类型并填策略要点」；旁链「还有 3 条」；底「补充项 · 陈述/争点 · Full-check」(11px)；展开后仍见「Persona」「须…后再 HITL 批准」「未过：…」(11px)。
- **为何糟**：关键闸是办理心脏；路径与字号/行话让企业用户慌（apple Responsibility · guidelines Forms/Content）。
- **改法**：① 禁用原因旁放一颗「去补全」实心/强链，直达争点+策略表；② 去掉 Full-check/Persona/HITL 对外文案；③ Confirm 内可见字 ≥12px；④ 「还有 N 条」改为「查看全部条件」。
- **验收**：不懂英文的用户能 1 次点击进入补全；Confirm 无英文 jargon；字号≥12。
- **证据**：`S4/S4-confirmbar.png` · `S4/S4-hitl.png` · `S4/S4-sheet.png` · `S4/_deep.json`（`mixedEn` · fs 11px 行）

### SS-S-S4-1 · 右栏上下文与 Confirm 同权
- **现象**：右栏案件/期限/产物/能力墙与琥珀 Confirm 并列抢注意力。
- **改法**：HITL 时右栏默认折叠次要块。
- **证据**：`S4/S4-rail.png` · `S4/S4-hitl.png`

---

## S5 · 会话顶栏绑案 · 先聊后案

| 维 | 级 | 结论 |
|----|----|------|
| **页面逻辑** | Pass | 无案顶栏软绑 → 创建绑定成功；绑后顶带可卸。 |
| **页面表现** | Conditional | 单套 `case-bind-controls`；但仍叠「切换到该 Agent」实心条（同 S2 债）。 |
| **体验** | Ok | 先聊后案可达；无死闸 dialog。 |
| **UI** | Ok | 绑案入口清晰。 |

**状态：Conditional**（继承 SS-M-S2-1 呈现；本步无新 Must ID）

### SS-S-S5-1 · 绑案成功后匹配条仍在
- **现象**：绑案后「Auto 已按 Core… / 切换到该 Agent」仍可占顶。
- **改法**：已开工或已绑后降级/收起匹配条。
- **证据**：`S5/S5-bound.png` · `S5/S5-unbound.png`

---

## S6 · 会话列表 + 待确认筛选

| 维 | 级 | 结论 |
|----|----|------|
| **页面逻辑** | Pass | segmented 写 `?filter=`；H1 随滤；主表行数=计数（待确认 3）。**旧 SW-S6-1/2 功能债已关，不重开。** |
| **页面表现** | **Must** | **双搜索**（侧栏「搜索」+ 主区「搜索标题/目标/案件」）+ **双新建**（「+ 新建会话」与顶「+ 新建任务会话」）。 |
| **体验** | **Must** | 筛选本身可用，但入口分叉让「我要新建 / 我要搜」犹豫。 |
| **UI** | Conditional | segmented 视觉尚可；侧栏标题截断。 |

**推翻软评**：旧 S6 Pass 只验 filter——忽略双入口密度。

**状态：Conditional**

### SS-M-S6-1 · 双搜索 + 双新建 CTA
- **现象**：`searchCount=2` · `newCount=2`（文案「新建会话」「新建任务会话」）。
- **为何糟**：同构动作两套标签（web-design Navigation · apple Familiarity）；终端用户以为是两个产品能力。
- **改法**：保留一处搜索（主表即可，侧栏可去）；新建统一文案与单一入口（顶栏或侧栏二选一）。
- **验收**：搜索框=1；新建实心/描边主入口=1；文案一致。
- **证据**：`S6/S6-needs.png` · `S6/_deep.json`

### SS-S-S6-1 · H1「待确认 · 通用历史」拗口
- **改法**：「待确认会话」或「通用历史 · 待确认」。
- **证据**：`S6/S6-needs.png`

---

## S7 · Catalog 选 Agent

| 维 | 级 | 结论 |
|----|----|------|
| **页面逻辑** | Pass | `/agent/agents`；九大 Agent；Beta 叠字已消。 |
| **页面表现** | **Must** | 每卡实心「启动」**h=32**；「稍后关联」贴主 CTA 下；卡脚「待确认 N」与侧栏待确认重复。 |
| **体验** | Conditional | 分层 Core/Assist/Beta 可读；卡内主次 CTA 粘连。 |
| **UI** | Conditional | 网格半径一致；Assist 卡更高。 |

**状态：Conditional**

### SS-M-S7-1 · Catalog 卡「启动」偏矮 + 次链贴主 CTA
- **现象**：启动按钮高 32；「稍后关联」紧贴其下；多卡并列时主行动墙。
- **为何糟**：主 CTA 热区/层级弱于 Home「开始办理」40（make-interfaces hit area · apple Response）。
- **改法**：启动 ≥36–40；「稍后关联」改菜单/次级文字远离；卡脚待确认改计数点或移入详情。
- **验收**：启动高度≥36；主次间距≥8px；卡面实心 CTA 扫视仍唯一。
- **证据**：`S7/S7-catalog.png` · `S7/_deep.json`（startH=32）

### SS-S-S7-1 · Assist 卡说明墙更高
- **证据**：`S7/S7-catalog-full.png`（监控预警卡 h≈234 vs Core 193）

---

## S8 · 项目模式 general · 无专利步骤

| 维 | 级 | 结论 |
|----|----|------|
| **页面逻辑** | Pass | 创建 general → `/agent/projects/:id`；`general-no-patent-steps`；`domain-step-bar=0`。 |
| **页面表现** | **Must** | 中栏大空；composer `top≈815` / vh900；「分派给研究/写作/审查」pill **h=27 · 11px**；右栏实心「打开总控分派」与中栏快捷 **三处重复**。 |
| **体验** | **Must** | 「下一步」同时出现在右栏按钮与中栏 pill，用户不知点哪。 |
| **UI** | Conditional | 无专利步骤 ✓；创建表仍见 DomainPack/HITL 行话（列表页）。 |

**状态：Conditional**

### SS-M-S8-1 · 总控三处「分派」入口 + composer 贴底 + 薄 pill
- **现象**：左席 bot · 中栏「分派给*」(27px) · 右「打开总控分派」实心；composerTop=815。
- **为何糟**：主行动不唯一；贴底输入带压迫（D1/D2 · 前 AFE-M-2 同类，本轮逐步复现仍在）。
- **改法**：右栏「下一步」改为指向中栏的说明（非第二实心 CTA）；pill ≥32/12px；上移 composer，压缩空洞。
- **验收**：实心主 CTA≤1；分派 pill 可读可点；composer 距底 ≥72px 内容带。
- **证据**：`S8/S8-general.png` · `S8/S8-orch.png` · `S8/_probe.json`

### SS-S-S8-1 · 创建页 / 总控露 mock · DomainPack 行话
- **证据**：`S8/S8-list.png` · `S8/S8-general.png`（「mock」「DomainPack」）

---

## S9 · domain/patent + 专家私聊

| 维 | 级 | 结论 |
|----|----|------|
| **页面逻辑** | Pass | patent 总控有 `domain-step-bar`；进 `/bots/expert-search`；专家头「检索专家」。 |
| **页面表现** | **Must** | 专家席顶 **全宽琥珀「写入前须绑定」条**（非 BillingHold，但仍是全宽黄）；底「推进一步」与右「打开总控分派」双黑 CTA；已在检索专家时右栏仍推「去检索专家」；工具区 `expert-search` / snake_case（`approve_strategy` 等）残留。 |
| **体验** | **Must** | 绑案黄条 + 双主 CTA + 错位「下一步」让专家席慌乱。 |
| **UI** | Conditional | 步骤条清晰；中栏仍空洞。 |

**硬闸注**：BillingHold=0 Pass；**不**建议恢复欠费黄条。案件软黄的全宽呈现另立 Must。

**状态：Conditional**

### SS-M-S9-1 · 专家席全宽琥珀绑案条 + 双黑 CTA + 错位下一步 + id 文案
- **现象**：顶全宽黄「写入案件前须绑定…」；底黑「推进一步」vs 右黑「打开总控分派」；右栏在 expert-search 仍售「去检索专家」；正文/工具可见 `expert-search`、`approve_strategy`、`commercial_patent_search`。
- **为何糟**：黄条抢 HITL/步骤焦点；双主 CTA；wayfinding 自相矛盾；英文 id 对终端不友好（apple Wayfinding · guidelines Content · 硬闸精神：少全宽黄）。
- **改法**：绑案改为顶栏内联弱提示（非全宽黄）；右栏「下一步」按当前 bot 改写；去掉对外 snake_case；专家席实心 CTA 只留「推进一步」。
- **验收**：无全宽琥珀；当前席下一步文案自洽；无 snake_case；实心主 CTA=1。
- **证据**：`S9/S9-expert.png` · `S9/S9-orchestrator.png` · `S9/S9-step-bar.png` · `S9/_probe.json`

### SS-S-S9-1 · 专家说明「布尔检索 → …」偏工程
- **改法**：改人话步骤名。
- **证据**：`S9/S9-expert.png`

---

## 总评

| 面 | 结论 |
|----|------|
| **硬闸** | **Pass**（mid / BillingHold / Home case=1 / 无欠费诚实黄条） |
| **逐步** | S1 **Pass** · S0/S2/S3/S4/S5/S6/S7/S8/S9 **Conditional** · **0 Fail**（无灾难性断路 → 非 No-Go） |
| **Overall** | **Conditional** |
| **相对软评** | 旧「S0–S9 Pass · Must=0」**作废**；功能可达 ≠ 终端舒适 |

### Must 汇总表（质感刀）

| ID | 步 | 刀点 | 证据 |
|----|----|------|------|
| **SS-M-S0-1** | S0 | Core 墙 + 待确认 chip 抢「开始办理」 | `S0/S0-home.png` |
| **SS-M-S2-1** | S2 | 双主 CTA（切换/启动）+ 空洞 + Auto/Core 行话 | `S2/S2-session.png` |
| **SS-M-S4-1** | S4 | HITL 解锁路径不清 · 11px · Full-check/Persona | `S4/S4-confirmbar.png` |
| **SS-M-S6-1** | S6 | 双搜索 + 双新建 | `S6/S6-needs.png` |
| **SS-M-S7-1** | S7 | Catalog「启动」32px + 次链贴主 CTA | `S7/S7-catalog.png` |
| **SS-M-S8-1** | S8 | 三处分派 · pill 27px · composer 贴底 | `S8/S8-general.png` |
| **SS-M-S9-1** | S9 | 全宽琥珀绑案 · 双黑 CTA · 错位下一步 · snake_case | `S9/S9-expert.png` |

**Must count = 7**

### Should 汇总

| ID | 步 | 一句 |
|----|----|------|
| SS-S-S0-1 | S0 | 双行 11px 分层 meta |
| SS-S-S3-1 | S3 | 工具调用重复行 |
| SS-S-S4-1 | S4 | 右栏与 Confirm 同权 |
| SS-S-S5-1 | S5 | 绑后匹配条仍在 |
| SS-S-S6-1 | S6 | H1 文案拗口 |
| SS-S-S7-1 | S7 | Assist 卡说明墙 |
| SS-S-S8-1 | S8 | mock/DomainPack 行话 |
| SS-S-S9-1 | S9 | 布尔检索工程说明 |

**Should count = 8**

### Skills 对照（摘要）

| Skill | 本轮落点 |
|-------|----------|
| **apple-design** | Purpose / Simplicity / Wayfinding：S0/S2/S8/S9 主行动不唯一；HITL Responsibility（S4） |
| **make-interfaces-feel-better** | hit area（S7 32 · S8 27）；typography 11px（S4）；密度空洞（S2/S8） |
| **web-design-guidelines**（2026-09-19 fetch） | Content & Copy 忌行话；Navigation 双入口（S6）；URL filter 已 Pass 不重开 |

### 证据计数

| 项 | 数 |
|----|----|
| PNG | **32** |
| 步目录 | S0–S9 |
| 主报告 | 本文件 |

### 禁止项自检

- [x] 只 docs/证据  
- [x] 未改 `apps/` 产品代码（工作区若有既有 dirty，本评未触）  
- [x] 无 Cloud Agent  
- [x] 未 git commit / push  

---

*UI评估助手 · STRICT 复开 · void 可过 · 2026-09-19 ~13:06 CST*
