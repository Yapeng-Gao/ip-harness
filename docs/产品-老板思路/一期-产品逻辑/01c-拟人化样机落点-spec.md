# Spec：拟人化样机落点（对照补充条款 A–K）

> **状态**：方案可评 · **样机已落**（波次 1–4）；未验证 · 试点可回写条款  



> **理念真源**：[`../一期产品理念·补充条款.md`](../一期产品理念·补充条款.md)（A–K）· [`../一期-产品理念.md`](../一期-产品理念.md)  
> **交互**：[`交互大纲.md`](交互大纲.md) · 前台细节见 [`01b`](01b-进门登记与前台引导-spec.md)  
> **工程面**：`apps/agent` 样机；演示密度，非真鉴权 / 真记忆服务 / 真质检引擎  
> **本文钉什么**：条款 → **改哪一屏 / 什么数据 / 什么组件 / 验收句**；波次与不做清单  
> **本文不钉**：高保真视觉、多租户、DSH 审批实现细节；不改补充条款权威

---

## 0. 一句话

**组织拟人 = 权责 / 记忆边界 / 移交不断层 / 领导看得见运转；不是头像会聊天。**  
样机把补充条款落到可点的屏上；冲突回写补充条款，不假装补篇已验证。

---

## 0.1 文档与 IA 定案（防再扯皮）

| 议题 | 定案 |
|---|---|
| 登录落点 | 仍 `/agent` **大厅**（前台 + 八部） |
| E「待我拍板=主视图」 | 落在左栏 **`/agent/pending`** 加厚为驾驶舱三视图；**不**取代大厅进门 |
| 前台主路径 | 沿用 01b **desk-line**（来意主、附件次）；本 spec 补 **J2 领进无损** |
| 决策账本 | 产品名对外可用「决策账本」；工程继续用 `JudgmentRecord` / 判断档案，UI 双标 |
| 头像 H1 | 符号化（色+字）；去掉写实照片依赖 |
| 不做本轮 | A 全量双人接管、C 四层记忆服务、F KPI 看板、真三级质检引擎、全八部工单状态机 |

```
登录 →（L2 可跳过）→ 大厅
                      ├─ 前台领进 ──J2──→ 部台收件条 → 办稿/请示 → 移交J3
                      └─ 八部/项目直达（计绕过，本轮不计 KPI 数）
左栏「待办」→ 驾驶舱三视图（E）→ 点进部台汇报气泡
硬请示确认/退回 → 判断档案（D）
```

---

## 1. 条款总表（样机落点）

| 条款 | 本轮样机 | 主表面 | 波次 |
|---|---|---|---|
| A 拍板权 | **薄示意已落**：壳「当前拍板人：你」；不做接管三选一 | AgentShell | 薄 ✓ |
| B 请示分级 | **薄已落**：硬请示气泡标「L2 请示」；岗表不新做编制后台 | DeptAskReportBubble | 薄 ✓ |
| C 记忆分层 | **不做服务**；J2 接待意图写入 progress，收件条标「项目记忆示意」 | receptionHandoff | 1 ✓ |
| D 决策账本 | 判断档案双标 + 驾驶舱「已交付回查」 | CaseFileDrawer / pending | 2–3 ✓ |
| E 领导驾驶舱 | `/agent/pending` 三 Tab 加厚 | BossTodoInboxPage | 2 ✓ |
| F 前台 KPI | **占位条已落**（分诊/引导/绕过 —）；非真统计 | pending 脚注 | 2 ✓ |
| G 人设卡 | purpose + refuses 上屏；④⑤⑥ 人名；右栏人设一行 | dept 顶栏/右栏 | 1+4 ✓ |
| H 外观 | **风格化同事肖像** · 部色配饰 · 状态情境驱动 | ExpertAvatar / roster | 4 ✓ |
| I 情感 | 退回/移交模板；禁共情句 | hitlReturn / handoff | 3 ✓ |
| J 移交 | J2 收件 + J3 话术；J1/J4 借现回流 | reception + handoff | 1+4 ✓ |
| K 质检 | 层级标签示意 | ThickStep / HitlAssist | 3 ✓ |

---

## 2. 波次 1 · J2 上下文无损 + G 边界（优先）

### 2.1 数据契约 · `ReceptionHandoff`（新建）

落点建议：`apps/agent/src/business/receptionHandoff.ts`  
持久化：挂 `CaseProgress`（或旁路 `localStorage` keyed by caseId；**优先 progress 字段**以便部台同源）。

```ts
type ReceptionHandoff = {
  at: string                 // ISO
  goalText: string           // 用户来意（可空若仅附件）
  selectedSlug: string       // 确认领进的部门 slug
  primarySlug: string        // 主推
  altSlugs: string[]         // 备选
  fileNames: string[]
  roughGaps: string[]
  intents: string[]          // 来自 receptionSuggest
  reason: string
  /** 用户是否改选了非主推 */
  overriddenPrimary: boolean
}
```

**写入时机（钉死无案路径）**：

| 条件 | 行为 |
|---|---|
| 有 `latestCaseId` | `setReceptionHandoff(caseId, payload)` → `navigate(dept?reception=1)` |
| 无案 | 写入 `sessionStorage` 键 `ip-agent-reception-pending-v1` → `navigate(/agent/cases/new?after=reception)`；**建案成功**后读 pending → 写入新案 `progress.receptionHandoff` → 跳转 `selectedSlug?reception=1` 并清 pending |

说明：现 `hallDeptHref(undefined)` 已落到 `/agent/cases/new`；本波显式带 `after=reception` + pending，避免开案后丢失来意。

**读取时机**：`BusinessCaseDeptPage` 当 `progress.receptionHandoff?.selectedSlug === 当前部 slug`（`?reception=1` 仅作高亮/展开提示，**不以 query 为唯一真相**）。

**折叠**：收件条「知道了」仅 UI 本地折叠（`useState`）；**不**清 progress，刷新可再展开。禁止再问用户复述来意。

对照：`progress.delegate` = 助手委托链；**接待意图另字段 `receptionHandoff`**，勿混入 `delegate.chain`。

### 2.2 UI · 部台收件条（J2）

| 项 | 规格 |
|---|---|
| 位置 | 部台中栏顶或右栏负责人下；`data-testid="dept-reception-intake"` |
| 标题 | 前台已交代（小林） |
| 正文 | 来意一句；材料名（若有）；粗缺口 |
| 次文 | 「不必再复述；缺的在部内补」 |
| 关闭 | 可「知道了」折叠；progress 仍保留供回看 |

### 2.3 UI · G 边界上屏

扩展 `DeptHandoffCopy`：

```ts
refuses: string  // 一句「不办：…」
```

凡 `DEPT_HANDOFF` 有条目的部均必填 `refuses`（稿，可再打磨）：

| 部 | refuses（稿） |
|---|---|
| ①立项 | 不做交底撰写；不代替申请过线 |
| ②激发 | 不代替交底成稿；选题可跳过须留痕 |
| ③挖掘 | 不代替交底全绿；不对外递交 |
| ④交底 | 不拍板申不申；不代替申请部过线 |
| ⑤申请 | 不替领导做技术取舍；对外提交必经硬请示 |
| ⑥答复 | 不擅自对外发文；策略须你点头 |
| ⑦维护 | 不改权项策略；期限动作须可见 |
| ⑧复盘 | 不做日常办案主笔；维持/放弃须拍或只读留痕 |
| 前台（非部） | 只领路与粗分诊；不代替部内合格线 |

**部台展示**：合格线旁或负责人下：  
`本职：{purpose}` · `不办：{refuses}`  
`data-testid="dept-persona-boundary"`

**前台卡**：idle 说明末补半句边界（已有 desk-line 则追加，不恢复气泡）。

### 2.4 波次 1 改码清单

| # | 文件 | 动作 |
|---|---|---|
| 1 | `receptionHandoff.ts`（新） | 类型 + read/write helpers |
| 2 | `BusinessCaseContext.tsx` | `CaseProgress.receptionHandoff?`；setter |
| 3 | `HomeReceptionGuide.tsx` | confirmGo 写入 |
| 4 | `BusinessCaseDeptPage.tsx` | 收件条 + 读 query/progress |
| 5 | `deptPageNarrative.ts` | 各部 `refuses`；UI 绑 purpose+refuses |
| 6 | 单测 | write/write roundtrip；override 标记 |

### 2.5 验收 · 波次 1

| # | 期望 |
|---|---|
| J2-1 | 有案时前台确认领进 → 部台见来意/缺口，无需重打字 |
| J2-2 | 刷新部台 URL 去 `reception=1` 后，progress 仍能回显收件（若未清） |
| G-1 | ④⑤⑥ 部台可见「不办：…」 |
| G-2 | 前台文案含「不代替部内合格线」类边界 |

---

## 3. 波次 2 · E 领导驾驶舱（加厚 `/agent/pending`）

### 3.1 IA

- 路由不变：`/agent/pending`  
- 左栏短名可仍叫「待办」；**页内**主标题：「待我拍板」；副：「驾驶舱（样机）」  
- **三个同页 Tab**（`view=` query，与现有 `seg=A|B|C` 关系见下）

| Tab `view` | 对应补充 E | 与现 A/B/C |
|---|---|---|
| `board`（默认） | 待我拍板 | 默认展示原 **A** 队列加厚；可内嵌 seg 切换 A/B 弱化进二级 |
| `transit` | 部门在途 | 新；案×部简表 / 嵌入 DeptBoard 精简 |
| `delivered` | 已交付回查 | 新；聚合 `getJudgments()` |

**推荐**：顶层 `view=board|transit|delivered`；`board` 内保留 `seg=A|B|C` 以免砍掉期限/在途工单入口。

### 3.2 `board` 行卡片信息架构（每条待拍）

现：事由 + 部门/案/链。  
**加厚必有**（一行主 + 可折细节）：

| 字段 | 来源 | 展示 |
|---|---|---|
| 事由 | `summary` / title | 主行 |
| 方案一句 | `resultPreview` 截断 ≤40 字 | 次行 |
| 依据摘要 | `buildAskEvidence` 的结论/来源各 ≤1 句 | 折起「依据」 |
| 专家建议 | `buildHitlAssistReview` 建议确认/退回一句 | 折起或芯片 |
| 等多久 | `createdAt` → 相对时间「已等 2 小时」 | 右上角 |
| 分组 | 按 `dept` / 节点 | 组头 |

CTA：仍「查看并确认」→ `workbenchAskPath`（部台气泡）。

`data-testid`：`boss-cockpit`、`boss-cockpit-row-{id}`、`boss-wait-{id}`。

### 3.3 `transit` 部门在途

- 词表对齐 H3：**在途**（原进行中）/ **等你拍**（待确认）/ **退回**  
- 数据：`deptProgress.deptStatus` + 案列表；或嵌入精简 `DeptBoard`  
- 不做假实时；样机种子即可

### 3.4 `delivered` 已交付回查

- 列表：`JudgmentRecord` 按 `at` 倒序  
- 列：时间 · 案 · gate · option（拍板/退回）· reason 一句  
- 点行：深链案卷抽屉判断档案 tab 或 `?audit=1` 确认详情

### 3.5 波次 2 改码清单

| # | 文件 | 动作 |
|---|---|---|
| 1 | `BossTodoInboxPage.tsx` | 三 view + board 行加厚 |
| 2 | `bossTodos.ts` 或新 `cockpitRows.ts` | 组装方案/依据/建议/等待 |
| 3 | `askEvidence.ts` / `hitlAssist.ts` | 导出「一行摘要」helper（若缺） |
| 4 | `ShellPathNav` 文案（可选） | title/tooltip「待我拍板」 |
| 5 | 脚注 F | 「样机不计前台绕过率」 |

### 3.6 验收 · 波次 2

| # | 期望 |
|---|---|
| E-1 | pending 页可见三个 Tab |
| E-2 | 待拍板行不点进部台也能看到方案句 + 等待时长 |
| E-3 | 已交付回查至少列出本案判断档案条目（有种子数据时） |

---

## 4. 波次 3 · D / I / K

### 4.1 D 决策账本

| 项 | 规格 |
|---|---|
| CaseFileDrawer | Tab 名：「判断档案 · 决策账本」 |
| 行展示 | 谁（当前用户）/ 何时 / 事项(gate) / 拍板或退回(option) / 理由 |
| 只追加 | 已有模型只追加；推翻用新记录 + 文案「本决策已于…推翻」示意（若暂无推翻流，文档标明后置） |
| 交卷旁 | 文案闸：「关键交卷应对应一条决策记录（样机提示）」——**不**真阻断除非已有闸 |

### 4.2 I 情感三事件（文案模板）

| 事件 | 模板（钉） | 禁用 |
|---|---|---|
| 退回 | 「这版{缺什么}，我按你的意见改一版，请看修订稿。」 | 「我理解你的感受」、表情包、委屈 |
| 里程碑/移交 | 「{节点}告一段落。建议下一步：…」或 J3 句 | 撒花、音效 |
| 反复退回（≥2） | 结构化：「继续改 / 换策略请示 / 先暂停」三选一芯片 | 拟人焦虑 |

落点：`hitlReturnRevise.ts`、`BusinessCaseContext` 退回句、`DeptHandoffOfferBubble`。

### 4.3 K 质检可见

| 项 | 规格 |
|---|---|
| 标签 | 自检 / 出部质检 / 下游抽检（示意 chip，可灰） |
| 位置 | `ThickStepWorkPanel` 质检步旁；交卷辅审卡 `HitlAssistCard` |
| 三线 | **不**恢复大厅首屏大条；交卷工单 / 部台 meta 折层可见摘要即可 |

### 4.4 验收 · 波次 3

| # | 期望 |
|---|---|
| D-1 | 抽屉可见「决策账本」字样 + 字段齐 |
| I-1 | 退回句无共情表演句式 |
| K-1 | 质检步旁可见层级 chip |

---

## 5. 波次 4 · H / J3 / G1 薄

### 5.1 H1–H2 半身肖像（非全身数字人）

**一期不做** 3D/口型/语音全身数字人（密 UI + H1）。  
**做**：主表面 `md+` **半身胸像 + 情境手势**；列表 `sm` 仅脸。

| kind | 识别 | 肢体 |
|---|---|---|
| `reception` | 外挂耳麦+话筒、青绿、「前台」、小林固定脸 | idle **招手领路**；waiting 双手呈递 |
| `expert` | 部色衣领 + 脸型/发型/眼距差异化 | idle 呼吸；working 持稿；waiting 双手呈递；thinking 托腮 |

### 5.2 H3 状态情境驱动（脸 + 手）

| presence | 脸 | 手/肢体 |
|---|---|---|
| `idle` | 眨眼；前台点头 | 前台招手 / 专家垂手 |
| `thinking` | 瞳孔上移 + 点头 | 托腮 |
| `working` | 侧视 + 进度弧 | 持稿微动 |
| `waiting` | 注视 + 琥珀环（最强） | 双手呈递 |
| `returned` | 降饱和 + 半睑 | 双手下垂 |
| `done` | 轻笑 + 绿点 | 举手确认 |

映射：`presenceFromDeptStatus(deptProgress)`；请示气泡强制 `waiting`。

### 5.3 J3 移交话术

`DeptHandoffOfferBubble` 固定结构：

> {原因}。请 {接手专家显示名}（{部}）接手，预计约 {N} 分钟；完成后会向您汇报。

按钮仍：「现在做 / 以后做」。

### 5.4 G1 薄人名（仅④⑤⑥ 负责人）

| 席 | 显示名（稿） |
|---|---|
| 交底主责 | 林交底（示例，可再定） |
| 申请主责 | 顾知远（对齐补充 G1） |
| 答复主责 | 沈答复（示例） |

人设一行只读：边界 + 「策略类 L2 / 对外 L3」；不做完整编制编辑器。

### 5.5 验收 · 波次 4

| # | 期望 |
|---|---|
| H-1 | 默认头像非写实照片 |
| H-3 | 至少部台右栏可见三态之一 |
| J3-1 | 移交气泡含原因+接手+预计+汇报 |
| G1-1 | 申请部可见「顾知远」类名 |

---

## 6. 明确不做（本 spec 边界）

| 项 | 原因 |
|---|---|
| A 旁观/接管/分工全流程 | 样机单用户足够；补条款试点后再做 |
| C 组织/部门/个人记忆服务 | 防假平台；仅 progress 级项目意图 |
| F 绕过率真实统计看板 | 无流量；脚注声明即可 |
| 登录改落到 pending | 与「大厅+八部可见」门禁冲突 |
| 前台恢复上传主 CTA / 情景卡主墙 | 01b 已否 |
| 真三级质检引擎 | K 只做标签叙事 |
| 把三线条砸回大厅第一眼 | 噪音；与现 IA 冲突 |

---

## 7. 与 01b / 交互大纲的衔接

- **01b**：管进门 L1/L2/L3 与前台 desk-line；**领进后的 J2 收件**以本文 §2 为准。  
- **交互大纲 §2**：老板待办仍在 IA；**形态**以本文 §3 驾驶舱为准（三视图）。  
- **补充条款**：理念；冲突时改条款或改本文，试点优先改条款。

---

## 8. 工程索引（落地时打开）

| 域 | 路径 |
|---|---|
| 前台 | `apps/agent/src/components/home/HomeReceptionGuide.tsx` |
| 接待意图 | `apps/agent/src/business/receptionHandoff.ts`（新） |
| 进度/确认 | `apps/agent/src/business/BusinessCaseContext.tsx` |
| 部台 | `apps/agent/src/pages/business/BusinessCaseDeptPage.tsx` |
| 叙事/边界 | `apps/agent/src/departments/deptPageNarrative.ts` |
| 驾驶舱 | `apps/agent/src/pages/business/BossTodoInboxPage.tsx` |
| 待办聚合 | `apps/agent/src/business/bossTodos.ts` |
| 依据/辅审 | `askEvidence.ts` · `hitlAssist.ts` |
| 判断档案 | `judgmentArchive.ts` · `CaseFileDrawer.tsx` |
| 移交 | `DeptHandoffOfferBubble.tsx` |
| 头像 | `ExpertAvatar.tsx` |

---

## 9. 修订

| 日期 | 说明 |
|---|---|
| 2026-11-02 | 初稿：对照补充条款 A–K；四波落点 + 数据契约 + 验收；先于改码 |
| 2026-11-02 | 收口：无案→pending+开案回写；收件折叠仅 UI；八部 refuses 全表 |
| 2026-11-02 | 波次 1–4 样机落码：J2/G、驾驶舱、D/I/K、H/J3/G1 |
| 2026-11-02 | H 升级：活头像（形状+眼+presence 动效），对标 Grok 线、拒写实数字人 |
| 2026-11-02 | H 纠偏：弃 blob；统一工牌席徽；状态按 idle/分诊/在途/等拍/退回/办完分机制 |
| 2026-11-02 | H 再纠：席徽不像人 → 风格化同事肖像（脸+部色环/领+情境状态） |
| 2026-11-02 | H：否全身数字人；主表面半身+手势；拉开脸差；前台耳麦可读；加大主像 |
