# Agent IA · 自由度复检（自由 bot vs 固定专家）

> **日期**：2026-09-19（CST）· Owner：业务深度审计（B 席）  
> **对象 SHA**：`b8c58d3`（`feat(agent): free Grok bots vs fixed project experts`）  
> **规格**：`docs/architecture/product-apps/agent-entry-modes.md`（自由度冻结 `cec9d79`）  
> **Owner 说明**：`docs/ui-polish/AGENT_IA_FREE_VS_FIXED.md`  
> **性质**：只评不改。

## 总判一行

通用侧 **新建 bot + 一对一 + 转发** mock 形状齐；项目侧 **专家固定、无「新建专家」、角标可感知**——与 `cec9d79` 自由度差对齐。写库闸未放松到自定义 bot。

## 活口对照

| 规格点 | 证据（`b8c58d3`） | 判 |
|--------|-------------------|-----|
| 通用可 **新建 bot** | 路由 `bots/new`→`GeneralBotNewPage`；侧栏「新建 bot」；`GeneralBotsContext.createBot` 内存 | **Pass** |
| 通用 **一对一** | `/agent/bots/:botId`→`GeneralBotChatPane`；壳 `GeneralGrokShell` 默认落地 | **Pass** |
| 通用 **转发 / bot 互通** | 会话「转发给 bot…」→`forwardToBot`；双线程引用消息 + `intercom` 事件；testid `general-bot-forward-*` | **Pass** |
| 项目 **专家固定 · 无新建** | `ProjectFolderSidebar` / 工作区角标「项目 · 专家固定」；`apps/agent/src` **无**「新建专家」字面；花名册仍 `expertIdsForKind` | **Pass** |
| 自由度可感知 | 通用角标「自由 bot」vs 项目「专家固定」；自定义 bot 注释钉不进项目花名册 / 不走 DomainCommand | **Pass** |

## 顺带轻扫 · 原 P2（`8fa2180`）

| 原债 | 状态 |
|------|------|
| Home 副文案偏领域闭环 | **已消**：`8fa2180` 改「先聊起来 · 案可选」；`b8c58d3` 后 Home 降为**次级/兼容**入口，默认主心智=Grok 自由 bot 壳——原抢戏句不再生效 |
| `pending_create` 死类型 | **已消**：`CaseBindControls` 创建并绑定短瞬 `pending_create`→`bound`（loading）；项目可 mirror |

→ 逐步业务审计余 **P2=0**（相对上轮合流复检后的 2 条）；**Won't=1**（全宽黄条）仍冻结。

## 毛刺（不升债）

- 通用转发为内存 mock，非真消息总线——规格允许。  
- 项目专家间互通「可选」未单独立项——本波验收未要求。

## 方法

静态读 `App.tsx` · `GeneralBotsContext` · `GeneralBotChatPane/Sidebar` · `GeneralBotNewPage` · `ProjectFolderSidebar`；交叉 `AGENT_IA_FREE_VS_FIXED.md`。未重跑浏览器。
