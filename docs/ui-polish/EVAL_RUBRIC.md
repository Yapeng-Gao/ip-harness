# ip-harness UI 评估量规 · EVAL_RUBRIC

| 项 | 值 |
|----|-----|
| **使用者** | UI评估助手（只评不改） |
| **对照规范** | [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)（条款 `DS-*`） |
| **技能** | `apple-design`（Emil Kowalski）· `make-interfaces-feel-better`（Jakub）· `web-design-guidelines`（Vercel） |
| **输出** | `docs/ui-polish/REVIEW_*.md`：七维分 + 附加分 + Go 门 + P0/P1/P2 |
| **样例** | `REVIEW_2026-09-12.md`（Conditional）· `REVIEW_P0_RECHECK.md`（P0 Go） |

---

## 1. 评分总则

1. 每维 **1–5 整数**；可在总评写 `~3.5` 仅作综合印象，表内仍用整数。
2. 打分须引用 **证据**（URL + 截图路径）与 **DS 条款**。
3. **壳**与**深内页**分开看：壳高分不能掩盖 Flow / 节点 / Agent 内页糙。
4. P0 未过 → 全量不得 **Go**（最多 Conditional）；见 §5。

---

## 2. 七维标准（1 / 3 / 5）

### D1 · 信息层级与首屏「下一步」

| 分 | 含义 |
|----|------|
| **1** | 首屏无行动焦点；标题/KPI/列表同权噪音；找不到「现在该做什么」 |
| **3** | 有主标题与区块，但「下一步」弱或与次要链竞争；需二次扫视 |
| **5** | 首屏单一行动单元清晰（如 `.dash-board-top` + `.dash-next` 主 CTA）；层级轻头→优先条→KPI 可读 |

**对照**：DS-COMP-DASH · DS-SCAN-01  
**抽检**：mid `/`

---

### D2 · 间距 / 密度 / 对齐（含列表列网格）

| 分 | 含义 |
|----|------|
| **1** | 随意间距；列不对齐；触控/点击热区混乱重叠 |
| **3** | 大体 4/8 网格，但双栏/展开区仍挤或列网格在窄断点塌陷难看 |
| **5** | 4/8 一致（DS-SPACE-01）；Inbox/表列网格对齐；`.hit-40` 达标；光学对齐无明显歪

**对照**：DS-SPACE-01 · DS-RADIUS-02  
**抽检**：mid Inbox / 案件库；wb 双栏步进

---

### D3 · 视觉一致性（token、圆角、按钮、badge）

| 分 | 含义 |
|----|------|
| **1** | 多套色/圆角/按钮并存；紫靛残留；0 半径或硬阴影 |
| **3** | 主路径已用 `surface-card` / `ui-btn*`，仍有零星 one-off 色或父子同半径 |
| **5** | Token 与组件类统一（DS-COLOR / DS-COMP-*）；同心圆角正确；badge 语义色正确

**对照**：DS-COLOR-01/02 · DS-RADIUS-01/02 · DS-FORBID-01 · DS-COMP-*

---

### D4 · 流程内页质感（步骤 / 节点 / Agent）—「壳好看、里页糙」专项

| 分 | 含义 |
|----|------|
| **1** | 内页仍是原始表单墙/调试壳；与外壳判若两产品 |
| **3** | 已有 `wb-*` / `mid-*` / `agent-*` 抬升，但 meta 墙字、tip 叠层或空列主导仍在 |
| **5** | Flow 每步、案节点、各 Agent 会话内饰均达壳同级密度与反馈；空态诚实可读

**对照**：DS-COMP-WB · DS-COMP-MID · DS-COMP-AGENT · DS-HONESTY-01  
**另记附加分**：§3「深层次内页分」

---

### D5 · 交互反馈（hover / focus / 空错态 / 主次 CTA）

| 分 | 含义 |
|----|------|
| **1** | 无 focus 可见；禁用不可理解；空错态缺失；主次 CTA 混淆 |
| **3** | 多数有 hover/focus；个别 `outline-none` 未替换；闸门禁用缺内联原因 |
| **5** | focus-visible 完备（DS-FOCUS-01）；空/错/禁用可读；主次 CTA 权重正确；动效可打断且尊重 reduced-motion（DS-MOTION-01）；**DS-DISABLED-01 达标** |

**对照**：DS-FOCUS-01 · DS-DISABLED-01 · DS-MOTION-01 · DS-COMP-EMPTY/TOAST

---

### D6 · 文案可读与噪音

| 分 | 含义 |
|----|------|
| **1** | 灰墙/技术倾倒/对比不足；关键状态靠猜 |
| **3** | 主文可读，次要文偶发 <4.5:1 或 chip 未拆；tip/徽章叠噪音 |
| **5** | 主次文对比合格；SLA/风险/谁该动已 chip 化（DS-SCAN-01）；同视口 tip 有上限；无 raw URL 倾倒 |

**对照**：DS-SCAN-01 · DS-HONESTY-01 · DS-FORBID F2/F8

---

### D7 · 跨壳一致（mid / wb / agent / ops / iam）

| 分 | 含义 |
|----|------|
| **1** | 五壳五套视觉；跳转双模式；侧栏/按钮语言分裂 |
| **3** | mid↔wb 像同一产品；agent 可接受独立会话面但字号/密度有缝；ops/iam 仅轻壳且偶发调试态 |
| **5** | DS-SHELL-01/02 清单全过；差异仅限允许项（DS-SHELL-03）；无双跳（F3） |

**对照**：DS-SHELL-* · DS-FORBID-01 F3  
**分类**：见 §6「跨壳不一致 vs 单页糙」

---

## 3. 附加分

### S1 · 风格统一分（1–5）

跨 **组件库级** 一致性，不单看一页：

| 分 | 含义 |
|----|------|
| **1** | 多套 btn/input/card 实现并行 |
| **3** | Wave 壳类已统一，深页仍有裸 Tailwind 色 |
| **5** | 全部高频控件可追溯到 DS-COMP-* / `index.css`；`packages/ui` 亦服从 token |

**证据**：至少 mid + wb + agent 各 1 页并排对比截图。

### S2 · 深层次内页分（1–5）

对下列子集分别扫，再取 **木桶最低** 写入附加分（总评可附表）：

| 子集 | 路由示例 | 关键类 |
|------|----------|--------|
| Flow steps | `5174/workbench/intake/*` · `.../research/*` | `wb-tip` · `wb-check-row` · `wb-draft-area` |
| Case nodes | `5173/cases/:id` | `mid-node-stage` · `mid-node-step` |
| Pipeline / Docket | `/pipeline` · `/docket` | `mid-pipeline-*` · `mid-docket-*` |
| Agent interiors | `5175/agent/agents` · `/agent/sessions/:id` | `agent-picker-card` · `agent-meta-grid` · `confirm-hitl` |

| 分 | 含义 |
|----|------|
| **1** | 任一子集仍为原型脚手架 |
| **3** | 外壳抛光、展开/步进仍挤或空 |
| **5** | 各子集达到与 Dashboard 壳同级的可演示完成度 |

与 **D4** 同源但更细；D4 是七维之一，S2 强制点名子集，防「只评了壳」。

---


### S3 · UX 习惯分（1–5）

对照 [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) **DS-UX-HABIT-01…06**。短复评（仅 P1）亦须给分。

| 分 | 含义 |
|----|------|
| **1** | 首屏无下一步；禁用不可理解；空态无动作；跨壳跳转混乱 |
| **3** | 主路径有下一步与禁用理由，但默认折叠 / tip 叠层 / 空列无出口仍在 |
| **5** | HABIT 六条全过：首屏单一下一步、关键默认展开、禁用内联原因、tip 上限、空态带动作、跨壳文案跳转一致 |

**抽检**：mid `/` · 一待确认 Agent 会话 · 一空态页 · wb 步进 tip · 顶 pill 跨壳跳转。

---

## 4. Shell vs Interior 检查清单

### 4.1 Shell checklist（每壳首页 / 布局）

- [ ] `app-shell-bg` / 侧栏或 topbar 符合 DS-COMP-SHELL
- [ ] 品牌块 / nav-section / 选中轨一致
- [ ] 主 CTA = `ui-btn-primary` 或 `cta-work`（navy）
- [ ] focus-visible 可走查
- [ ] Demo 诚实横幅（若 mock）符合 DS-HONESTY-01
- [ ] 无 F1/F3/F8

### 4.2 Interior checklist（深页）

- [ ] 使用域前缀类：`wb-*` / `mid-*` / `agent-*` / `dash-*`，非随机色
- [ ] 同心圆角（DS-RADIUS-02）
- [ ] 数字 `tabular`
- [ ] 空列/空态策略可读（非「未做完」误读）
- [ ] tip / banner 叠层受控
- [ ] 闸门禁用 + 内联原因（DS-DISABLED-01）
- [ ] 扫视字段 chip 化（DS-SCAN-01，若适用）

---

## 5. Go / Conditional Go / No-Go

| 门 | 条件 |
|----|------|
| **Go** | 全部 **P0 验收通过**；七维均 ≥3；无 DS-FORBID 高严重残留；S2 无「脚手架级」子集；证据齐全 |
| **Conditional Go** | 产品可演示，但存在未关 P1，或七维有 1 个维度 =3 且有明确洞；**P0 必须已过或本评单不宣称全量 Go**；S3 UX习惯可 <5 |
| **No-Go** | 任一 **P0 未过**；或 D1/D5/D7 任一项 =1；或大面积 F1/F5/F8；或无法提供证据 |

### P 级定义

| 级 | 定义 | 与门关系 |
|----|------|----------|
| **P0** | 误导行动、不可读状态、对比失败导致扫视失败（如历史 P0-1/P0-2） | **不过则不能 Go** |
| **P1** | 演示明显「未完工」（空列主导、墙字、默认折叠关键上下文、tip 叠层） | Conditional 可带 P1 |
| **P2** | 抛光/噪音/边缘壳（IAM 调试卡、Phase 徽章、长案名 truncate） | 不挡 Conditional |

复评：仅 P0 变更时可出短评（如 `REVIEW_P0_RECHECK.md`），结论写清「仅就 P0」vs「全量」。

---

## 6. 「跨壳不一致」vs「单页糙」

| 类型 | 判据 | 归维 | 典型处置 |
|------|------|------|----------|
| **跨壳不一致** | 同类控件在 ≥2 壳表现不同（按钮色阶、侧栏选中、字号阶梯、跳转模式） | **D7** + 记 S1 | 统一 token/class；升 P0 仅当导致错误导航或信任崩塌 |
| **单页糙** | 仅某路由密度/文案/空态差，其它壳同类页正常 | **D2/D4/D6** 或 S2 子集 | 页级 P1/P2；勿虚报成跨壳 |

**操作**：发现差异时先问「另一壳同组件是否也差？」— 是 → 跨壳；否 → 单页。

---

## 7. 证据要求

每条发现 / 每个维度分数须可追溯：

| 字段 | 要求 |
|------|------|
| **URL** | 含端口与路径，如 `http://127.0.0.1:5173/` · `http://127.0.0.1:5175/agent/sessions/sess-oa-1` |
| **截图路径** | 仓内 `docs/ui-polish/<wave>/…-after.png`（或 `review-p0/`）；注明 before/after |
| **DS 条款** | 如 `DS-SCAN-01`、`DS-DISABLED-01`、`DS-FORBID-01 F4` |
| **HEAD** | 短 hash；与证据同链 |
| **运行时** | SPA HTTP 200 或实机浏览说明；若实拍受阻须声明并改用 AFTER 证据 |

**不合格证据**：无路径的口头描述；过期 `wave3/mid-dashboard-after.png` 充当 Dashboard v2 现状等。

---

## 8. 报告最小模板

```markdown
# UI 正式评估 · REVIEW_YYYY-MM-DD
| 对象 | HEAD / 端口 |
| 总评 | Go | Conditional Go | No-Go |
| 综合 | ~x / 5 |

## 七维
| # | 维度 | 分 | 证据（URL + 图） | DS |
## 附加
| S1 风格统一 | 分 | 证据 |
| S2 深内页 | 分 | 子集表 |
| S3 UX习惯 | 分 | DS-UX-HABIT 条目 |
## P0 / P1 / P2
（问题 · 验收 · URL/证据 · DS）
## 门禁裁决
## 抽检覆盖表
```

---

## 9. 维度 ↔ DS 速查

| 维 | 主要条款 |
|----|----------|
| D1 | DS-COMP-DASH · DS-SCAN-01 |
| D2 | DS-SPACE-01 · DS-RADIUS-02 |
| D3 | DS-COLOR-* · DS-COMP-* · DS-FORBID-01 |
| D4 | DS-COMP-WB/MID/AGENT · DS-HONESTY-01 |
| D5 | DS-FOCUS-01 · DS-DISABLED-01 · DS-MOTION-01 |
| D6 | DS-SCAN-01 · DS-HONESTY-01 · F2/F8 |
| D7 | DS-SHELL-01/02/03 · F3 |
| S1 | 全书 Foundations + Components |
| S2 | DS-COMP-WB/MID/AGENT 子集 |
| S3 | DS-UX-HABIT-01…06 |

---

*只文档；与 `DESIGN_SYSTEM.md` 同步维护。评估不改 apps/contracts。*
