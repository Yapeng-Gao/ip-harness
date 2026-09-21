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

## B席轻扫 · Agent 案绑定（对象 `fe64234` · 正文 `07befac`）

| 项 | 值 |
|----|-----|
| 对象 | [agent-case-binding.md](./agent-case-binding.md)（入口回链 `fe64234`） |
| 日期 | 2026-09-19 |
| **结论** | **Pass** |

| # | 尺子 | 结果 | 说明 |
|---|------|------|------|
| ① | 入口不强制案 | **过** | 新建会话/项目不强制 caseId；通用/general 可全程无案 |
| ② | 内创建 / 绑定 | 过 | 区内「创建并绑定新案」+「绑定已有案」；patent 可空开 |
| ③ | mock | 过 | mock caseId；可选 HITL 形状；禁真 case-core / 静默真建案 |
| ④ | 中台权威不挡先聊 | 过 | 可不先 mid；权威列表仍 mid/case-core；Agent 只引用不另起影子案库 |

与 entry-modes §6 / 验收「不强制 caseId」一致。

## B席轻扫 · Sessions×项目线程合流（`b4dc487`）

| 项 | 值 |
|----|-----|
| 对象 | [agent-sessions-project-threads.md](./agent-sessions-project-threads.md) |
| 日期 | 2026-09-19 |
| **结论** | **Pass** |

| # | 尺子 | 结果 | 说明 |
|---|------|------|------|
| ① | 两套存储诚实 | **过** | 通用会话 / 项目线程分池；合流=视图聚合；禁第三套影子库 |
| ② | 筛选 / 深链边界 | 过 | `?source=`；通用→sessions/:id；项目→projects/.../bots |
| ③ | 不扩 mid | 过 | Owner 只改 `apps/agent`；不造第二案库；不删项目夹导航 |

与 entry-modes §4 修订一致。

## B席轻扫 · entry-modes IA 改向（`101e948`）

| 项 | 值 |
|----|-----|
| 对象 | [agent-entry-modes.md](./agent-entry-modes.md)（改向稿） |
| 日期 | 2026-09-19 |
| **结论** | **Pass** |

| # | 尺子 | 结果 | 说明 |
|---|------|------|------|
| ① | 通用=Grok+专利专家 | **过** | 默认 `/agent` 多 bot 侧栏+总控；废止单 Composer 主心智 |
| ② | 项目=同壳挂夹 | 过 | 同一 Grok 壳；夹内挂同 Pack；不抢默认入口 |
| ③ | 与旧单聊兼容 | 过 | Composer 降为 bot 会话区；sessions 聚合保留；Catalog 改管理入口；路由可演进 |

写库/案绑定未放松。相对旧 B席（`4cf2e47`「默认单聊」）**本改向作废该心智**，以本稿为准。

### 非阻塞

1. `agent-project-folder` §1 总控仍写「同一项目下」——实现时按 entry-modes：通用壳亦有总控席。  
2. 实现刀须迁移既有「单 Composer 默认」UI，验收勾「非 Catalog 下拉主心智」。

## B席轻扫 · 自由度补丁（`cec9d79`）

| 结论 | **Pass** |
|------|----------|
| 通用自由 | 过：自设 bot + 一对一 + bot 互通（mock）；专利模板可选挂载 |
| 项目固定 | 过：IP 专家焊死花名册；无新建专家；仅可显隐 mining |
| 边界 | 过：自定义 bot 不进项目花名册；写库/HITL 未放松；废止「通用焊死与项目同自由度」 |

相对 `101e948`（通用壳焊专利侧栏）以本稿为准修正自由度。

## B席轻扫 · Agent 三层叠法（`1737b1a`）

| 结论 | **Pass** |
|------|----------|
| L1→L2→L3 递进非并列 | 过：底座→团队→专利对接中台；覆盖「通用 vs 项目」并列心智 |
| L3 映射表边界 | 过：bot→阶段/工件/工具/HITL 写候选；总控禁直写；FTO 默认不写案 |
| 禁大拆写库 | 过：写库仍 HITL→DomainCommand；标明 Agent 暂缓大拆 |

entry-modes 降为路由/自由度附录，主心智以本稿为准。

## B席轻扫 · L2 团队 bot 自发互通（`ee40a57`）

| 结论 | **Pass** |
|------|----------|
| bot→bot 自发 | 过：区别于用户转发；`spontaneous` + 协作任务状态机 |
| 协作 mock | 过：编排→search→draft 可点故事；无真 LLM |
| 路由仅 team/bots | 过：L1 `/agent` 禁多 bot 墙；L2=`/agent/team`+`/bots/*` |

**风险**：`agent-entry-modes` 附录仍偏「默认多 bot」——实现以 **layers + 本稿** 为准（L1 单助手，互通只在 L2）。

## B席轻扫 · L3 专利 bot（`5ade0b3`）

| 结论 | **Pass** |
|------|----------|
| 固定专家+业务剧本 | 过：焊死花名册+分剧本四件套；总控不替代领域逻辑 |
| 产出↔中台 HITL 映射 | 过：工件键/阶段/Confirm→DomainCommand；FTO 默认不写案；中台只读配合 |
| 仅 projects | 过：L1 `/agent`、L2 `/team` 禁焊死专利花名册 |

**风险**：`expert-figure` 为 ± 新成员，实现勿默认塞进 L2；映射与 layers §5 双写，改键时须同步。

## B席轻扫 · L3 全链路补丁（`afe94aa`）

| 结论 | **Pass** |
|------|----------|
| disclosure/filing/oa 必选 | 过：三席入焊死花名册；mining/figure 升必选；撰稿≠交底 |
| 映射/HITL | 过：工件键对齐 contracts；禁真递交；Confirm→DomainCommand 壳内示意 |
| 入口/隔离 | 过：仅 projects；不经 team；不污染 L1/L2 |

**风险**：全链路 9 席演示偏重——实现须用文内「可截短 3～4 席」；`filing` 无独立 handoff key，勿臆造 packages 字段。

## B席轻扫 · 跨面项目串接（`eb81e3f`）

| 结论 | **Pass** |
|------|----------|
| 建项目起串 | 过：IAM→创建项目→mid→workbench→Agent L3；禁专家截入当主路径 |
| 面职责/权威 | 过：mid=案权威；workbench=人工作业；Agent=专家队；写仍 DomainCommand |
| 诚实边界 | 过：mock caseId；禁真 SSO/case-core；Agent 不要求可点 mid 验收 |

**风险**：Agent/mid 双入口建项目须同一 `projectId`（样机映射表）；实现勿做成两套项目真相。

## B席轻扫 · L3 STAGE 对齐（`944dc8b`）

| 结论 | **Pass** |
|------|----------|
| STAGE 对齐 | 过：research/intake 命名与 handoff 键对齐 STAGE_MODULES + ARTIFACT_FOR_STAGE |
| 辅席/缺口诚实 | 过：figure/fto 无伪造 key；layout/maintain/monetize/watch 标缺口 |
| 入口/写库 | 过：从建项目起；禁截入；不改 packages；Confirm 示意 |

**风险**：旧 id `expert-search`/`expert-mining` 须靠别名迁移；实现勿把 FTO 写成 `layout_insight`。

## B席轻扫 · 专利 Agent 壳重做（`fe03389`）

| 结论 | **Pass** |
|------|----------|
| 默认入口 | 过：冷启动=专利 Catalog；L1/自由 L2 降级旁路，旧 layers/entry-modes 对本壳让位 |
| A/B/C + 双文件 | 过：单聊/组队/群聊共享 projectId；成果+worklog 过程可见；禁专家截入；OA 仅 file 后 |
| 诚实边界 | 过：假 FS；Confirm→DomainCommand 示意；01–05 提案键不假装已入 contracts；禁真 LLM/case-core |

**风险**：花名册席位多（含立项前簇），全链演示偏重——实现须截短主链；与 `agent-l3-patent`/SEAT_ROSTER 改键须三方同步；figure/fto 仍无独立 handoff key，勿臆造 packages 字段。

## B席轻扫 · Agent 平台正式稿 + 专利 Domain Pack（`6ba58ae`）

**扫范围**：`agent-platform.md` · `domain-packs/patent-pack-{design,impl}.md` · `agent-platform-gap.md` · 补丁口径 `agent-layers` / `agent-l3-patent` / `agent-patent-shell`（仅 docs，无 apps）。

| 结论 | **Go-with-nits** |
|------|------------------|
| Solo/Team/Domain ↔ L1/L2/L3 | 过：平台 §1 叠名；Team/Domain **同多 bot runtime**，入口/SOP 不同（非产品偷换） |
| 16 席 / HITL×8 / 五层裁判 / Handoff | 过：Pack 矩阵列全；F7–F9 Phase 仍入表；Catalog=子集过渡写清 |
| `expert-fto` ≠ 无效维权顾问 | 过：pack-design §2 钉死；勿合并 id |
| 端用户禁 mid 深链 | 过：pack / l3 / shell / gap 一致不放松 |
| gap 顺序 docs→mock validator→真沙箱 | 过（轻黄）：顺序可验收；P0 清单宜内联 gap，勿只靠 incoming §14 |
| 样机诚实 | 过：禁真 LLM/case-core/真沙箱本轮；本 commit 仅 docs |

### Nits（须消后再开样机/平台刀）

1. **`/agent` 冷启动双钉**：`agent-layers` 正文/验收仍钉「冷启动=L1」；`agent-patent-shell` 钉「`/agent`→专利 Catalog」。须写成显式双产品路径（或改 layers 验收）。
2. **`expert-mining`→`expert-intake` 别名**（l3 §2）与 Pack/shell「mining=挖掘≠立项」硬拧——删或改写。
3. **layers §5 FTO→`layout_insight`**：与 l3「勿把 FTO 写成 `layout_insight`」冲突；布局键留给 layout。
4. **F9「无效维权」→ STAGE `watch`**：职责相邻、语义不等同；另提案键或注明暂借。
5. **HITL×8 ↔ 壳闸门对照表**缺页（至少 ②↔`go_nogo`，⑤/⑥↔权项/OA Confirm）。
6. **gap P0**：把启停限额、pause/resume、dsh headless 锁版、期限表核对、合规定档等可勾选项内联进 gap。

**冲突扫描**：shell/Pack 主路径齐；layers 冷启动与 FTO 残钉、l3 mining 别名 = 三处硬拧。Team≡Domain 仅 runtime 共用——不判偷换。


## B席硬拧消歧补丁（架构设计 · 跟 `6ba58ae`）

| 项 | 处置 |
|----|------|
| 冷启动双钉 | layers §3 改为**双产品路径**；专利面以 patent-shell 为准 |
| mining→intake 别名 | **删除**；仅保留 search→research |
| FTO→layout_insight | layers §5 **改正**；layout_insight 仅布局席 |
| F9→watch | Pack 注明**不借用** watch_alert；提案独立键 |
| HITL×8 对照 | pack-design + l3 §6.5 表 |
| gap P0 | §3.1 内联勾选 |

请 B 席复扫黄项即可。
