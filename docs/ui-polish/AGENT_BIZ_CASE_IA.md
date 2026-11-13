# Agent 业务案页 IA 三刀（规格 + 样机 · 2026-09-21 CST）

只改 `apps/agent/**` + docs（架构权威 + 本短记/截图）。禁 Cloud；未改 mid/packages。  
叠 `d42ae89`（C·7席）/ `21ce0fc`（交底席=bot）；**勿回退**开聊首页 / 席=bot / 双文件 / 交卷 HITL / Catalog 同 projectId。

## 规格（A · 先交）

权威：[agent-biz-case-ia.md](../architecture/product-apps/agent-biz-case-ia.md)  
**规格 SHA**：`db5ac05`  
**样机 SHA**：`7df0c17`  
互链：[agent-business-mode.md](../architecture/product-apps/agent-business-mode.md) · [agent-seat-as-bot.md](../architecture/product-apps/agent-seat-as-bot.md)（席=bot 不回退）

| 刀 | 钉死 |
|----|------|
| **1 两栏** | 左=案子列表+本案席（可折叠）；右=席工作面会话为主；成果/过程→抽屉或次 tab；顶栏阶段极简或并入左；群聊可进 room、勿第三栏 |
| **2 藏工程词·单一主 CTA** | 默认藏席 bot 角标、disclosure_pack/`08_*.md`（详情可展）；右上只一主按钮：待确认→「去确认·…」否则「让它干活/交卷」；专家台降次级 |
| **3 单一进度** | 去掉重复主链；席内步骤 pill 只读；推进走会话/让它干活→`advanceSeatWork` |

## 样机（B）

| 项 | 落地 |
|----|------|
| 两栏 | `BusinessCaseSidebar` 并入本案席+群聊入口；`BusinessCasePage` 去掉中轨席栏 |
| 主 CTA | 案顶右上唯一：pending→去确认，否则触发本席干活/交卷；席头专家台次级；默认无席 bot 角标 |
| 工程名 | 成果/办理过程 tab 默认业务名；详情展 `NN_*.md` |
| 进度 | 顶栏阶段极简一行；席步骤 pill 只读；无第二套可点主链 |
| 7 席 | 同构 `BusinessSeatWorkbench` 会话壳不变 |

**Nits（叠 `7df0c17`/`6aaf049`）**：本案 pending 时会话内「让它干活/交卷请确认」chip 藏起，顶栏「去确认」独占；「办理过程」`CaseProcessPanel` 仅次 tab，勿常驻会话下方。截图 `07-nit-pending-chips-deferred.png` · `08-nit-process-in-tab.png`。

## 截图

`docs/ui-polish/agent-biz-case-ia/`

| 文件 | 内容 |
|------|------|
| `01-knife1-two-col.png` | 两栏：左案子+席 · 右会话主 · 群聊入口非第三栏 |
| `02-knife2-single-cta.png` | 待确认→「去确认·…」；更多→专家台次级 |
| `02b-knife2-work-cta.png` | 无待确认→「让它干活」 |
| `03-knife2-hide-eng.png` | 成果 tab 默认无 `08_*.md` |
| `03b-knife2-filename-expanded.png` | 详情展工程文件名 |
| `04-knife3-readonly-steps.png` | 席步骤 pill 只读 · 无阶段 pill 墙/中轨 |
| `05-home-intact.png` | 开聊首页未回退 |
| `06-research-isomorphic.png` | 查新席同构会话壳 |
| `07-nit-pending-chips-deferred.png` | pending：无会话 chip · 顶栏去确认 |
| `08-nit-process-in-tab.png` | 办理过程仅次 tab · 会话下无常驻块 |

## 验收

- [ ] 规格先 commit（A SHA）
- [ ] 样机按三刀；截图入库
- [ ] `npm run typecheck -w @ip/agent` 通过
- [ ] 不回退开聊 / 席=bot / 双文件 / HITL / 同 projectId / 7 席同构
