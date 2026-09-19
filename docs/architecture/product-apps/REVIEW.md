# product-apps 架构评审记录

| 项 | 值 |
|----|-----|
| 评审角色 | 架构评审 |
| 对象 | `docs/architecture/product-apps/` 九篇 |
| 正文 SHA | **`fd604db`**（product-apps specs for five shells and agents） |
| REVIEW 推仓 | **`fb2b1d3`**（review Pass）；本文件为推仓复验确认 |
| 日期 | 2026-09-12 |
| **结论** | **通过**（推仓复验维持） |

## 尺子对照

| 尺子 | 结果 | 说明 |
|------|------|------|
| 五壳边界 | 过 | mid/workbench/agent/ops/iam + api:5180；壳非微服务 |
| 节点独立应用推荐 | **过 · 站得住** | 默认同壳；拆 app 条件+代价+清单 |
| 工具/MCP/单 Agent | 过 | 目录≠MCP；AgentDef 插件+版本化 catalog |
| APP_PORTS / landing / dev-spec / enterprise | 过 | 端口与冻 URL/C+DSH/Codex/禁直写库对齐 |
| 样机诚实 | 过 | 无真 MCP/harness/通道/SSO |

## 推仓复验（总控催）

正文相对 `fd604db` 关键漂移；`fb2b1d3` 增 REVIEW。结论维持 **通过**。

## 非阻塞（维持）

1. prosecution 等 handoff 括注可补 `ARTIFACT_FOR_STAGE` 字面。
2. 首个实现 PR 仍遵守「不拆节点 app」默认。

## 裁决

**通过。** 可总控总验。

## B席轻扫 · Agent 项目文件夹 IA（`2c98384`）

| 项 | 值 |
|----|-----|
| 对象 | [agent-project-folder.md](./agent-project-folder.md) |
| 日期 | 2026-09-19 |
| **结论** | **Pass** |

| # | 尺子 | 结果 | 说明 |
|---|------|------|------|
| ① | 项目 / 总控 / 专家分层 | **过** | ProjectFolder → Orchestrator + Experts；总控=编排、专家=领域 |
| ② | 每专家独立业务逻辑 | 过 | 四件套（工具/剧本/命令候选/护栏）；禁共用通用闲聊 script |
| ③ | HITL 写库 | 过 | 试运行不写；正式=Confirm→DomainCommand；总控禁绕闸直 dispatch |
| ④ | 样机边界 | 过 | 禁真 LLM；本波禁真 case-core；`backend: mock`；横幅钉死 |

对齐 agent-surface / plugins / enterprise「禁 Agent 直写库」。

### 非阻塞

1. 路由 `?project=&expert=` vs `/projects/:pid` 实现择一即可（文已写）。  
2. 现仓若仍有单一 `AGENT_SCRIPTS`，实现刀须按 expertId 拆分后再勾验收。

## B席轻扫 · Agent 入口模式（`4cf2e47`）

| 项 | 值 |
|----|-----|
| 对象 | [agent-entry-modes.md](./agent-entry-modes.md) |
| 日期 | 2026-09-19 |
| **结论** | **Pass** |

| # | 尺子 | 结果 | 说明 |
|---|------|------|------|
| ① | 通用 Agent vs 项目 | **过** | 默认 `/agent` 单聊；项目可选，不强制建夹 |
| ② | general vs domain+DomainPack | 过 | general=协作夹无专利步骤；domain 挂 Pack |
| ③ | patent 首包可扩展 | 过 | `patent` 启用；预留灰显「另立项」 |
| ④ | 旧 sessions 定位 | 过 | 主心智=通用历史；兼容深链；不与项目抢默认入口 |
| ⑤ | 样机边界 | 过 | HITL→DomainCommand；禁真 LLM/本波真 case-core |

与 agent-project-folder（domain/patent）互补：入口冻结在本稿。

### 非阻塞

1. `agent-project-folder` §路由仍写「`?project=` 或 `/projects/` 择一」——以 **entry-modes 路由表为准**；实现刀勿两套真相。  
2. `DomainPackId` 类型示意可写成 `'patent' \| string` 预留，与正文 `future_*` 一致即可。

