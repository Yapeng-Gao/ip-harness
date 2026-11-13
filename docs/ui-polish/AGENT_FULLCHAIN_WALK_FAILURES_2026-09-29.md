# Agent 全流程走查失败台账 · 2026-09-29

## 摘要

| 项 | 值 |
|----|-----|
| **日期** | 2026-09-29（Asia/Shanghai） |
| **对象** | Agent 业务壳 `@ip/agent` · **localhost:5175** |
| **目的** | 记录全流程走查（建案 → 查新…附图…递交…OA）中的失败/卡点，供后续改产品、e2e、CDP、browser-MCP；**勿删条目**，只追加或改状态。 |
| **主链探针** | `apps/agent/src/business/mainChainWalk.test.ts` · `scripts/main-chain-walk.mjs` |
| **相关走查** | `docs/ui-polish/AGENT_STEPWISE_WALK_2026-09-19.md` · `agent-stepwise-hunt/` |
| **规格指针** | [agent-business-mode](../architecture/product-apps/agent-business-mode.md) · [agent-dept-expert-team](../architecture/product-apps/agent-dept-expert-team.md) |

> 凡 e2e / Playwright / CDP / browser-MCP 失败或卡死，追加本表。已知未复现但历史提过的项也保留。

---

## 失败 / 卡点表

| ID | 类型 | 现象 | 复现 | 影响 | 建议后续改 | 状态 |
|----|------|------|------|------|------------|------|
| FC-001 | e2e | `browserType.launch` 失败：Chromium headless shell 可执行文件不存在（sandbox / 缺 PW 浏览器缓存） | `node scripts/main-chain-walk.mjs`（agent `:5175` 已起） | Playwright 无法走新建案子→7 席 advance+confirm UI 主链 | 非沙箱执行 `npx playwright install chromium`，或脚本回退本机 Chrome channel；CI 缓存浏览器 | open |
| FC-002 | e2e | `npx playwright install chromium` 下载被沙箱拦：`cdn.playwright.dev` 403 not on allow list | 同 FC-001 环境内执行 install | 浏览器装不上，UI e2e 整条路断 | agent/shell 放行 cdn.playwright.dev，或以 `required_permissions: all` 跑 install | open |
| FC-003 | browser-MCP | 建案页 `/agent/cases/new` 填名称时 `browser_fill` 中断（transcript：`User aborted request`）；页面已打开，名称未写入，「全流程走查样机」主链未起步 | cursor-ide-browser → navigate `…/cases/new` → `browser_fill` ref 名称框（2026-09-29 全链走查） | MCP 手走建案路径不可靠；易误判产品坏而实为工具 Abort | 走查改 Playwright/`main-chain-walk.mjs` 填表；MCP 改 `browser_type` 或分步+重试；中断后勿死磕 fill | open |
| FC-004 | 产品 | 全流程走查 subagent 启动后长时间几乎无产出（假死）；父会话曾 interrupt 并要求换路 | Task resume 走查 agent（2026-09-29）启动后空转 | 走查墙钟浪费；失败不落盘、父 agent 误以为仍在跑 | 走查 agent 启动即写本表心跳/首条；禁止只靠 browser_fill；超时无产出强制换 Playwright/单测探针 | open |
| FC-005 | CDP | 历史：全链 / 逐步 UI 走查时浏览器 **Execution context destroyed**（导航或 HMR 后 CDP 句柄失效） | 此前全链 UI 走查会话曾遇；本轮未稳定复现 | CDP/猎虫中途断链，截图与 console 证据丢 | 每步重新 `Runtime.evaluate` / 新 snapshot；导航后重建 page 句柄；Hunt 步间勿长持旧 context | open |
| FC-006 | 逻辑 | 历史：`file_authorize` 确认后未进 OA；或撰写确认后**附图可跳过**直接递交 | 旧壳推进规则；现代码 `BusinessCaseContext.confirmItem` 注释「附图不可跳过」+ `figures_ready` 三席齐才 `filing`；`file_authorize` → `stageId='oa'`；`mainChainWalk.test.ts` 覆盖 | 主链演示跳席，进度与 HITL 分叉 | 已修逻辑；**2026-09-29 UI 全链** `main-chain-walk.mjs` 已验：claims→figure→filing→oa，附图未跳过 | 曾现·已回归 |
| FC-007 | 产品 | 种子案 4 条 pending（`bcf-seed-go-nogo` / `claims` / `oa-strategy` / `layout-adjust`）与新建走查案并存；全局「待我确认」/侧栏易混案 | 清 localStorage 或首访后种子 4 pending 常在；再建「全流程走查样机」 | 走查看错确认项、误点种子案；pending 计数被稀释 | 走查前隔离：只用新建案 `caseId` 过滤 pending；或 Lab「清种子 pending」；种子与演示案分 workspace | open |
| FC-008 | e2e | Hunt 逐步走查 **S1 SoftSkip**：创建并绑定新案完整流难稳定自动化（入口可见但未强制 e2e 跑通） | `docs/ui-polish/agent-stepwise-hunt/S1.md` · SUMMARY S1 SoftSkip（2026-09-19） | 建案/绑案路径长期缺硬闸 e2e；与 FC-003 叠加时更依赖手点 | 业务建案路径补 Playwright（对齐 `main-chain-walk.mjs` createCase）；Hunt S1 从 SoftSkip 升硬断言 | open |
| FC-009 | e2e | 旧版 `main-chain-walk.mjs` 在查新席找 `business-case-primary-cta` 超时；截图实已落在 `/agent/pending/…`「确认查新结论」（交卷 `onAdvanced` 自动跳待确认），脚本仍按「案页 CTA→再点确认」假设 | 2026-09-29 `node scripts/main-chain-walk.mjs`（channel=chrome, unsandboxed）；建案成功后 spot 进 room 再回案页 navigate 查新 | 误判主链卡死；实为脚本与产品导航不同步 | 脚本改：advance 循环检测 `/pending/`；spot 勿点进 room；交卷后直接 `pending-confirm-submit` | closed·已改脚本 |
| FC-010 | 产品/e2e | 新建向导由 3 步增为 **4 步**（案子信息→办理路线→**本案计划**→专家席）；旧脚本点路线后直接期望 submit，会卡在计划步 | `BusinessCaseNewPage` steps 含 `plan`；`data-testid=business-wizard-step-plan` | 旧 e2e/走查脚本建案失败或半成品 | 走查脚本必须 next 过计划步再 submit（已改 `scripts/main-chain-walk.mjs`） | closed·已改脚本 |
| FC-011 | e2e | 查新/递交席偶发「CTA missing」后靠 URL 已在 `/pending/` 恢复（未计 advance）；疑导航竞态或交卷瞬时跳转快于 CTA 轮询 | 同 FC 全链成功跑次 log：`[expert-research] pending after CTA missing` / filing 同 | 不挡主链；脚本脆弱点 | advance 前显式 wait CTA 或 `Promise.race(pending|cta)`；加短稳定等待 | open |

---

## 证据与对照（摘）

| 来源 | 要点 |
|------|------|
| transcript `9f737c65-…` | `:5175/agent/cases/new` + `browser_fill` → Abort；备注「已有种子案与待确认；新建走查案更干净」 |
| `BusinessCaseContext.seedConfirms` | 固定 4 条 `bcf-seed-*` pending |
| `BusinessCaseContext.confirmItem` | `figures_ready` 三席齐才进递交；`file_authorize` → `oa` |
| `mainChainWalk.test.ts` | 断言主链含 figure、filing→OA，防再跳席 |
| `scripts/main-chain-walk.mjs` | UI 主链脚本；依赖 Chromium（见 FC-001/002） |
| `agent-business-mode` §0 | 规格钉「撰写确认后不跳过附图」 |
| stepwise walk 2026-09-19 | S0–S9 e2e Pass；Hunt findings 0；S1 仍 SoftSkip（FC-008） |

---

## 维护约定

1. 新失败：**追加**新 ID（`FC-00N`），勿覆盖旧行。  
2. 已修：状态改为 `曾现·待回归` 或 `closed`，保留现象/复现列。  
3. 走查收工评估须链回本文。
