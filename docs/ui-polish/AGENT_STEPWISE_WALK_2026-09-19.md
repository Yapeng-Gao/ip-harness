# Agent 逐步走查 · 2026-09-19（仅 S0–S2）

| 项 | 值 |
|----|-----|
| **日期** | 2026-09-19（Asia/Shanghai · ~11:54 CST） |
| **对象** | Agent 壳 `@ip/agent` · **localhost:5175** |
| **计划** | `docs/ui-polish/AGENT_STEPWISE_WALK_PLAN_2026-09-19.md` |
| **范围** | **仅 S0–S2**（S3+ 未做，见文末） |
| **禁止** | 未改 `apps/` 产品代码 |
| **Command** | `npx playwright test --project=agent-stepwise` |
| **Browser** | Chromium headless · `workers: 1` |
| **依赖口** | iam:5177（enterWorkspace · 知产 Agent → 德恒）· agent:5175 · 均已起 |
| **证据目录** | `docs/ui-polish/agent-stepwise-e2e/` |
| **e2e** | `e2e/agent-stepwise-s0-s2.spec.ts` · config project `agent-stepwise` |

## 端口（跑前 curl）

| 服务 | URL | curl |
|------|-----|------|
| agent | `http://localhost:5175/` | **200** |
| agent home | `http://localhost:5175/agent` | **200** |
| iam（进仓） | `http://localhost:5177/login` | **200** |

## 硬闸汇总

| 闸 | 结果 | 证据 |
|----|------|------|
| 无 mid 深链 | **Pass** | S0/S1/S2 全程 `origin=http://localhost:5175`，无 `5173` |
| 无 BillingHold 全宽黄条 | **Pass** | `[data-billing-hold-banner]` count=0（Home + 会话） |
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

**关键断言**

- URL=`http://localhost:5175/agent`
- 竖导航 `data-testid=agent-side-nav` / `aria-label=办理导航`
- 待确认 chip `home-needs-human-chip`（或「最近待确认」区）
- compose：`aria-label=办理目标` + `home-send`（开始办理）
- CaseBind：`home-case-bind` → `case-bind-controls` · 入口数=1
- 无 `[data-billing-hold-banner]`
- console error：无

**证据**

- 截图：`docs/ui-polish/agent-stepwise-e2e/S0-home.png`
- JSON：`docs/ui-polish/agent-stepwise-e2e/S0-meta.json`

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

**关键断言**

- 入口清晰：`case-create-bind` 可见（**未 Skip**）
- 绑定后 `case-bind-current` 含案标题 +「样机」
- `home-send` 仍 enabled
- Home 案件入口仍=1
- console error：无

**证据**

- 截图：`docs/ui-polish/agent-stepwise-e2e/S1-case-bound.png`
- JSON：`docs/ui-polish/agent-stepwise-e2e/S1-meta.json`

**状态：Pass**（样机入口清晰，未走 Skip 分支）

**不确定 / 备注**

- 绑定写入的是本地 `mock-case-*` 种子，非真 case-core / 中台库（样机诚实文案已在 UI 标明）。
- e2e 断言绑定标签与可开工，未解析内存中的原始 caseId 字符串（标签侧已含样机标识）。

---

## S2 · 无案点「开始办理」

| 维 | 级 | 结论 |
|----|----|------|
| **业务逻辑** | **Pass** | 无强制案即可开工；进会话后无强制绑案弹死。 |
| **页面逻辑** | **Pass** | 点击 `home-send` → URL `/agent/sessions/:id`；timeline 可见。 |
| **业务表现** | Ok | 符合 agent-case-binding「先聊后案」。 |
| **页面表现** | Ok | 会话主区 `session-timeline-scroller` 可见。 |
| **UX** | Ok | 无 dialog 强制绑案；软引导可有可无（本跑顶栏绑案带未稳定可见，不挡开工）。 |
| **UI** | Ok | 无全宽 BillingHold。 |

**关键断言**

- 开工前 `case-bind-hint`（无案）
- 最终 URL 例：`http://localhost:5175/agent/sessions/sess-1789790087814`
- 无强制绑案 dialog
- `session-timeline-scroller` 可见
- `[data-billing-hold-banner]`=0
- console error：无

**证据**

- 截图：`docs/ui-polish/agent-stepwise-e2e/S2-session.png`
- JSON：`docs/ui-polish/agent-stepwise-e2e/S2-meta.json`

**状态：Pass**

---

## 用例结果一览

| ID | 用户动作 | Pass/Fail/Skip | 一句 |
|----|----------|----------------|------|
| **S0** | 打开 /agent Home | **Pass** | 竖导航/待确认/compose/单套 CaseBind 齐；硬闸全过 |
| **S1** | 创建并绑定新案 | **Pass** | mock 案绑定成功且仍可开工；入口清晰未 Skip |
| **S2** | 无案点「开始办理」 | **Pass** | 进 `/agent/sessions/:id`，无强制绑案弹死 |

**合计：3 passed · 0 failed · 0 skipped** · 墙钟 ~5.8s

## S3+ 未做

按总控令，本轮 **仅 S0–S2**。下列步骤 **未执行**，待报完后再继续：

| ID | 用户动作 | 状态 |
|----|----------|------|
| S3 | 会话轨迹/回复可见 | **未做** |
| S4 | HITL Confirm 可见可点 | **未做** |
| S5 | 会话顶栏绑案 | **未做** |
| S6 | 会话列表 + 待确认筛选 | **未做** |
| S7 | Catalog 选 Agent | **未做** |
| S8 | 项目模式 general | **未做** |
| S9 | domain/patent + 专家私聊 | **未做** |

## Must 汇总

本轮 S0–S2 **无 Must 级失败项**。

## 产物清单

- `e2e/agent-stepwise-s0-s2.spec.ts`
- `playwright.config.ts`（新增 project `agent-stepwise`）
- `docs/ui-polish/agent-stepwise-e2e/S0-home.png` · `S0-meta.json`
- `docs/ui-polish/agent-stepwise-e2e/S1-case-bound.png` · `S1-meta.json`
- `docs/ui-polish/agent-stepwise-e2e/S2-session.png` · `S2-meta.json`
- 本报告 `docs/ui-polish/AGENT_STEPWISE_WALK_2026-09-19.md`


---

## S0 · Live verify append

| 维 | 级 | 结论 |
|----|----|------|
| **业务逻辑** | **Pass** | 通用 Home 案件为可选，不阻断开工；S0 业务入口可用。 |
| **页面逻辑** | **Pass** | URL=`/agent`；竖导航存在，主 CTA 仅「开始办理」。 |
| **业务表现** | Ok | 通用 Home 案件路径保持可选，未制造强制绑案。 |
| **页面表现** | Ok | Home 信息架构清晰，竖导航与 compose 主区可见。 |
| **UX** | Ok | 无 BillingHold 干扰；compose 不展示「关联案件」 select，开工路径直接。 |
| **UI** | Should | 推荐 chips 可进一步加密，提升首屏可扫描的推荐密度。 |

### Live hard gates

- **Pass**：无 BillingHold banner。
- **Pass**：`a[href*=5173]` 数量为 `0`。
- **Pass**：compose 无「关联案件」 select。
- **Pass**：CaseBind 共两个按钮，其中一个为 block 按钮。

**S0 总结：Pass。**

**证据截图**：`shot-call_efhXWNRP...`、`shot-call_hwnJ00pZ...`


---

## S1 · Live verify append

| 维 | 级 | 结论 |
|----|----|------|
| **业务逻辑** | **Pass** | 创建并绑定「走查S1新案」后可成功解绑；mock 案件保持诚实标注。 |
| **页面逻辑** | **Pass** | 创建/绑定 → 当前案件 → 解绑流程完整；解绑后仍可开工。 |
| **业务表现** | Ok | 绑定态展示样机案，解绑后回到无案态，不伪装为真实 case-core 案件。 |
| **页面表现** | Ok | Home 案件入口仍为单套 CaseBind，无额外「关联案件」 select。 |
| **UX** | Ok | 绑案可选且可逆，不阻断「开始办理」。 |
| **UI** | Ok | 创建、绑定、解绑控件与样机文案清晰可见。 |

### Live hard gates

- **Pass**：创建并绑定 S1 案后成功 unbind。
- **Pass**：mock 案件以样机身份诚实呈现。
- **Pass**：无 BillingHold banner、无 mid 深链、无禁用中间 CTA。
- **Pass**：Home 案件入口保持单一。

**S1 总结：Pass。**

**证据**：`docs/ui-polish/agent-stepwise-ui/S1/S1-bound.png`、`S1-case-bind-bound.png`、`_probe.json`

---

## S2 · Live verify append

| 维 | 级 | 结论 |
|----|----|------|
| **业务逻辑** | **Pass** | 无案直接「开始办理」可进入 `/agent/sessions/sess-*`，没有强制绑案墙。 |
| **页面逻辑** | **Pass** | 会话 URL 命中 `/agent/sessions/sess-*`，会话主区与可选案件控件可见。 |
| **业务表现** | Ok | 支持「先聊后案」；案件可稍后创建或绑定。 |
| **页面表现** | Ok | 无强制绑案 dialog 或弹死页，进入后仍可继续办理。 |
| **UX** | Ok | 文案明确说明无案也可继续聊，路径不被案件前置条件打断。 |
| **UI** | Ok | 复制文案诚实，包含「确认后不会写入案件」。 |

### Live hard gates

- **Pass**：无案启动后 URL 为 `/agent/sessions/sess-*`。
- **Pass**：无强制 case wall；`mustBindBanner=false`。
- **Pass**：文案包含「无案也可继续聊」及「确认后不会写入案件」。
- **Pass**：无 BillingHold banner、无 mid 深链、console error 为 0。

**S2 总结：Pass。**

**证据**：`docs/ui-polish/agent-stepwise-ui/S2/S2-home-unbound.png`、`S2-session.png`、`S2-session-full.png`、`_probe.json`


---

## S3 · Live verify append

| 维 | 级 | 结论 |
|----|----|------|
| **业务逻辑** | **Pass** | 启动并推进 mock 剧本，交底整理、特征抽取等步骤进入会话轨迹；mock 轨迹明确为缓冲态。 |
| **页面逻辑** | **Pass** | URL=`/agent/sessions/sess-oa-1`；`session-timeline-scroller` 可见，轨迹内容长度=303。 |
| **业务表现** | Ok | mock trail 展示系统/思考/调用步骤，未伪装成真实写库结果。 |
| **页面表现** | Ok | 会话轨迹按时间顺序呈现，推进前后均可取证。 |
| **UX** | Ok | 推进反馈可见，不被强制绑案或 BillingHold 阻断。 |
| **UI** | **Should** | 工具调用明细可进一步默认折叠，降低长轨迹噪声。 |

### Live hard gates

- **Pass**：mock trail 成功启动并推进，`session-timeline-scroller` 可见。
- **Pass**：无 mid 深链、无 BillingHold 全宽黄条，console error 为 0。
- **Pass**：轨迹包含 mock steps，且调用项标明「未写库 · 缓冲」。

**S3 总结：Pass。**

**证据**：`docs/ui-polish/agent-stepwise-ui/S3/S3-before-start.png`、`S3-after-advance.png`、`S3-timeline-closeup.png`、`_probe.json`；`docs/ui-polish/agent-stepwise-e2e/S3-meta.json`


---

## S4 · Live verify append

| 维 | 级 | 结论 |
|----|----|------|
| **业务逻辑** | **Pass** | HITL ConfirmBar 可见；选定「新颖性」并填入策略要点后，专科 CTA「批准策略」正确 enabled。 |
| **页面逻辑** | **Pass** | URL=`/agent/sessions/sess-oa-1?focus=hitl`；`.confirm-hitl` 可见，CTA 断言限制在 ConfirmBar 内。 |
| **业务表现** | Ok | ConfirmBar 业务闸正确，确认前置字段齐备后才允许批准策略。 |
| **页面表现** | Ok | HITL 确认区在会话中可定位、可操作，未被其他 CTA 混淆。 |
| **UX** | Ok | 确认动作与策略上下文同屏，用户可在写入前明确批准。 |
| **UI** | **Should** | ConfirmBar 周边工具调用明细可进一步折叠，优先突出确认主动作。 |

### Live hard gates

- **Pass**：`.confirm-hitl` 可见，且专科 CTA「批准策略」可见并 enabled。
- **Pass**：已选争点类型「新颖性」、已填策略要点。
- **Pass**：无 BillingHold 全宽黄条、无 mid 深链，console error 为 0。
- **Pass**：CTA 断言 scoped 在 `.confirm-hitl` 内（R5）。

**S4 总结：Pass。**

**证据**：`docs/ui-polish/agent-stepwise-ui/S4/S4-hitl-session.png`、`S4-confirmbar-closeup.png`；`docs/ui-polish/agent-stepwise-e2e/S4-meta.json`
