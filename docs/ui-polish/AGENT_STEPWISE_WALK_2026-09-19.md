# Agent 逐步走查 · 2026-09-19（S0–S9 完整）

| 项 | 值 |
|----|-----|
| **日期** | 2026-09-19（Asia/Shanghai · ~11:58 CST） |
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

## 附 · UI 评估侧取证（`agent-stepwise-ui/` · S0–S5）

| 项 | 值 |
|----|-----|
| **评审** | UI评估助手 · 三 skill（apple-design · make-interfaces-feel-better · web-design-guidelines） |
| **证据** | `docs/ui-polish/agent-stepwise-ui/{S0..S5}/` + `_walk_s0_s2_report.json` · `_walk_s3_s5_report.json` |
| **对照** | 上表 e2e 走查；本附为页面表现 / UX / UI 深看，不改 e2e Pass 结论 |
| **硬闸抽核** | mid `:5173` CTA=0 · BillingHold 全宽=0 · Home `home-case-bind`=1 |

### UI 步结论（S0–S5）

| ID | UI 总评 | Must | Should |
|----|---------|------|--------|
| S0 | **Pass** | — | **SW-S0-1** Home 推荐卡/辅文密度仍偏挤（可扫但非致命） |
| S1 | **Pass** | — | — |
| S2 | **Pass** | — | — |
| S3 | **Pass** | — | — |
| S4 | **Pass** | — | — |
| S5 | **Pass** | — | **SW-S5-1** 会话案件：顶栏软绑与主区 CaseBind 并存感；绑后顶带卸载时机可更干脆 |

### Should 明细

#### SW-S0-1 · Home 推荐密度
- **现象**：中央 compose + 推荐区/辅说明同屏，信息块偏多。
- **改法**：推荐折叠或降为次级一行；主 CTA 留白优先。
- **验收**：首屏扫视主路径（输入→开始办理→绑案）一眼可读，辅卡不抢主 CTA。
- **证据**：`agent-stepwise-ui/S0/S0-home.png` · `S0-compose.png`

#### SW-S5-1 · 会话绑案双入口感
- **现象**：无案时顶栏软引导 + 控件并存；绑后顶带卸载可更明确。
- **改法**：无案仅保留一处主绑案；绑后顶带立即收起并留「已绑」弱标。
- **验收**：无案/已绑两态各仅一个主入口；截图对照 `S5-unbound-top` / `S5-bound`。
- **证据**：`agent-stepwise-ui/S5/S5-unbound-top.png` · `S5-bound.png`

### Must 汇总（UI）

**无 Must**（S0–S5）。e2e S0–S9 Pass 与 UI 侧不冲突。

---
*UI 附段 · 只评不改。*

---

## 附 · Live 走查补记（S7–S9）

- **S7 · Catalog 选 Agent**：Live **Ok**；`/agent/agents` 可达，九大 Agent heading 清晰可见。
- **S8 · 项目模式 general**：Live **Ok**；通用项目进入总控，无专利步骤条 / FTO / 权利要求 HITL。
- **S9 · domain/patent + 专家私聊**：Live **Ok**；领域总控步骤条与专家私聊席位切换清晰。

## 总控汇总结（暂）

- **Live**：S0–S9 **Pass**
- **e2e**：`f1b9a07` **Pass**
- **biz**：`7057e37`；无 P0；P1 = `sessions IA`
- **UI/Hunt**：pending
- **Should**：dense recommend；collapsed tools
- **Won't**：prototype yellow banner
