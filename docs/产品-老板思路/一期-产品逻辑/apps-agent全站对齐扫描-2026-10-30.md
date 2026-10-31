# apps/agent 全站对齐扫描 · 2026-10-30

> **开闸**：Leslie「不只是改右侧啊吧所有的页面都改了，和现在的产品理念，业务逻辑，产品逻辑都对齐了」。  
> **真源（只认）**：[一期-产品理念](../一期-产品理念.md) · [一期-产品逻辑/](./)（含 [交互大纲](交互大纲.md)·[线框-主链](线框-主链.md)）· [一期节点/](../一期节点/) · [业务逻辑说明](../业务逻辑说明.md)。  
> **不认**：`docs/lifecycle/product-pages.md`（已标历史）；**禁止改** `docs/prototype/main-path-sample/`。  
> **实现面**：`apps/agent` · 分支 `feature/agent-company-shell` · 本机改。

---

## 1. 改口

| 旧 | 新 |
|---|---|
| 只拧部门工作台右栏 | **全站页面**对照理念/业务/产品逻辑对齐 |
| 样机 8769 连改 | **停** main-path-sample；只动 `apps/agent` |

右栏「跟本部门负责人对话」仍是工作台子集，算 **P0 首批**，不代替全站。

---

## 2. 真源要的屏（线框 + 交互大纲）

| # | 屏 | 真源要点 |
|---|---|---|
| A | 首次/登录 | 短表进大厅；应用名 **Novada Team** |
| B | **大厅** | 待办 · 接待引导 · 目标入口 · **八部可见** · 案卷条；**不说医院分诊** |
| C | **①～⑧ 工作台** | **同壳**：顶栏（部名+合格线+回大厅）· 主栏交付物 · 右栏=跟本部门负责人对话；硬请示进汇报气泡 |
| D | ④→⑤ 工单 | 打包方、三线分词 |
| E | 案卷 | 材料 / 检查表 / 工单 / 判断痕迹 |
| F | 设置/情报等 | 线框有；一期可薄 |

理念钉：领导=当前用户；一套系统无部门门禁；交互语言=专家/部门/请示（不讲 Prompt/Agent 对外）。

---

## 3. `apps/agent` 现有路由对照

### 3.1 主链相关（要对齐）

| 路由 | 文件 | 对照真源 | 偏差（诚实） |
|---|---|---|---|
| `/agent/welcome` | WelcomePage | 登录前宣传 | 文案/品牌是否仍「外挂」满屏、是否 Novada Team — 待逐页验 |
| `/agent/login` | AgentLoginPage | 首次/登录 | 角色入口有；进大厅路径是否一律薄入口 — 待验 |
| `/agent` | HomePage | 大厅/薄入口 | 现偏「双角色主 CTA + 待办」；**八部入口/接待引导**是否够满 — **P0** |
| `/agent/cases` | BusinessCasesPage | 案盘 | 有；与大厅/项目着陆关系要钉 |
| `/agent/cases/new` | BusinessCaseNewPage | 开案子 | 有 |
| `/agent/cases/:id` | BusinessCasePage | 公司首页（一案） | 七部网格/卡点/去当前部 — **P0 要对齐理念大厅→公司** |
| `/agent/cases/:id/depts/:slug` | BusinessCaseDeptPage | ①～⑧ 工作台 | **右栏已按「负责人对话」首批改**；主栏按步交付物、⑤ABC、薄部同壳仍有缺口 — **P0 续** |
| `/agent/cases/:id/docket|billing|members` | Case* | 案级后勤 | 有；勿抢主链 |
| `/agent/pending*` | PendingConfirm* | 真源：**废独立确认页**（拍板在右栏） | **路由仍在** — **P0 清场/软跳右栏** |
| `/agent/departments` | DepartmentsPage | 近「专业/编制」 | 组织/看板旧味；要对照编制总览 — **P1** |

### 3.2 旁路/遗骸（勿当主叙事）

| 路由簇 | 说明 | 处置优先级 |
|---|---|---|
| `/agent/projects/*` · seats · room · patent | 旧「项目专家台」双轨 | **P1** 降权/深链，禁与公司主链抢顶栏 |
| `/agent/sessions*` · compose · bots · team · sandbox · lab · harness · agents · catalog | 旧 Agent 实验室/单聊壳 | **P2** 从主入口隐藏或标明实验室 |
| `/agent/assets` | 资产 | **P2** |

---

## 4. 改造计划（优先级）

### P0 — 主链可感（先做）

1. **工作台右栏**（本批已落地代码）：默认跟本部门负责人；编制默认收；硬请示气泡；工具点开；`compactRail`；禁再动样机。  
2. **工作台主栏 / 同壳**：④⑤⑥ 按步只展本步交付物；⑤ 露出 A/B/C；①②③⑦⑧ 同壳薄合格线空态。  
3. **废确认页主路径**：`/pending` 深链 → 回对应工作台右栏闸（或薄审计面不抢拍板）。  
4. **大厅 `/agent` + 公司案首页**：八部可见/接待弱引导；公司=案况+卡点去当前部；禁把旧「项目专家」当首页。  
5. **登录/欢迎**：应用名 Novada Team；进门路径对齐理念。

### P1 — 专业与编制、薄部、清双轨

6. 专业/编制页（departments 或案级专业面）按编制总览做满「让该部开工」。  
7. 薄部 ①②③⑦⑧ 工作台同壳落地。  
8. 侧栏/顶栏：砍「待确认墙」主入口；旧 projects 导航降权。  
9. 工单 ④→⑤、案卷抽屉对齐线框。

### P2 — 遗骸与精致度

10. 实验室路由出主路径。  
11. Kimi/Cursor 级精致度（字阶、空态、toast）全站扫，不挡主链语义。

---

## 5. 落地进度（诚实）

| 项 | 状态 |
|---|---|
| 扫描+计划本文 | **本文件** |
| P0① 工作台右栏负责人对话 | **已**（`fcf1a9d`） |
| P0② 主栏按步 / 同壳 / ⑤ABC | **本批已** · `workbenchSteps` + DeptPage 主栏按步；薄部合格线空态；⑤ draft/filing 露 ABC |
| P0③ pending 软跳右栏 | **本批已** · `workbenchAskPath`；详情非 `?audit=1` 软跳工作台；铃铛/待办主链跟软跳 |
| P0④ 大厅+公司案首页 | **本批已** · `/agent`=Novada 大厅（待办·接待·八部）；公司文案对齐，待确认软跳 |
| P0⑤ 登录/欢迎 Novada | **本批已** · 标题/品牌 NT · `Novada Team` |
| P1 专业/编制文案 | **薄做** · departments 改「专业/编制」+主路径提示 |
| P1 双轨 projects 降权 | **本批已** · 壳横幅+列表降权；DeptBoard/Chain 入口改开案子；路由深链保留 |
| P1 工单④→⑤ / 案卷抽屉 | **本批已** · `DeptHandoffTicket` + `CaseFileDrawer`；工作台顶栏案卷/工单 |
| P2 实验室路由出主路径 | **本批已** · `LabRouteBanner`；sessions/sandbox/lab/… 顶条回大厅 |
| P2 右栏精致度 | **续批已** · `DeptAskReportBubble` 就地确认/驳回；折叠编制头像条；多请示 sticky；大厅目标入口 |
| 禁止改 main-path-sample | **守** |

### 验收（本批）

`npm run dev:agent` → `http://localhost:5175`

1. **/agent/welcome · /agent/login**：见 Novada Team  
2. **/agent 大厅**：待办 + 接待条 + 八部门门；点门进案部（无案则开案子）  
3. **部门工作台**（④ disclosure / ⑤ draft / ⑥ oa）：主栏「本步」pill + 只展当前步正文；薄部（如 inspire）同壳合格线空态  
4. **待确认**：点大厅待办 → 应落到工作台 `?ask=`，不是独立拍板墙；`/agent/pending?audit=1` 仍可审计  
5. **右栏**：负责人对话 + 「要你拍」气泡可就地确认/驳回；编制折叠见头像条；多项请示见 sticky  
6. **大厅**：目标入口「写交底 / 递申请 / 答审查意见」落到对应部  

### 仍剩（勿称全齐）

- 大厅八部 slug 映射到现有 org（①→intake 等）是**对齐叙事**，与样机 demo-data 编制细节仍有差  
- 右栏字阶/空态与样机像素级仍有差距（本批：就地拍板气泡 + 折叠头像条 + sticky）  
- `/agent/cases/:id/docket` 仍为**期限台**（与案卷抽屉分名）；案卷走抽屉  
- 旧 lab 侧栏（sessions/bots）内部链未逐条改文案，靠顶条降权  
- 薄部厚作业、diff 审批闭环、⑥大厅期限催办、进入门槛硬挡 — 见 §7  

---

## 6. 边界与诚实

- 全站「都对齐」= 多批 commit；本文件是地图，不是一次改完的谎言。  
- lifecycle/pages 长 tip 与一期线框有历史拧；**冲突时认一期-产品逻辑 + 理念 + 节点**。  
- 右栏首批解决「跟谁聊」叙事；本批补按步主栏与大厅/软跳；精致度与工单/双轨仍要续刀。

## 修订

| 日期 | 说明 |
|---|---|
| 2026-10-30 | 首开：改口、真源屏、路由偏差表、P0–P2、首批右栏 |
| 2026-10-30 | 续批：P0②③④⑤ + P1 编制文案薄做；更新 §5 进度与仍剩 |
| 2026-10-31 | P1/P2 收口：projects 降权、④→⑤ 工单、案卷抽屉、实验室横幅、右栏去黄堆叠 |
| 2026-10-31 | 四维审计 + 样机高价值并入：就地拍板气泡、编制头像条、目标入口、多请示 sticky |


---

## 7. 四维落地审计 · 2026-10-31（真源对照）

> 真源：理念 / 一期节点 / 一期-产品逻辑（00–08·交互大纲·线框）· 业务逻辑说明。  
> **样机** `main-path-sample` 仅作 **pattern/code donor**，不作设计权威。

| 维度 | 状态 | 证据（apps/agent） | 诚实缺口 |
|---|---|---|---|
| **业务逻辑** | **partial → 主链 landed** | 八节点路由门在；④⑤⑥ 按步主栏 + 合格线分词；④→⑤ `DeptHandoffTicket`；⑦⑧ 薄同壳空态；案卷抽屉四页 | ①②③⑦⑧ 厚作业/真实零件未挂；官报通道无；业务深度仍 demo |
| **产品理念** | **landed（叙事）** | Novada Team 登录/欢迎/大厅；领导=当前用户（右栏拍板）；一套系统无部门门禁；八部可见；废「分诊」；交互语言专家/部门/请示 | 带教淡出 / 14 问 / 判断沉淀未试点；对外话术偶有旧 Agent 实验室链 |
| **产品设计** | **partial** | 编制折叠+头像条；主栏产物+右栏驾驭；硬请示汇报气泡（含就地确认/驳回）；⑤ ABC 步 pill；目标入口（写交底/递申请/答审查） | 像素级密度/字阶仍薄于样机；编制总览「让该部开工」专业页仍薄；diff 闭环未满 |
| **产品逻辑** | **主链 landed / 支路 partial** | 门槛·合格线文案上屏；pending 软跳右栏；三线分词工单；案卷材料/检查表/工单/判断痕迹；多项请示 sticky 跳转 | 进入门槛硬挡不全；⑥期限催办大厅薄；B1/B2/B5 等支路未全做 |

### 本批从样机并入（只读样机 → 写 apps/agent）

| 样机件 | 落点 |
|---|---|
| `agentReportBubble` + `askBubbleBodyHtml`（要你拍标签 · 展开依据 · 主钮） | `DeptAskReportBubble.tsx` · 右栏就地 `confirmItem`/`returnItem` |
| `askStickyHtml`（多项跳转 chip） | 右栏 `ask-sticky` |
| 编制折叠仍留 av-only 头像条 | `dept-right-experts[data-roster-folded=1]` |
| 大厅目标入口（写交底/递申请/答审查） | `HomePage` `home-goal-entries` |

**未并（有意）**：样机整页 HTML/CSS；density 三钮；钉顶同文确认卡；lifecycle 七部三 tab。


---

## 8. 三 skill 全站实渲扫描 · 2026-10-31（Asia/Shanghai）

> **开闸**：Leslie「服务启动了吗，把所有页面都扫一遍…用三个 skill 扫描」。  
> **三 skill**（`docs/各产品开发/内部skill/`）：  
> 1. `XINZHISHU_PRODUCT_PHILOSOPHY_SKILL`（理念 / 14 问）  
> 2. `RDI_PRODUCT_DESIGN_SKILL_V2`（产品设计 · 模式三既有评审）  
> 3. `RDI_ENGINEERING_DISCIPLINE_SKILL_V2`（工程纪律 · 真源/审计/回归/文档）  
> **四维对照**：业务逻辑 · 产品理念 · 产品设计 · 产品逻辑（真源＝一期节点 + 一期-产品逻辑 + 一期-产品理念；**不认** lifecycle 七部三 tab 作权威）。  
> **实现面**：`apps/agent` @ `fa415ba` · `feature/agent-company-shell`。**禁改** `main-path-sample`。  
> **服务**：`npm run dev:agent` → **http://localhost:5175/** · PID **43763** · 关键路由 HTTP **200**。  
> **方法**：Playwright（system Chrome channel）登录态实渲 **33 路由** + 登出态 welcome/login；截图 `/tmp/agent-scan-2026-10-31/`；源码交叉核验。本轮 **只扫+写 md**，未开大功能批。

### 8.1 四维总判（诚实）

| 维度 | 状态 | 一句话 |
|---|---|---|
| **产品理念** | **partial → 叙事 landed** | Novada / 领导=当前用户 / 八部大厅 / 废分诊 / 请示语言主路径已落；欢迎页与公司首页仍渗「七部」旧词；T4 依据链、T10 判断沉淀仍 demo 薄 |
| **产品设计** | **partial** | 同壳工作台+右栏负责人对话+⑤ABC+工单+案卷抽屉+目标入口有；编制总览专业页薄；diff/像素级仍薄于样机 |
| **产品逻辑** | **主链 partial / 支路 gap** | pending 软跳、合格线文案、④→⑤ 工单、案卷四页有；**大厅八部 vs 公司/侧栏七部双真源未清**；进入门槛硬挡、⑥催办、B 支路未满 |
| **业务逻辑** | **partial** | 八节点门牌+④⑤⑥按步示意有；①②③⑦⑧ 厚作业未挂；官报通道无；业务深度仍样机 demo |

**不可宣称「四维都落地」。** 主链叙事可演示；组织命名双真源与厚作业是本轮最大窟窿。

### 8.2 逐页证据（实渲）

| 路由 | 实渲要点 | 理念 | 设计 | 产品逻辑 | 业务逻辑 | 分级缺口 |
|---|---|---|---|---|---|---|
| `/agent/welcome`（登出） | Novada Team；文案「八个部门」；**仍印「七部货架」「企业走七部」**；货架是旧七站名 | partial | partial | gap 命名 | partial | **P1** 欢迎七部旧词 |
| `/agent/login`（登出） | Novada Team；角色二选一→大厅 | landed | landed | landed | n/a | — |
| `/agent` 大厅 | 待办·接待「不叫分诊」·目标入口（写交底/递申请/答审查）·**①～⑧ 八部门牌** | landed | landed | landed | landed 门牌 | — |
| `/agent/cases` · `/new` | 案盘/开案子；顶栏 NT | thin | thin | thin | thin | P2 |
| `/agent/cases/:id` 公司首页 | 「一案一家 Novada」；**本案部门仍七部**：交底/查新/立项/撰写/附图/递交/审查答复；`seven-dept-map` | **gap** 叙事拧 | partial | **P0 双真源** | **P0** 非老板八部 | **P0** |
| `…/depts/intake` ① | 薄同壳·合格线·要你拍；侧栏仍旧七部名 | partial | partial | partial | thin 空态 | P1 厚作业 |
| `…/inspire` ② | 同上 | partial | partial | partial | thin | P1 |
| `…/mining` ③ | 同上 | partial | partial | partial | thin | P1 |
| `…/disclosure` ④ | 合格线全绿·本步可交⑤·案卷·**④→⑤ 工单**·要你拍 | landed 壳 | landed 壳 | landed 壳 | demo 厚 | P1 T4/作业 |
| `…/draft` ⑤ | 本步 A·理解·ABC；顶栏烙印仍「撰写部」 | partial 名 | landed 步 | partial 名 | demo | **P0** 名 vs 申请部 |
| `…/oa` ⑥ | 同壳·要你拍；策略双选项示意级 | partial | partial | partial | demo | P1 催办/厚 |
| `…/annuity` ⑦ | 薄同壳；org 名「年费部」≠大厅「维护部」 | gap 名 | thin | gap 名 | thin | **P1** 命名 |
| `…/monetize` ⑧ | 薄同壳；org「成果转化部」≠大厅「复盘部」 | gap 名 | thin | gap 名 | thin | **P1** 命名 |
| `…?docket=1` 案卷抽屉 | 材料/检查表/工单/判断痕迹 demo | landed 壳 | landed 壳 | landed 壳 | demo | P2 密度 |
| `…?ticket=1` 工单 | ④→⑤ 工单可见 | landed | landed | landed | demo | — |
| `/agent/cases/:id/docket` | **期限台**（与抽屉分名） | ok 分名 | thin | ok | thin | P2 |
| `/agent/pending` | 文案「点条目会软跳回工作台」；条目链 `…/depts/…?ask=` | landed | landed | landed | n/a | — |
| `/agent/pending?audit=1` | 薄审计面保留 | landed | landed | landed | n/a | — |
| `/agent/departments` | 「专业/编制」；**「公司首页七部」**旁路文案 | gap | thin | gap | n/a | **P1** |
| `/agent/projects` | 顶条「项目（旁路）」回大厅 | landed 降权 | ok | ok | n/a | — |
| `/agent/lab`·`sandbox`·`sessions`·`compose`·`harness`·`agents`·`team` | `LabRouteBanner` 实验室/遗骸 | landed 降权 | ok | ok | n/a | P2 内文 |
| `/agent/assets`·billing·members | 后勤旁路 | thin | thin | thin | thin | P2 |

### 8.3 三 skill 过闸（既有评审三态）

#### A. 理念 14 问（Philosophy）

| ID | 判定 | 证据 |
|---|---|---|
| T1 员工还是工具 | **有（主路径）** | 大厅/工作台按部门·专家·请示；实验室路由已降权 |
| T2 带团队拍板 | **有** | 右栏「要你拍」+ `DeptAskReportBubble` 就地确认/驳回 |
| T3 组织能力 | **有（叙事）** | Novada Team · 八部；非模型参数卖点 |
| T4 依据链【P0】 | **弱 / 近否** | 气泡可展开依据示意；缺完整「结论+来源+推演+对比」可签字密度 → **不宣称过 T4** |
| T5 该到面前 | **有（主闸）** | pending→`?ask=` 软跳；大厅待办 |
| T6 质检检查点 | **部分** | ④⑤ 合格线/步 pill；真实质检零件未挂 |
| T7 带教淡出 | **无/弱** | 未见可淡出脚手架 |
| T8 Agent 风格 | **弱** | 编制头像条有；风格句薄 |
| T9 低置信示弱 | **弱** | 案卷置信 demo；未系统化 |
| T10 过程数据【P0】 | **弱** | 判断痕迹抽屉有名；沉淀/偏好未闭环 → **不宣称过 T10** |
| T11～T14 | **弱/不适用一期** | 成长/生态未试点 |

#### B. 产品设计五步（模式三快答）

| 步 | 有/无/弱 | 注 |
|---|---|---|
| 定任务 | **有** | 八节点真源 + 大厅目标入口 |
| 定分工 | **弱** | 大厅八部 vs org/公司七部 **打架** |
| 定协同 | **有（壳）** | 右栏负责人对话；1:1/工具次 |
| 定权责 | **部分** | 硬请示在右栏；进入门槛硬挡不全 |
| 定健康 | **弱** | 成本/成长账单未上屏 |

#### C. 工程纪律四项

| 纪律 | 判定 | 注 |
|---|---|---|
| 真源管理 | **否（P0）** | 文档真源=老板八部；运行时 `MAIN_CHAIN_DEPT_IDS`/`seven-dept-map`/侧栏仍 lifecycle 七部 → **双真源** |
| 审计留痕 | **部分** | 软跳+判断痕迹抽屉；真审计链 demo |
| 回归验证 | **有（窄）** | pending/confirmGate/mainChainWalk 等单测绿（前批 17/17）；本轮未重跑 |
| 文档同步 | **本文件更新中** | 扫描与代码同日；欢迎/公司页文案未跟八部 |

### 8.4 Top P0 / P1 / P2（跨页）

#### P0（必须先清，否则「对齐」是假的）

1. **组织命名双真源**：大厅 `hallDepts`＝老板①～⑧；公司首页 `MAIN_CHAIN_DEPTS` + 侧栏 + ⑤顶栏「撰写部」＝旧上手七部。须统一到一期八部（或明示映射层），并改掉 `seven-dept-map` / 「七部」文案。  
2. **T4 依据链达不到签字级**（理念 P0）：④⑤⑥ 硬请示仍缺完整来源/推演/对比密度。  
3. （并列观察，非本轮新发现）**官报递交/真检索/真鉴权**仍不在范围——保持诚实标注，勿当已落地。

#### P1

1. 欢迎页「七部货架 / 企业走七部」→ 改八部叙事。  
2. `/agent/departments`「公司首页七部」文案。  
3. ⑦⑧ 对外名：大厅「维护/复盘」vs org「年费/成果转化」对齐。  
4. ①②③⑦⑧ 厚作业/真实零件（现仅合格线空态）。  
5. 进入门槛硬挡；⑥大厅期限催办；diff 审批闭环。  
6. 编制总览「让该部开工」专业页做满。

#### P2

1. 右栏/主栏像素级精致度（相对样机）。  
2. lab 内页旧 Agent 文案逐条清洗（顶条已降权）。  
3. 案卷抽屉密度；assets/billing/members 薄后勤。  
4. T7～T14 带教/成长/生态。

### 8.5 与 §5/§7 进度关系

- §5 所列 P0～P2 **壳级项**（右栏、按步、软跳、大厅八部、Novada、工单、案卷抽屉、实验室横幅、就地拍板）——**实渲确认仍在**。  
- §7 四维「主链 landed」须降级口径：**壳 landed；命名真源与厚作业未 landed** → 见上表 **partial**。  
- 下一刀建议（仅记录，本轮未做）：先打 P0① 八部单一真源贯穿公司首页/侧栏/dept 顶栏/欢迎，再补 T4 依据链组件。

### 8.6 修订

| 日期 | 说明 |
|---|---|
| 2026-10-31 09:45 CST | 三 skill 全站实渲；服务 PID 43763；33 路由；§8 诚实降级双真源为 P0 |
