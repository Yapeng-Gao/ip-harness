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
| 2026-10-31 约 10:00 CST | §9：P0/P1 全量优化落地（八部真源·T4·门槛·催办·厚作业·diff） |

## 9. P0/P1 全量优化落地 · 2026-10-31（Asia/Shanghai）

> **开闸**：Leslie「优化下，所有问题都优化」· 在 Mac `ip-harness` / `feature/agent-company-shell` 改 `apps/agent`（禁改 main-path-sample）。

### 9.1 对照 §8 Top 缺口

| 缺口 | 落地 |
|---|---|
| **P0① 双真源命名** | `MAIN_CHAIN_DEPT_IDS` → 一期八部（intake→inspire→mining→disclosure→draft→oa→annuity→monetize）；公司首页 `eight-dept-map`；侧栏「本案八部」；欢迎/货架/departments/App 文案去「七部」；对外名：申请部/答复部/维护部/复盘部（覆盖旧撰写/年费/成果转化） |
| **P0② T4 依据链** | 新增 `askEvidence.ts` 四件套（结论·来源·推演·对比）；`DeptAskReportBubble` 展开依据链；缺段明示、禁一键全绿；种子确认补来源/对比 |
| **P0③ 官报/真检索/真鉴权** | **未装假**；进入门槛/催办/薄部作业均标「演示·非官报」 |
| P1 欢迎七部文案 | 货架/场景改「八部」；`HOME_CHAIN_STATIONS` 八站 |
| P1 departments 七部 | 「公司首页八部」+「让该部开工」八部门牌 |
| P1 ⑦⑧ 命名 | org 维护部/复盘部 与大厅对齐 |
| P1 ①②③⑦⑧ 厚作业 | `THIN_LINE_BY_DEPT.workBody` 主栏示意作业（非空壳） |
| P1 进入门槛硬挡 | `entryGate.ts` + 工作台顶栏硬挡条（⑤⑥⑦）；`?gate=bypass` 仅演示旁路 |
| P1 ⑥催办 | 大厅 `home-oa-nudge` |
| P1 diff 闭环 | 版本材料「认可此版写回 / 保持当前稿」示意闭环 |
| P1 专业页 | departments「让该部开工」八部入口 |

### 9.2 四维复判（本批后）

| 维度 | 状态 | 注 |
|---|---|---|
| 产品理念 | **叙事 landed / T4 partial→可演示** | 八部单一真源贯穿；T4 四件套上屏，仍为演示密度 |
| 产品设计 | **partial↑** | 厚作业示意+编制开工入口；像素级仍薄于样机 |
| 产品逻辑 | **主链 landed↑ / 支路 partial** | 门槛硬挡+催办+diff 示意；B 支路未全 |
| 业务逻辑 | **partial↑** | 门牌/合格线/示意作业齐；官报/真检索仍不在范围 |

### 9.3 验证

- `npm run typecheck -w @ip/agent` PASS
- node tests：pending / confirmGate / mainChainWalk / homeContentPreview / deptRoster / entryGate / askEvidence / casePlanDrive → **54/54**
- 验收：`npm run dev:agent` → http://localhost:5175 （硬刷）

### 9.4 修订

| 日期 | 说明 |
|---|---|
| 2026-10-31 约 10:00 CST | §8 P0/P1 全量优化落地记入 §9 |

## 10. 三 skill 复扫 · 2026-10-31（Asia/Shanghai · `3006b4d` 后）

> **开闸**：Leslie「继续扫描」· 扫面=`apps/agent` · **禁改** `main-path-sample` · 本轮 **只扫不写大功能**。  
> **三 skill**：`XINZHISHU_PRODUCT_PHILOSOPHY_SKILL` + `RDI_PRODUCT_DESIGN_SKILL_V2` + `RDI_ENGINEERING_DISCIPLINE_SKILL_V2`（`docs/各产品开发/内部skill/`）。  
> **真源**：`docs/产品-老板思路/一期节点` + `一期-产品逻辑`（八部）；**不认** lifecycle 七部三 tab。  
> **服务**：`http://localhost:5175/` · PID **43763** · HTTP **200**（复扫全程未重启）。  
> **HEAD**：`3006b4d` `feat(agent): §8 P0/P1 全量 — 八部单一真源·T4依据链·门槛·催办·厚作业` · 分支 `feature/agent-company-shell`。  
> **方法**：Playwright（Chrome channel）实渲 **33 路由** + 硬请示/门槛深挖；localStorage `ip-agent-auth-session=1` · `entry-role=enterprise`。

### 10.1 四维总判（诚实）

| 维度 | 状态 | 一句话 |
|---|---|---|
| **产品理念** | **叙事 landed / T4 结构 landed·密度 demo / T10 still partial** | Novada·领导拍板·八部·废分诊独立页叙事在；硬请示气泡已挂 T4 四件套+禁一键全绿；判断痕迹有抽屉、沉淀/偏好未闭环 |
| **产品设计** | **partial** | 同壳工作台+ABC+工单+案卷+编制「让该部开工」齐；像素/专业页密度仍薄于样机；右栏气泡可演示 |
| **产品逻辑** | **主链 landed↑ / 支路 partial** | 八部单一真源贯穿大厅/公司/侧栏/换部/编制；pending 软跳工作台；进入门槛硬挡可验；B 支路/真 diff/官报仍未满 |
| **业务逻辑** | **partial** | ①～⑧门牌+④⑤⑥硬请示 demo 厚；①②③⑦⑧ 为 `workBody` 示意作业；官报/真检索/真鉴权 **诚实不在范围** |

**不可宣称「四维都落地」。** §8 的 P0①双真源、P0②T4 组件 **本轮复扫未回归**；剩余窟窿下沉为厚作业密度、T10 闭环、支路与真通道。

### 10.2 先验 §9 P0 回归（必须先过）

| 项 | 结果 | 证据 |
|---|---|---|
| **P0① 双真源八部** | **PASS · 未回归** | 33 路由 body **零「七部」**、**零「撰写部」**；公司 `data-testid=eight-dept-map`；大厅 `home-eight-depts`；编制 `departments-eight-doors`；侧栏/换部名为立项/激发/挖掘/交底/**申请**/答复/**维护**/复盘 |
| **P0② T4 四件套** | **PASS · 未回归** | 硬请示气泡 `ask-more` + `ask-t4-{conclusion,source,reasoning,contrast}` + `ask-t4-ready-tag「四件齐（演示）」` + honesty「无来源/推演/对比不得装可签字 / 不提供一键全绿」。验：`…/sensor-pack/depts/draft?ask=bcf-seed-claims`、`…/oa-filed/depts/oa?ask=bcf-seed-oa-strategy` |
| **进入门槛硬挡** | **PASS** | `layout-flywheel/depts/draft` →「⑤ 进入门槛未过」+ `dept-entry-gate-fix`；`edge-scheduler/depts/annuity` →「⑦ 进入门槛未过」；满足态文案「进入门槛已满足（演示）」 |
| **⑥催办** | **PASS** | 大厅 `home-oa-nudge` / `home-oa-nudge-cta` 可见 |
| **官报/真鉴权** | **诚实未装假** | 门槛/催办均标演示·非官报 |

单元：askEvidence / entryGate / homeContentPreview / confirmGate / mainChainWalk / pendingDeptQuery → **33/33 PASS**（本轮抽跑）。

### 10.3 逐页快扫（33 路由 · 实渲）

| 路由 | 理念 | 设计 | 逻辑 | 业务 | 备注 |
|---|---|---|---|---|---|
| `/agent/welcome` | landed 八部货架 | thin | ok | n/a | 无「七部」 |
| `/agent/login` | Novada | ok | ok | n/a | 已登录态仍可开 |
| `/agent` 大厅 | landed | landed 壳 | landed | demo | 八部门牌+接待+催办+目标入口 |
| `/agent/cases` | ok | thin | ok | thin | 列表 |
| `/agent/cases/new` | ok | thin | ok | thin | |
| `/agent/cases/:id` 公司 | landed 八部图 | landed 壳 | landed | demo | `eight-dept-map` |
| `…/intake`① | partial | partial | ok | workBody 示意 | 侧栏八部；可有依据链示意 |
| `…/inspire`② | partial | partial | ok | workBody | |
| `…/mining`③ | partial | partial | ok | workBody | |
| `…/disclosure`④ | landed 壳 | landed | landed 工单 | demo 厚 | 合格线·案卷·④→⑤工单；已完成案可无在途硬请示 |
| `…/draft`⑤ | landed 名=申请部 | landed ABC | landed 门槛 | demo | 有在途确认时 T4 全开 |
| `…/oa`⑥ | landed | landed | landed | demo | T4 四件齐可验 |
| `…/annuity`⑦ | landed 名=维护部 | partial | **门槛硬挡可验** | workBody | 未递交案硬挡 |
| `…/monetize`⑧ | landed 名=复盘部 | partial | ok | workBody | |
| 辅链 research/figure/filing | ok 降权 | thin | ok | demo | 仍可达；非主链八部 |
| `…/docket`·billing·members·room | thin | thin | thin | thin | 后勤/房间 |
| `/agent/pending` | ok 软跳 | thin 页仍在 | landed 链 | n/a | 行链 `?ask=` 进工作台；`?audit=1` 审计面 |
| `/agent/departments` | landed 八部 | partial | landed 旁路 | n/a | 「让该部开工」 |
| `/agent/projects` | landed 降权 | ok | ok | n/a | 旁路条幅 |
| lab/sandbox/sessions/compose/harness/agents/team | landed 实验室横幅 | thin 内文 | ok | n/a | P2 内文清洗 |
| `/agent/assets` | thin | thin | thin | thin | P2 |

### 10.4 三 skill 过闸（模式三 · 有/无/弱）

#### A. 理念 14 问

| ID | 判定 | vs §8 | 注 |
|---|---|---|---|
| T1 员工还是工具 | **有** | 持平↑ | 部/专家/请示主路径 |
| T2 带团队拍板 | **有** | 持平 | 右栏要你拍 + 就地确认/驳回 |
| T3 组织能力 | **有** | **↑** | 八部单一真源，不再渗七部 |
| T4 依据链【P0】 | **有（演示密度）** | **↑** §8 弱→本轮结构过 | 四件套 DOM 齐；**不宣称**真签字级材料密度 |
| T5 该到面前 | **有** | 持平 | pending→工作台 `?ask=` |
| T6 质检检查点 | **部分** | 持平 | 合格线/步 pill；真质检零件未挂 |
| T7 带教淡出 | **弱** | 持平 | 未见可淡出脚手架 |
| T8 Agent 风格 | **弱** | 持平 | 编制头像有；气泡内仍见「撰写专家」旧岗称呼 |
| T9 低置信示弱 | **弱** | 持平 | 案卷置信 demo |
| T10 过程数据【P0】 | **弱 / 近否** | 持平 | 判断痕迹 Tab 有；确认→偏好沉淀未闭环 → **仍不宣称过 T10** |
| T11～T14 | **弱/不适用一期** | 持平 | |

#### B. 产品设计五步

| 步 | 判定 | 注 |
|---|---|---|
| 定任务 | **有** | 八节点真源 + 大厅目标入口 |
| 定分工 | **有（↑）** | 大厅/公司/侧栏/编制八部对齐；辅链仍可达 |
| 定协同 | **有（壳）** | 右栏负责人对话；1:1/工具次 |
| 定权责 | **有（↑）** | 硬请示+进入门槛硬挡可验 |
| 定健康 | **弱** | 成本/成长账单未上屏 |

#### C. 工程纪律四项

| 纪律 | 判定 | 注 |
|---|---|---|
| 真源管理 | **有（↑）** | 运行时 `MAIN_CHAIN_DEPT_IDS`=一期八部；UI 无七部；代码注释仍留「上手七部」历史句（非 UI） |
| 审计留痕 | **部分** | 软跳+判断痕迹+ T4 honesty；真审计链 demo |
| 回归验证 | **有（窄）** | 本轮抽测 33/33；前批宣称 54/54 未全量重跑 |
| 文档同步 | **本文件 §10** | 与 `3006b4d` 对齐 |

### 10.5 Top P0 / P1 / P2（本轮诚实清单）

#### P0（新 · 必须先清才敢喊「理念过闸」）

1. **T10 判断沉淀未闭环**【沿用理念 P0】：案卷「判断痕迹」可展示种子；确认/驳回理由 → 偏好/规则资产写回仍缺 → **不宣称过 T10**。  
2. （并列观察，非回归）**官报递交 / 真检索 / 真鉴权**仍不在范围——保持演示标注，勿当已落地。

> §8 的「双真源」「T4 无组件」**本轮关闭且未回归**，不再列 P0。

#### P1

1. ①②③⑦⑧ 厚作业仍偏 `workBody` 示意文本，缺可点零件（对照一期节点各部交付物）。  
2. 硬请示 T4 **仅挂在 confirm 气泡**；G1/软请示无四件套（结构缺口）。  
3. B 支路（代理所陪同/回④等）未全。  
4. 版本「认可此版写回」为示意闭环，非可批真 diff。  
5. 专家对外称呼残留「撰写专家」等旧岗名（部名已改申请部）。  
6. `/agent/pending` 独立页仍在（链接已软跳）；可再收成铃铛/右栏唯一入口。  
7. 像素级右栏/主栏精致度相对 main-path-sample 仍薄。

#### P2

1. lab/sandbox/sessions/… 内页旧 Agent 文案逐条清洗（顶条已降权）。  
2. assets / billing / members 薄后勤。  
3. T7～T9 / T11～T14 带教·风格·成长·生态。  
4. 代码注释「上手七部」可改「历史辅链」以免误导后来扫码者。

### 10.6 与 §8 / §9 关系

| 来源 | 本轮 |
|---|---|
| §8 P0① 双真源 | **已关闭 · 复扫 PASS** |
| §8 P0② T4 组件 | **已关闭 · 复扫 PASS（演示密度）** |
| §9 门槛/催办/厚作业/编制开工 | **实渲仍在** |
| 四维口径 | 维持 §9「主链↑ / 仍 partial」；**不升格为四维 landed** |

### 10.7 修订

| 日期 | 说明 |
|---|---|
| 2026-10-31 09:55–10:00 CST | 三 skill + Playwright 33 路由复扫；服务 PID 43763；写入 §10；无大功能改码 |

## 11. §10 缺口行为落地（语义对齐 · 2026-10-31）

> **原则（本轮硬条）：** 对齐业务逻辑 / 产品理念 / 产品设计 / 产品逻辑的**机制**，不靠换文案交差。官报 / 真检索 / 真鉴权保持诚实「不在范围」。样机 `main-path-sample` 只移植行为模式，未改样机文件。

### 11.1 四维 · 行为是否匹配真源意图

| 维度 | 本轮行为变化 | 仍诚实 stub |
|---|---|---|
| **产品理念** | **T10 闭环可验**：硬请示确认/驳回 → `buildJudgmentFromConfirm` 写入案卷「判断档案」（结论/选项/理由/依据锚/置信/认风险）；可「写入偏好列表 / 跨案偏好」。T4 仍挂硬请示；**G1 齐套气泡同样挂四件套**（缺项=缺口，禁一键全绿）。岗名跟八部：建议者「申请专家」。 | 偏好非真知识库；带教淡出 T7 未做；Agent 风格 T8 薄 |
| **产品设计** | ①②③⑦⑧ 主栏改为**可点零件**（项目卡/路径卡/创新点表/台账/复盘五块），非纯 `workBody` 长文；版本认可前展示**行级 diff**（+/− 统计）；右栏确认须填理由+可选认风险。 | 像素级右栏仍薄于样机；专业页辅链薄 |
| **产品逻辑** | **B1–B8 支路门**上大厅（须看见/禁止假装文案）；B2 企业无交底 → `b2-block`+回④；**仅 agency+escort 陪同绕 B2**（不装交底过线）；B5 不申结案写判断档案且明示不出申请号；B7 只读不拍写档案；B8 资产页情报官入口。`/agent/pending` 无 audit → **软跳大厅**（拍板主路径=工作台右栏）。 | 支路多为入口+语义挡板，非全链路状态机；官报催办仍演示 |
| **业务逻辑** | 八部单一真源保持；进入门槛硬挡+代理陪同差异兑现；④→⑤ 工单/案卷/合格线未回退；判断档案替代「只展示种子痕迹」。 | ①②③⑦⑧ 零件仍演示密度；真递交/真检索不在范围 |

**仍不可宣称「四维 landed」。** 主链行为↑；T10 从「弱/近否」升到**演示可闭环**；支路从「未全」升到**门可见+关键闸可验**。

### 11.2 §10 Top 对照

| §10 项 | 本轮 |
|---|---|
| P0 T10 判断沉淀 | **行为落地**：Context 持久化 `judgments`/`preferences`；确认/驳回写回；抽屉「判断档案」+沉淀按钮（`judgment-item` / `pref-precip` / `pref-saved`） |
| 官报/真鉴权 | **未装假** · 门槛/催办/B8 均标演示 |
| P1 厚作业 | ThinDeptWorkPanel 可点零件 |
| P1 T4↔G1 | G1 `ask-more` + `ask-t4-*` |
| P1 B 支路 | `home-branch-doors` B1–B8；B2/B5/B7/陪同 |
| P1 真-er diff | `lineDiff` 行级对照后写回 |
| P1 撰写专家 | 建议者/编制岗改为**申请专家**（跟申请部语义，非裸替换交差） |
| P1 pending 独立页 | 无 `audit` → Navigate `/agent?pending=1` |
| P2 lab/后勤/注释 | Lab 横幅强化；billing/members 后勤薄条；「上手七部」注释→历史辅链 |

### 11.3 验收

```bash
cd apps/agent && npm run typecheck
node --import tsx --test src/business/*.test.ts   # 142/142
npm run dev:agent   # http://localhost:5175/
```

关键路径：任意硬请示 → 确认（填理由）→ 案卷「判断档案」见新条目 → 可沉淀偏好；企业进⑤无交底见 `b2-block`；代理「陪同进⑤」；大厅支路门；版本另存后点版本见 diff。

### 11.4 修订

| 日期 | 说明 |
|---|---|
| 2026-10-31 CST | §10 全量行为落地；写入 §11；只改 `apps/agent` + 本扫描 md |

## 12. 原型保真续批 · 行为对齐（2026-10-31 Asia/Shanghai）

> **原则：** 对齐文档**机制**（业务/理念/设计/产品逻辑），不靠换文案。官报 / 真检索 / 真鉴权保持诚实「不在范围」。只改 `apps/agent`；样机只读移植。

### 12.1 本批行为落地

| §11 仍短 | 本批机制 |
|---|---|
| ①②③⑦⑧ 厚作业密度 | `ThinDeptWorkPanel` 分步：进入检查表 → 主作业可点零件+明细 → 结束合格线面板 |
| 右栏像素/对话 | composer「对：…」钉底条；ask-sticky/气泡 CSS；编制折叠保留；风格标签挂身份行 |
| 偏好沉淀可读可写 | `preferenceStore` 独立 localStorage 仓；案卷抽屉可手写/删除；进部挂偏好提示；沉淀写回仓 |
| B1–B8 门后流 | `BranchFlowPanel`：B1短收件、B2退④、B3拒查新绕过、B4短收件、B6超期三拍、B8情报须看见；B5/B7 沿用主栏 |
| T7 带教淡出 | `TeachingFadeTip` 首次说明+「知道了」；大厅「重开部门说明」 |
| T8 Agent 风格 | `agentStyle` 八部风格句；岗名「撰写专家」→「申请专家」 |
| 实验室/后勤薄 | Lab 横幅加闸说明；成员页演示角色表+禁用邀请；B8 资产须看见/禁假装 |

### 12.2 四维 · 行为是否匹配真源意图

| 维度 | 本轮 | 仍诚实 stub |
|---|---|---|
| **产品理念** | T7 可淡出可重开；T8 风格可见；T10 偏好仓可读可写（演示 KB） | 非真知识库/非带教引擎；官报不在范围 |
| **产品设计** | 薄部分步零件+明细；右栏 composer-to+风格；支路进部后面板 | 像素级相对样机仍可再抠；专业辅链薄 |
| **产品逻辑** | B 门后演示流加深；进入检查在薄部可勾；后勤明示非主路径 | 支路≠完整状态机；无真 IAM |
| **业务逻辑** | 八部合格线/门槛/工单/判断未回退；厚作业示意加密度 | 厚作业仍 demo；无真官报/鉴权/检索 |

**不宣称四维都落地。**

### 12.3 验收

- `npm run typecheck -w @ip/agent` PASS
- `node --import tsx --test src/business/*.test.ts` → **147/147**
- 硬刷 `http://localhost:5175/`：①进部见带教→知道了；主栏三步；案卷偏好仓；支路 `?branch=b1|b6`；大厅重开说明

### 12.4 修订

| 时 | 记 |
|---|---|
| 2026-10-31 CST | §11 续批原型保真；写入 §12；只改 apps/agent + 本扫描 md |

## 13. 原型保真续批 · 右栏/厚步/支路（2026-10-31 Asia/Shanghai）

> **原则：** 对齐文档**机制**（业务/理念/设计/产品逻辑），不靠换文案。官报 / 真检索 / 真鉴权保持诚实「不在范围」。只改 `apps/agent`；样机只读移植。

### 13.1 本批行为落地

| §12 仍短 | 本批机制 |
|---|---|
| 右栏像素/对话 | ask-sticky 琥珀钉顶（多样机）；`DeptAskReportBubble` 汇报气泡琥珀描边+光晕；编制横滑；composer 钉底渐变；身份行保留风格标签 |
| ④⑤⑥ 厚作业 | 新 `ThickStepWorkPanel`：成稿块/事实卡/质检绿黄红切换/可交⑤/ABC 对照/申不申/递交包/争点/策略/答复稿块 — 可点留痕，拍板仍在右栏 |
| ①②③⑦⑧ 密度 | `ThinDeptWorkPanel` 增加「材料挂接」勾选 + 结束线材料汇总/交接下站提示 |
| B 支路加深 | B1/B2 可勾检查解锁开干；B4 须挂接申请文件；B6 期限条；B5 结案证明「申请号—不出」；B8 须看见清单 |
| 诚实边界 | 无假官报/真鉴权；厚/薄仍标演示 |

### 13.2 四维 · 行为是否匹配真源意图

| 维度 | 本轮 | 仍诚实 stub |
|---|---|---|
| **产品理念** | 硬请示汇报气泡视觉贴近「要你拍」；T4/G1/T10 未回退 | 非真知识库；官报不在范围 |
| **产品设计** | 右栏 sticky/气泡/composer/编制再抠一刀；④⑤⑥ 主栏可点零件 | 像素仍略薄于样机整页；专业辅链薄 |
| **产品逻辑** | B 门后检查可验（勾齐才开干）；B5 不出申请号可见 | 支路≠完整状态机 |
| **业务逻辑** | 八部/门槛/工单/判断未回退；厚步+薄部密度↑ | 厚作业仍 demo；无真递交 |

**不宣称四维都落地。**

### 13.3 验收

- `npm run typecheck -w @ip/agent`（或 `cd apps/agent && npm run typecheck`）
- `node --import tsx --test src/business/*.test.ts`
- 硬刷 `http://localhost:5175/`：④质检点绿黄红；右栏多项 sticky 琥珀；`?branch=b1` 勾齐开干；`?branch=b5` 见申请号—；薄部材料挂接

### 13.4 修订

| 时 | 记 |
|---|---|
| 2026-10-31 CST | §12 续批：右栏保真·ThickStep·B支路加深·薄部材料；写入 §13；只改 apps/agent + 本扫描 md |
