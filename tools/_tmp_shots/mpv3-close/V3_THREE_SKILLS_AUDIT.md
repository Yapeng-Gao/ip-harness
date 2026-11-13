# 三 Skill 全量评估 · main-path-v3（本轮）

- **日期**：2026-10-26（Asia/Shanghai）
- **原型**：`docs/prototype/main-path-v3/` @ `http://127.0.0.1:8767/`（HTTP 200）
- **HEAD（写报告时）**：`951580fd2b16eda0ae3e41a1e3e8c5d4c738e5fa`（`v3: home keeps pending only; messages via 全部消息 modal`）
- **产品名**：Novada Team · 开篇「尽快把专利申下来。」
- **Skill**：`apple-design` · `make-interfaces-feel-better`（full）· `web-design-guidelines`（Vercel command.md 当日拉取）
- **另评**：页面逻辑 · 产品设计 · 布局 · UI · UX
- **约束**：只评不改码、不 commit；v2 / `apps/agent` 不动
- **截图目录**：`tools/_tmp_shots/mpv3-close/`（约 44 张）
- **本执行器**：未改 `docs/prototype/main-path-v3/src/*`；仅写入本目录截图/脚本/本报告

---

## 总评

v3 对照实验在 **IA（三 tab）**、**品牌（Novada Team）**、**官网目标句（尽快申专利）**、**跨案不挂「当前项目」** 上已对准闸。交互基线明显好于早期橙皮稿：墨/石板 token、`.btn` `scale(0.96)`、mode/role/`work-view` 有 `aria-pressed`、app 壳有 skip-link、toast `role=status` + `aria-live=polite`、`prefers-reduced-motion`、无 `transition:all` / 无 `#ff5e30`。

仍未过关的主线是：**产品话术仍大量「你的公司 / 全公司 / 公司正在推进」**，与官网「虚拟知产公司只是组织方式」和 Leslie「我不理解为什么宣传交给一家公司」冲突；以及 **工作台/代理端大量 <36px 文本按钮**（feel-better 桌面下限 40，严重处 14–22）。

**Verdict：`Needs changes`**

（无「完全不可用」Block；有产品叙事 P0 + 密集热区 P0/P1。）

---

## 审计窗口内已落地（勿重复开单）

| 项 | 状态 | 证据 |
| --- | --- | --- |
| **首页协同消息双强调** | **已批改并已落地** | commit `951580f`；`verify-home-after-dedupe.png` 仅保留「现在需要我处理」+「全部消息 · 3」；消息进 Modal（`verify-messages-modal.png`）。审计中段截图 `09/10*` 仍见双强调，属时点未落地，**不作为未修 P0**。 |
| 品牌 Novada Team + hero | 已落地 | `01-site-hero.png`；h1「尽快把专利申下来。」 |
| 顶栏「当前项目」跨案隐藏 | 已落地 | 首页/部门 `picker=null`；项目/工作台可见（`12*` / `15d*`） |

---

## 计数

| 级别 | 条数 | 说明 |
| --- | --- | --- |
| **P0** | **3** | 产品「公司」叙事误导；工作台确认/追问热区过小；官网示意 IA 与真壳不一致（次严重） |
| **P1** | **11** | 热区/ARIA/modal overscroll/site skip/文案细项等 |
| **P2** | **6** | polish、残留 CSS、后勤页缺失（v3 设计取舍） |

---

## 最严重 5 条（一句话）

1. **P0 产品**：首页/首次态仍说「你的公司 / 全公司 / 公司正在推进」，与「尽快申专利、虚拟公司只是组织」打架，易再触发 Leslie 式误解。  
2. **P0 UX**：工作台「追问依据 / 查看产出 / 定位到交付物」热区约 **14–22px 高**，确认主钮约 **34px**，桌面难点、易误触。  
3. **P1 布局/逻辑**：官网 hero 产品示意仍画「首页/项目/部门/**专利资产**」四项，真壳是三 tab；示意误导。  
4. **P1 feel-better**：部门「配置职责」、compose footer、work-view 切换、顶栏「官网」普遍 **30–31px**。  
5. **P1 web**：`.modal` 缺 `overscroll-behavior: contain`；site/login 无 skip-link（仅 app 壳有）。

---

## 逐页表

| 页/态 | 逻辑/产品 | 布局 | UI | UX | apple | feel-better | web-guidelines | 最严重 | 优 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **site 官网** | 开篇对准「尽快申专利」✓；虚拟公司一句澄清✓ | 英雄+示意清晰 | 墨色克制✓ | CTA 清楚 | Purpose/Simplicity 好；示意四导航破坏 Familiarity | 主钮够大；标题可 balance | 无 skip；锚点 button OK | 示意 IA≠真壳 | P1 |
| **login** | 双身份+首次/已有清楚 | 双栏稳 | 墨主钮 | 路径短 | 清晰 | 身份 pressed✓ | radiogroup+pressed✓ | — | P2 |
| **首页（去双强调后）** | 待办主线对；**「公司」话术重** | 单列待办+在办卡 | 干净 | 「全部消息·3」入口对 | Agency 好；Purpose 被公司话术拖 | 主区够；官网链矮 | lead 有 name/ac✓ | 公司叙事 | **P0** |
| **首页首次** | 「你的公司还没有…公司才开始执行」 | 空态卡清楚 | OK | 三目标入口好 | — | OK | OK | 同公司叙事 | **P0** |
| **项目列表** | 对象筛选清楚；开案入口有 | 表+侧栏 | 进度条 OK | 点行进工作台 | Familiarity 好 | filter≥40✓ | filter 缺 pressed | filter ARIA | P1 |
| **专利资产** | 项目侧入口合理 | 列表稳 | OK | OK | OK | 小链「官网」 | OK | 壳热区 | P2 |
| **工作台·协同** | 节点/确认门闩逻辑强✓ | 三栏信息密 | 纸感一致 | **密文本钮难点** | 空间对称好；Response 弱在小链 | 热区多处 <36 | compose 有 name/aria✓；确认两步✓ | 热区 | **P0** |
| **工作台·文书** | 卷宗/版本对规格 | 编辑区+过程可收 | OK | 切换 31px | 材料层次 OK | work-view 矮 | pressed✓ | 切换热区 | P1 |
| **工作台·OA/质检** | 换案上下文正确 | 同壳 | OK | 同协同热区问题 | OK | 同左 | OK | 同左 | P1 |
| **部门 studio** | 花名册+工作室一面✓ | 主从两栏 | 十部列表清楚 | 「配置职责」30px | Simplicity 好 | expert-row btn 30 | studio tab≥40；部分 icon 缺 label | 配置职责热区 | P1 |
| **Modal 新/专家/导览/消息/评审** | 消息 Modal 对已批改 | 居中卡 | 模糊 scrim | Esc/点背关闭✓ | Dim to focus✓ | 主次钮清晰 | **无 overscroll contain**；多数字段有 name | overscroll | P1 |
| **通知/搜索** | ⌘K 合理 | 浮层 | OK | OK | OK | OK | 搜索对话框 OK | — | P2 |
| **代理端首页** | 期限优先对角色 | 队列+metric | metric tabular✓ | pulse 链 **~15px 高** | — | pulse 热区差 | OK | pulse 热区 | **P0**/P1 |
| **代理·客户案件** | 列表换面正确 | OK | OK | 新建 21×21 仅图标 | — | 新建过小 | aria-label「新建项目」有 | 命中面积 | P1 |
| **壳 topbar/sidebar** | 三 tab + 角色；跨案无项目切换器✓ | 顶栏信息略挤（官网+帮助+铃+三 tab+角色） | 墨 active✓ | skip✓；toast live✓ | Craft 大体到位 | `.app-site-link` 31 | mode/role pressed✓ | 官网链 | P1 |
| **docket/billing/members** | **v3 无独立后勤页**（非遗漏 bug，IA 取舍） | — | — | 任务清单曾点名：记范围差 | — | — | — | 范围说明 | P2 |

---

## P0 明细

### P0-1 产品叙事：「公司」壳 vs「尽快申专利」
- **页/元素**：首页 lead 文案/placeholder（`全公司指令` / `调整全公司优先级`）；首次空态（`你的公司还没有…公司才开始执行`）；在办区 kicker（`公司正在推进`）；导览 subtitle（`一家公司、一个负责人…`）
- **为何错**：官网已声明「虚拟知产公司只是组织方式，不是你要去运营的公司」，工作区内仍用「你的公司」经营口吻 → 用户会以为产品卖的是「开一家知产公司」，与 Leslie 质疑同源。
- **建议（不改码，仅方向）**：改成「工作区 / 编制 / 正在推进的对象」；导览改「一个工作区、一个负责人、三种深度」；保留「虚拟知产公司」仅在官网轻描。

### P0-2 工作台密集控件热区 <36（多处 <22）
- **页/元素**：协同台 `追问依据` / `查看产出` / `定位到交付物` / `还缺什么` / `退回核查`；右侧确认钮实测 ~34px 高；`发送给顾言` ~30px
- **为何违规**：feel-better Minimum hit area（桌面 ≥40）；apple Response/直操 —— 关键确认路径却最难点
- **建议**：主确认列统一 `min-height: 40`；行内次要动作改为 40 高 text-btn 或扩大伪元素；勿只靠 10–12px 字号链

### P0-3（弱 P0 / 强 P1）官网产品示意 IA 漂移
- **元素**：`hero-product` 侧栏「首页 / 项目 / 部门 / **专利资产**」
- **为何**：真壳顶栏只有三 tab；专利资产在项目侧栏。示意教错心智。
- **建议**：示意改成三 tab；资产放项目内示意或删第四项

---

## P1 明细

| # | 项 | 页 | 依据 | 建议 |
| --- | --- | --- | --- | --- |
| 1 | `.app-site-link` ~31×32 | 壳 | feel-better hit | padding 抬到 min 40 或并入 overflow 菜单 |
| 2 | `.work-view-switch button` min-height 31 | 工作台 | 同上 | ≥40（窄屏已有 36，仍不够） |
| 3 | `.config-section .expert-row .btn` / prompt `.btn` / collab footer `.btn` = 30 | 部门/协同 | 同上 | ≥40 或降级为 text-btn+伪热区 |
| 4 | 代理 pulse-item 内链 ~15px 高 | 代理首页 | 同上 HIGH | 整行可点或 min-height 40 |
| 5 | 项目「新建」仅 21×21 图标 | 项目/代理客户 | hit + 可见性 | 保留 aria-label，外扩 hit 或改「+ 新建」芯片 |
| 6 | object-filter / studio-tabs 无 `aria-pressed`（仅 class active） | 项目/部门 | web Interactive state | 与 mode-switch 对齐 |
| 7 | `.modal` 无 `overscroll-behavior: contain` | 全 Modal | web Touch & Interaction | 补 contain |
| 8 | site / login 无 skip-link | 登录前 | web a11y | 营销/登录各一条或共用 |
| 9 | 部门花名册齿轮等 icon-btn 个别缺 aria-label | studio | web icon-only | 补「配置专家」等 |
| 10 | 顶栏信息密度：官网+帮助+铃+三 tab+角色 | 壳 | apple Simplicity | 「官网」可收到头像菜单 |
| 11 | guide/Modal 仍写「一家公司」 | 导览 | 同 P0-1 | 随话术一并改 |

---

## P2 明细

- 残留 `.company-messages` CSS（逻辑已迁 Modal，样式可后清）
- site 大标题未强制 `text-wrap: balance`（观感尚可）
- 日期/「剩余 18 天」演示硬编码，未走 `Intl`（原型可接受）
- **无 docket / billing / members 独立页**：v3 IA 未做后勤三页（对照 v2）；记范围差，非回归
- toast 动画未单独 reduced 变体（全局 media 已短路部分动画）
- 官网 workflow 步进可加键盘左右键（tab 已有）

---

## 三 Skill 对照摘要

### apple-design
- **通过**：Purpose（申专利）在官网成立；确认门闩体现 Agency/Responsibility；空间进出对称（协同↔文书）；材料用纸+线而非吵橙；reduced-motion 有。
- **未过**：关键路径控件 Response 不足（小链）；Familiarity 被官网示意四导航破坏；Delight 被「公司」话术抵消。

### make-interfaces-feel-better（full）
- **通过**：根级 antialiased（若 index 有）；主 `.btn` scale 0.96；metric/progress `tabular-nums`；无 `transition: all`；主按钮/mode 多数 ≥40。
- **未过**：大量次要按钮/链接 <40（见 P0-2/P1）；部分嵌套半径未严格同心（低优）；代理 pulse 为 HIGH。

### web-design-guidelines
- **通过**：多数 icon-btn 有 aria-label；login/mode/role/work-view pressed；toast status+live；表单关键字段 name + autocomplete=off；破坏性确认有门闩；焦点 `:focus-visible`。
- **未过**：modal overscroll；site skip；部分 filter/tab 无 pressed；示意非真实导航（内容问题）。

---

## 页面逻辑 / 产品设计（跨页）

| 结论 | 说明 |
| --- | --- |
| IA 对准闸 | 首页 / 项目 / 部门；消息非第四 tab；跨案无「当前项目」✓ |
| 主路径可走通 | 官网→登录→首页待办→工作台确认→文书；部门花名册；代理换面✓ |
| 产品错位残留 | 「公司」经营话术 vs 申专利目标 |
| 后勤 | 无独立 docket/billing/members（有意） |
| 双强调 | **已批且已落地**，审计早期截图勿当现状 |

---

## 验证记录

- `curl` 8767 → 200  
- Playwright 走通：site / login / 首页(含首次) / 项目 / 资产 / 工作台(协同·文书·OA) / 部门 / Modal / 通知 / 搜索 / 代理三面 / toast  
- CSS probe：`transitionAll=0` `scale096>0` `scale098=0` `orange=false` `reduced=true`  
- Toast 实测：`role=status` `aria-live=polite` 文案「已切换至已有工作演示」  
- 源码未由本执行器修改；HEAD 在审计期间由他方提交 `951580f`（首页去双强调）

---

## 截图索引（主要）

| 文件 | 内容 |
| --- | --- |
| `01-site-hero.png` … `05-site-final.png` | 官网 |
| `06/07-login*.png` | 登录 |
| `08*/09-home*.png` / `10*` | 首页（10* 含审计中段双强调旧貌） |
| `verify-home-after-dedupe.png` / `verify-messages-modal.png` | **去双强调后**首页与全部消息 |
| `12*` `13*` `14-assets` | 项目/切换器/资产 |
| `15d/e` `17c` | 工作台协同/OA/文书 |
| `18/19/20` | 部门与配置 |
| `21*` `22` `23` | Modal / 通知 / 搜索 |
| `24*` `25` `26` | 代理端 |
| `27b-toast.png` | toast a11y |

---

## Considered but rejected

| 候选 | 为何不单开 |
| --- | --- |
| 全面改回 v2 纸感七部 | 本目录是对照实验，非替换 v2 |
| 把专利资产升为第四 tab | 与已钉三 tab IA 冲突 |
| 为演示日期上 Intl | 静态原型收益低（P2 已记） |

## Audit miss note (2026-10-26)

三 skill 扫描未把 **规格硬闸「禁文书/协同双 Tab」**（vision `203e401` / pages §2）扫入 P0：当时只按可见布局与热区评，未逐条对照 pages「不放什么」。漏项已在本轮原型收口（一屏三栏 + 首页确认计划→四步→再进台）。
