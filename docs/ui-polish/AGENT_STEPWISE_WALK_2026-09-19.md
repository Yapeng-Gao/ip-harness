# Agent 逐步走查 · 2026-09-19（S0–S9 完整）

| 项 | 值 |
|----|-----|
| **日期** | 2026-09-19（Asia/Shanghai · ~12:02 CST） |
| **对象** | Agent 壳 `@ip/agent` · **localhost:5175** |
| **计划** | `docs/ui-polish/AGENT_STEPWISE_WALK_PLAN_2026-09-19.md` |
| **范围** | **S0–S9**（本轮完成 S3–S9；S0–S2 沿用既有证据） |
| **禁止** | 未改 `apps/` 产品代码 |
| **Command** | `npx playwright test --project=agent-stepwise`（或 `./node_modules/.bin/playwright`） |
| **Browser** | Chromium headless · `workers: 1` |
| **依赖口** | iam:5177（enterWorkspace · 知产 Agent → 德恒）· agent:5175 · 均已起 |
| **证据目录** | `docs/ui-polish/agent-stepwise-e2e/` |
| **e2e** | `e2e/agent-stepwise-s0-s2.spec.ts` · `e2e/agent-stepwise-s3-s5.spec.ts` · `e2e/agent-stepwise-s6-s9.spec.ts` · project `agent-stepwise` |

## 端口（跑前 curl）

| 服务 | URL | curl |
|------|-----|------|
| agent | `http://localhost:5175/` | **200** |
| agent home | `http://localhost:5175/agent` | **200** |
| iam（进仓） | `http://localhost:5177/login` | **200** |

## 硬闸汇总

| 闸 | 结果 | 证据 |
|----|------|------|
| 无 mid 深链 | **Pass** | S0–S9 全程 `origin=http://localhost:5175`，无 `5173` |
| 无 BillingHold 全宽黄条 | **Pass** | `[data-billing-hold-banner]` count=0（Home / 会话 / 列表 / Catalog / 项目） |
| Home 案件入口=1 | **Pass** | `[data-testid="home-case-bind"]` count=1（S0/S1） |

---

## S0 · 打开 /agent Home

| 维 | 级 | 结论 |
|----|----|------|
| **业务逻辑** | **Pass** | Home 为开工入口：compose + 单套 CaseBind + 竖导航待确认，符合 agent-entry-modes。 |
| **页面逻辑** | **Pass** | URL=`/agent`；竖导航 / 待确认 / compose / CaseBind 地标齐全；无 mid 跳转。 |
| **业务表现** | Ok | 主 CTA「开始办理」单一；案件入口唯一。 |
| **页面表现** | Ok | 竖导航 `agent-side-nav` + compact 待确认区 + 中央 compose。 |
| **UX** | Ok | 无全宽欠费黄条抢注意力；待确认以 chip 呈现。 |
| **UI** | Ok | 地标可见、bbox 可取。 |

**证据**：`S0-home.png` · `S0-meta.json`  
**状态：Pass**

---

## S1 ·（可选）创建并绑定新案

| 维 | 级 | 结论 |
|----|----|------|
| **业务逻辑** | **Pass** | 「创建并绑定新案」→ mock-case 写入本地种子；绑定后仍可开工。 |
| **页面逻辑** | **Pass** | `case-create-bind` → 标题 → `case-create-confirm` → `case-bind-current` 显示样机案。 |
| **业务表现** | Ok | caseId/标签写入可见（样机徽标）；入口仍=1。 |
| **页面表现** | Ok | soft CaseBind 展开创建表单后收回为「已绑案件」。 |
| **UX** | Ok | 绑案不阻断「开始办理」。 |
| **UI** | Ok | 按钮/输入 testid 清晰，无需 Skip。 |

**证据**：`S1-case-bound.png` · `S1-meta.json`  
**状态：Pass**

---

## S2 · 无案点「开始办理」

| 维 | 级 | 结论 |
|----|----|------|
| **业务逻辑** | **Pass** | 无强制案即可开工；进会话后无强制绑案弹死。 |
| **页面逻辑** | **Pass** | 点击 `home-send` → URL `/agent/sessions/:id`；timeline 可见。 |
| **业务表现** | Ok | 符合 agent-case-binding「先聊后案」。 |
| **页面表现** | Ok | 会话主区 `session-timeline-scroller` 可见。 |
| **UX** | Ok | 无 dialog 强制绑案。 |
| **UI** | Ok | 无全宽 BillingHold。 |

**证据**：`S2-session.png` · `S2-meta.json`  
**状态：Pass**

---

## S3 · 会话轨迹/回复可见

| 维 | 级 | 结论 |
|----|----|------|
| **业务逻辑** | **Pass** | 种子 `sess-oa-1` 轨迹含 mock 剧本步骤（解析 OA → 争点 → 答复草稿 → 需确认）。 |
| **页面逻辑** | **Pass** | URL=`/agent/sessions/sess-oa-1`；`session-timeline-scroller` 可见且有内容。 |
| **业务表现** | Ok | timeline 正文 length≈303，含「解析 OA / 争点 / 答复 / 确认」。 |
| **页面表现** | Ok | 主列滚动区清晰呈现气泡步骤。 |
| **UX** | Ok | 进入即见轨迹，无需额外操作。 |
| **UI** | Ok | scroller bbox 可取。 |

**关键断言**

- `session-timeline-scroller` 可见
- 含 mock 步骤文案（解析 OA / 争点清单 / 答复书草稿就绪 / 需要你确认）
- 无 mid · 无 BillingHold
- console error：无

**证据**：`S3-timeline.png` · `S3-meta.json`  
**状态：Pass**

---

## S4 · HITL Confirm 可见可点

| 维 | 级 | 结论 |
|----|----|------|
| **业务逻辑** | **Pass** | ConfirmBar 业务闸正确：未填 OA 元数据时 CTA disabled；补齐争点+策略要点后「批准策略」enabled。 |
| **页面逻辑** | **Pass** | `.confirm-hitl` 可见；专科 CTA 作用域内断言（R5，禁止全局 getByText）。 |
| **业务表现** | Ok | 对标 L1-02 sess-oa-1；可恢复 seed，未点批准以免污染全局。 |
| **页面表现** | Ok | 左琥珀轨 ConfirmBar + 补充项 sheet。 |
| **UX** | Ok | 阻塞文案「请先选争点类型并填策略要点」→ 填后解锁，闸门可理解。 |
| **UI** | Ok | CTA 可见且 enabled。 |

**关键断言**

- `.confirm-hitl` 可见
- `bar.getByRole('button', { name: /批准策略/ })` 可见 → 填元数据后 **enabled**
- R5：CTA 仅在 `.confirm-hitl` 内匹配
- 无 BillingHold

**证据**：`S4-confirm.png` · `S4-meta.json`  
**状态：Pass**

---

## S5 · 会话顶栏绑案 · 先聊后案

| 维 | 级 | 结论 |
|----|----|------|
| **业务逻辑** | **Pass** | 无案开工 → 顶栏软引导绑案 → 创建并绑定成功；符合 agent-case-binding。 |
| **页面逻辑** | **Pass** | `session-case-bind-top` + `case-bind-controls`；绑案后 `caseBindGuide` 关闭顶栏可收起。 |
| **业务表现** | Ok | 绑定写入样机案标题可见（`case-bind-current`）。 |
| **页面表现** | Ok | 软引导「开始办理后可在此绑定」；无强制 dialog。 |
| **UX** | Ok | 先聊后案：顶栏绑案非死闸；绑后顶栏收起不挡会话。 |
| **UI** | Ok | 创建入口清晰，未 Skip。 |

**关键断言**

- 开工前 Home `case-bind-hint`
- 进 `/agent/sessions/:id` 后顶栏可见
- 顶栏 `case-create-bind` → 确认 → 绑定成功
- 无强制绑案弹死 · 无 BillingHold

**证据**：`S5-case-bind-top.png` · `S5-meta.json`（中间失败截图 `S5-FAIL.png` 保留作对照：曾误断言绑后顶栏仍挂 `case-bind-current`）  
**状态：Pass**

---

## S6 · 会话列表 + 待确认筛选

| 维 | 级 | 结论 |
|----|----|------|
| **业务逻辑** | **Pass** | segmented 全部 / 待确认 / 进行中可切换；`aria-pressed` 正确。 |
| **页面逻辑** | **Pass** | URL=`/agent/sessions`；`role=group`「会话状态筛选」可见。 |
| **业务表现** | Ok | 点「待确认」过滤态成立；可切回「全部」。 |
| **页面表现** | Ok | 侧栏 segmented + 计数 ·N。 |
| **UX** | Ok | 筛选一键可达，无需深链。 |
| **UI** | Ok | bbox 可取。 |

**证据**：`S6-sessions-filter.png` · `S6-meta.json`  
**状态：Pass**

---

## S7 · Catalog 选 Agent

| 维 | 级 | 结论 |
|----|----|------|
| **业务逻辑** | **Pass** | `/agent/agents` 九大 Agent heading 齐全（对标 L1-06）。 |
| **页面逻辑** | **Pass** | URL=`/agent/agents`；无 mid。 |
| **业务表现** | Ok | 清单烟：调研检索…布局 9 heading。 |
| **页面表现** | Ok | Catalog 卡网格可见。 |
| **UX** | Ok | 从侧栏「Agent」可达。 |
| **UI** | Ok | heading 清晰。 |

**证据**：`S7-catalog.png` · `S7-meta.json`  
**状态：Pass**

---

## S8 · 项目模式 general · 无专利步骤

| 维 | 级 | 结论 |
|----|----|------|
| **业务逻辑** | **Pass** | 新建 general 项目进总控；**无**专利步骤条 / FTO / 权利要求 HITL。 |
| **页面逻辑** | **Pass** | `/agent/projects` → 选通用 → 创建 → `/agent/projects/:id`。 |
| **业务表现** | Ok | `general-no-patent-steps` 可见；`domain-step-bar` count=0。 |
| **页面表现** | Ok | `project-chat-general-orchestrator` 可见。 |
| **UX** | Ok | 创建表单说明「通用项目无专利步骤条」。 |
| **UI** | Ok | 地标 testid 清晰。 |

**证据**：`S8-general-project.png` · `S8-meta.json`  
**状态：Pass**

---

## S9 · domain/patent + 专家私聊

| 维 | 级 | 结论 |
|----|----|------|
| **业务逻辑** | **Pass** | 领域包 patent 总控有步骤条；专家私聊分剧本（检索专家 ≠ 总控编排文案）。 |
| **页面逻辑** | **Pass** | 创建 domain → 总控 `project-chat-orchestrator` + `domain-step-bar` → `/bots/expert-search`。 |
| **业务表现** | Ok | 总控含分派/编排 mock；专家头栏「检索专家 · 现有技术检索」。 |
| **页面表现** | Ok | 侧栏 bot 链 + 专家 pane。 |
| **UX** | Ok | 总控/专家席切换清晰。 |
| **UI** | Ok | domain-step-bar / project-chat-* testid 可用。 |

**证据**：`S9-patent-expert.png` · `S9-meta.json`  
**状态：Pass**

---

## 用例结果一览

| ID | 用户动作 | Pass/Fail/Skip | 一句 |
|----|----------|----------------|------|
| **S0** | 打开 /agent Home | **Pass** | 竖导航/待确认/compose/单套 CaseBind 齐；硬闸全过 |
| **S1** | 创建并绑定新案 | **Pass** | mock 案绑定成功且仍可开工；入口清晰未 Skip |
| **S2** | 无案点「开始办理」 | **Pass** | 进 `/agent/sessions/:id`，无强制绑案弹死 |
| **S3** | 会话轨迹/回复可见 | **Pass** | sess-oa-1 timeline 含 mock 剧本步骤 |
| **S4** | HITL Confirm 可见可点 | **Pass** | ConfirmBar 内「批准策略」补齐元数据后 enabled（R5） |
| **S5** | 会话顶栏绑案 | **Pass** | 先聊后案：顶栏软绑成功，绑后顶栏可收起 |
| **S6** | 会话列表 + 待确认筛选 | **Pass** | segmented 全部/待确认/进行中可切换 |
| **S7** | Catalog 选 Agent | **Pass** | /agent/agents 9 heading 可见 |
| **S8** | 项目模式 general | **Pass** | general 总控无专利步骤条 |
| **S9** | domain/patent + 专家私聊 | **Pass** | 总控有步骤条；专家私聊分剧本 |

**合计：10 passed · 0 failed · 0 skipped**

本轮 S3–S5 墙钟 ~6.6s；S6–S9 ~8.2s（不含 S0–S2 复跑）。

## Must 汇总

本轮 S0–S9 **无 Must 级失败项**。

## 产物清单

- `e2e/agent-stepwise-s0-s2.spec.ts`
- `e2e/agent-stepwise-s3-s5.spec.ts`
- `e2e/agent-stepwise-s6-s9.spec.ts`
- `playwright.config.ts`（project `agent-stepwise` 匹配 S0–S9）
- `docs/ui-polish/agent-stepwise-e2e/S0`…`S9` 截图 + meta.json
- 本报告 `docs/ui-polish/AGENT_STEPWISE_WALK_2026-09-19.md`

---

## 附 · UI 评估侧取证（`agent-stepwise-ui/` · S0–S9）

| 项 | 值 |
|----|-----|
| **评审** | UI评估助手 · 三 skill（apple-design · make-interfaces-feel-better · web-design-guidelines 2026-09-19） |
| **证据** | `docs/ui-polish/agent-stepwise-ui/{S0..S9}/` + `_walk_s0_s2_report.json` · `_walk_s3_s5_report.json` · `_walk_s6_s9_report.json` |
| **对照** | 上表 e2e 走查；本附为页面表现 / UX / UI **深看**，不改 e2e Pass 结论 |
| **硬闸抽核** | mid `:5173` CTA=0 · BillingHold 全宽=0 · Home `home-case-bind`=1（S0–S5）· S6–S9 同闸 Pass |
| **活口** | Playwright Chromium · `127.0.0.1:5175` · 2026-09-19 ~12:01 CST |

### UI 步结论（S0–S9）

| ID | UI 总评 | Must | Should |
|----|---------|------|--------|
| S0 | **Pass** | — | **SW-S0-1** Home 推荐卡/辅文密度仍偏挤 |
| S1 | **Pass** | — | — |
| S2 | **Pass** | — | — |
| S3 | **Pass** | — | — |
| S4 | **Pass** | — | — |
| S5 | **Pass** | — | **SW-S5-1** 会话顶栏软绑与主区并存感 |
| S6 | **Pass** | — | **SW-S6-1** 筛选未写 URL → 主表不滤；**SW-S6-2** 标题不随筛选变 |
| S7 | **Pass** | — | **SW-S7-1** H2「Beta Beta·…」文案重复 |
| S8 | **Pass** | — | — |
| S9 | **Pass** | — | — |

---

### S6 · UI 深看 · 会话列表 + 待确认筛选 segmented

| 维 | 级 | 结论 |
|----|----|------|
| **业务逻辑** | **Pass** | 全部 / 待确认 / 进行中可切；`aria-pressed` 单选正确；计数 tabular-nums（全部·4 / 待确认·3 / 进行中·0）。 |
| **页面逻辑** | **Pass** | URL=`/agent/sessions`；`role=group`「会话状态筛选」；侧栏导航在。硬闸：无 mid · 无 BillingHold。 |
| **业务表现** | Ok | 深链 `?filter=needs_human` 时主表正确滤为 3 行待确认（对照 `S6-url-filter-needs.png`）。 |
| **页面表现** | **Should** | 点 segmented **不写** query → 主表仍示全部（含「失败」）；侧栏列表滤空/滤窄，双面分歧。主标题恒「全部会话」。 |
| **UX** | **Should** | 用户以为点「待确认」即滤主表，实际仅侧栏 + pressed 态；与 Home chip 深链行为不一致（web-design-guidelines · URL reflects state）。 |
| **UI** | Ok | segmented 高 32 / 圆角 8 / 选中白底抬升；间距 ~2px；无 icon-only 缺 label。 |

**硬闸**：midDeep=[] · billingBanner=null · amberFullWidth=[] · origin=:5175

**证据**：`agent-stepwise-ui/S6/S6-sessions-all.png` · `S6-segmented-closeup.png` · `S6-sessions-needs.png` · `S6-sessions-running.png` · `S6-url-filter-needs.png` · `_probe.json`

**状态：Pass**（无 Must；见 SW-S6-*）

---

### S7 · UI 深看 · Catalog `/agent/agents`

| 维 | 级 | 结论 |
|----|----|------|
| **业务逻辑** | **Pass** | 九大 Agent heading 齐（调研检索…布局）；Core / Assist / Beta 分层可读。 |
| **页面逻辑** | **Pass** | URL=`/agent/agents`；无 mid；无 BillingHold。 |
| **业务表现** | Ok | 卡「启动」主 CTA +「稍后关联」；待确认橙 pill 可见。 |
| **页面表现** | Ok | 卡网格 radius 16 一致；宽差≈34px 可接受。 |
| **UX** | Ok | 层筛选 segmented（全部/Core/Assist/Beta）+ 搜索；从侧栏「Agent」可达。 |
| **UI** | **Should** | H2 文案 **「Beta Beta·非采购闭环」** 叠字（应去一重 Beta）。 |

**证据**：`agent-stepwise-ui/S7/S7-catalog.png` · `S7-catalog-viewport.png` · `S7-catalog-hover.png` · `_probe.json`

**状态：Pass**

---

### S8 · UI 深看 · 项目模式 general（无专利步骤）

| 维 | 级 | 结论 |
|----|----|------|
| **业务逻辑** | **Pass** | 选「通用」创建 → 总控；`general-no-patent-steps` 可见；`domain-step-bar`=0；无 FTO/权利要求 HITL。 |
| **页面逻辑** | **Pass** | `/agent/projects` → `/agent/projects/:id`（非 `/bots/`）；硬闸过。 |
| **业务表现** | Ok | 侧栏 bot：总控/研究/写作/审查；文案「通用项目 · 无专利步骤条」。 |
| **页面表现** | Ok | 三栏（项目树 · 总控席 · 时间线）；护栏脚注诚实。 |
| **UX** | Ok | 创建表单说明「通用（无专利步骤）」；开工路径清晰。 |
| **UI** | Ok | 地标 testid 清晰；无全宽欠费黄条。 |

**证据**：`agent-stepwise-ui/S8/S8-projects-list.png` · `S8-create-general-form.png` · `S8-general-project.png` · `S8-no-patent-badge.png` · `S8-orch-closeup.png` · `_probe.json`

**状态：Pass**

---

### S9 · UI 深看 · domain/patent + 专家私聊

| 维 | 级 | 结论 |
|----|----|------|
| **业务逻辑** | **Pass** | 领域包 patent 总控有 `domain-step-bar`（1收目标…4汇总）；专家私聊 `expert-search` 分剧本（检索式→命中→工作篮→HITL）。 |
| **页面逻辑** | **Pass** | 创建 domain → 总控 → `/bots/expert-search`；专家 pane ≠ 总控编排文案。 |
| **业务表现** | Ok | 头栏「检索专家 · 现有技术检索」；侧栏 总控席/检索/撰稿/FTO。 |
| **页面表现** | Ok | 专家步骤条独立；工具卡可见；未绑案软黄条（非 BillingHold 全宽闸）。 |
| **UX** | Ok | 总控/专家席切换清晰；快捷动作「跑检索式 / 推进一步」。 |
| **UI** | Ok | domain-step-bar / project-chat-* 地标可用。 |

**证据**：`agent-stepwise-ui/S9/S9-create-patent-form.png` · `S9-patent-orchestrator.png` · `S9-domain-step-bar.png` · `S9-patent-expert.png` · `S9-expert-chat-closeup.png` · `S9-bot-sidebar.png` · `_probe.json`

**状态：Pass**

---

### Should 明细（全量 S0–S9 UI）

#### SW-S0-1 · Home 推荐密度
- **现象**：中央 compose + 推荐区/辅说明同屏，信息块偏多。
- **改法**：推荐折叠或降为次级一行；主 CTA 留白优先。
- **验收**：首屏扫视主路径一眼可读。
- **证据**：`agent-stepwise-ui/S0/S0-home.png` · `S0-compose.png`

#### SW-S5-1 · 会话绑案双入口感
- **现象**：无案时顶栏软引导 + 控件并存；绑后顶带卸载可更明确。
- **改法**：无案仅一处主绑案；绑后顶带立即收起。
- **证据**：`agent-stepwise-ui/S5/S5-unbound-top.png` · `S5-bound.png`

#### SW-S6-1 · 会话筛选未同步 URL / 主表
- **现象**：点侧栏 segmented「待确认/进行中」仅改 `aria-pressed` + 侧栏列表；**不写** `?filter=`；主表仍示全部（含失败行）。深链 `?filter=needs_human` 则主表正确滤 3 行。进行中时空侧栏「无匹配结果」与满主表并存。
- **改法**：segmented 切换写入/清除 URL（与 Home chip 同契约）；主表与侧栏共用同一 filter 源；空态主表亦诚实。
- **验收**：点「待确认」→ URL 含 filter · 主表行数=计数 · 标题/空态一致；刷新可恢复。
- **证据**：`S6-sessions-needs.png` · `S6-sessions-running.png` · `S6-url-filter-needs.png` · `_probe.json`（filterParam=null vs 深链 Pass）
- **skill**：web-design-guidelines · Navigation & State（URL reflects state）

#### SW-S6-2 · 筛选后主标题仍「全部会话」
- **现象**：待确认 pressed 时 H1/标题仍「全部会话」。
- **改法**：随 filter 改为「待确认会话」/「进行中」或加状态 chip。
- **验收**：标题与 pressed 段一致。
- **证据**：`S6-sessions-needs.png` · `S6-url-filter-needs.png`

#### SW-S7-1 · Catalog Beta 区标题叠字
- **现象**：H2「Beta Beta·非采购闭环」。
- **改法**：去重复「Beta」（保留分层徽标或文案其一）。
- **验收**：单次「Beta」+ 说明。
- **证据**：`S7/_probe.json` headings · `S7-catalog.png`（fullPage）

### Must 汇总（UI）

**无 Must**（S0–S9）。硬闸全过；e2e S0–S9 Pass 与 UI 深看不冲突。Should 以上 SW-* 记入排修，不挡演示。

### UI 证据计数

| 步 | PNG | `_probe.json` |
|----|-----|---------------|
| S0–S5 | 既有 | 既有 |
| S6 | 5 | 1 |
| S7 | 3 | 1 |
| S8 | 5 | 1 |
| S9 | 6 | 1 |
| **S6–S9 合计** | **19** | **4** + `_walk_s6_s9_report.json` |

（含 `S6-url-filter-needs.png` 深链对照。）

---

## 总控汇总结

| 面 | 结论 |
|----|------|
| **e2e** | S0–S9 **Pass**（既有） |
| **UI 深看** | S0–S9 **Pass** · **Must = 无** |
| **硬闸** | 无 mid 深链 · 无 BillingHold 全宽 · Pass |
| **Should** | SW-S0-1 · SW-S5-1 · **SW-S6-1** · **SW-S6-2** · **SW-S7-1** |
| **Hunt/CDP** | findings 0（已知） |
| **Won't** | prototype 欠费黄条全宽（已杀） |
| **本轮** | 只 docs/证据 · 未改 `apps/` · 未 commit/push |

---
*UI 附段 S0–S9 · 只评不改 · 2026-09-19 ~12:02 CST*

---

## 附注 · Should 复测（`cdbd74f`）

见 [`AGENT_STEPWISE_SHOULD_RECHECK.md`](./AGENT_STEPWISE_SHOULD_RECHECK.md)。  
**结论**：SW-S0-1 / S5-1 / S6-1 / S6-2 / S7-1 全 **PASS** → Should 波 **Go**。
