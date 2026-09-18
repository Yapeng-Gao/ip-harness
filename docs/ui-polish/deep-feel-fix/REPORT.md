# DEEP_FEEL 落地 · REPORT

| 项 | 值 |
|----|-----|
| **日期** | 2026-09-18（Asia/Shanghai） |
| **权威** | `docs/ui-polish/REVIEW_DEEP_FEEL_2026-09-18.md` |
| **基线 HEAD** | `48be9f6`（review）· 代码基线 ~`71267f2` |
| **Skills** | apple-design · make-interfaces-feel-better · web-design-guidelines（**无** apple-hig-full） |
| **范围** | 仅视觉 / 布局 / 文案 / CSS；**未改** contracts / HITL 闸逻辑；未启 Cloud Agent |
| **证据目录** | `docs/ui-polish/deep-feel-fix/` |

---

## 勾选表

| ID | 状态 | 改动摘要 | AFTER |
|----|------|----------|-------|
| **DF-M1** | [x] | Inbox「办理/确认」→ `.dash-inbox-action` 等同 `ui-btn-sm` 权重（边框 + rest shadow + min-h 40）；动作列加宽至 `6.25rem` | `AFTER-DF-M1-dashboard-inbox.png` |
| **DF-M2** | [x] | 过滤标题「过滤条件」+ `code`/`title` 降级 `Query.filters`；同族折叠人话 + `collapseFamily` code；故障注入收进「开发者选项」折叠；壳条/AgentPanel「同引擎形状」→ 人话 + 开发者折叠 | `AFTER-DF-M2-search-home.png` · `AFTER-DF-M2-search-devfold.png` |
| **DF-M3** | [x] | `AnnotationMark` bubble 光学上偏（stem + r=16 上移）；Sketch 零件字下沉；seed 锚点上移至盒顶 | `AFTER-DF-M3-figure-edit-seed.png` |
| **DF-M4** | [x] | mid「洞察」→ `.nav-section-btn` hit≥40；Persona/工作区 topbar `hit-40`；figure「文档」`.figure-top-link` + 步进 `.figure-step-chip` ≥40 | `AFTER-DF-M4-mid-insight.png` · `AFTER-DF-M4-agent-chrome.png` · M3 顶条同帧 |
| **DF-S1** | [x] | ops Config 开关 `.ops-switch` + `::after` 扩热区 40×40；行 `min-h-10` | `AFTER-DF-S1-ops-config.png` |
| **DF-S2** | [x] | `.dash-inbox-row:active` 背景加深 + inset；可打断 transition；无 scale | `AFTER-DF-S2-inbox-row.png` |
| **DF-S3** | [x] | Confirm 右栏「期限」「产物」默认折叠 `.agent-aside-meta`、降对比；产物内嵌不再默认 open | `AFTER-DF-S3-confirm.png` |
| **DF-S4** | [x] | Sparks 空态去掉「≥6 张卡」；用户文案 + CTA「去输入台」保留 | `AFTER-DF-S4-sparks-empty.png` |
| **DF-S5** | [x] | AnnotationPanel 草稿卡 `.anno-draft-card` 外径 1.125rem ≈ 内 0.375 + pad 0.75；邻卡 `0.875rem` | `AFTER-DF-S5-doc-anno.png` |
| **DF-S6** | [x] | Matrix 单元格 empty wash / 已填语义色边；`.fto-matrix-select` min-h 40 | `AFTER-DF-S6-matrix.png` |
| **DF-C1** | [x] | loadtest 空跑次补说明 + 次级 CTA「用当前参数启动」「去端点」 | `AFTER-DF-C1-loadtest-empty.png` |
| **DF-C2** | [x] | inspire 输入台收紧间距，动作条贴底与说明同行 | `AFTER-DF-C2-inspire-prompt.png` |
| **DF-C3** | [x] | `.kpi-chip` 整段 `tabular-nums` | `AFTER-DF-C3-kpi.png` |

---

## 度量旁证（`_after-metrics.json`）

| 探针 | 结果 |
|------|------|
| `.dash-inbox-action` | **h=40** · fw=600 |
| `button.nav-section-btn`（洞察） | **h=40** |
| Persona / 工作区 topbar | **h=40** |
| `a.figure-top-link` / `.figure-step-chip` | **h=40** |
| ops `ops-switch` | 可见 24×40 + `::after` 扩至 40×40 |
| anno-draft concentric | outerR=18 · pad=12 · innerR=6 → **18=6+12** |
| `.fto-matrix-select` | **h=40** |
| search 文案 | 人话过滤 ✓ · 无「过滤（写入 Query.filters）」主标题 ✓ · 开发者折叠 ✓ |

---

## 可点 URL（本地 Vite）

| ID | URL |
|----|-----|
| DF-M1 / S2 / C3 | http://127.0.0.1:5173/ |
| DF-M2 | http://127.0.0.1:5182/ |
| DF-M3 / M4 顶链 | http://127.0.0.1:5187/edit/fig-seed-exploded |
| DF-M4 agent | http://127.0.0.1:5175/ |
| DF-S3 | http://127.0.0.1:5175/agent/sess-oa-1 |
| DF-S1 | http://127.0.0.1:5176/config |
| DF-S4 / C2 | http://127.0.0.1:5185/sparks · http://127.0.0.1:5185/ |
| DF-S5 | http://127.0.0.1:5178/ （选文 → 加批注） |
| DF-S6 | http://127.0.0.1:5183/matrix |
| DF-C1 | http://127.0.0.1:5179/loadtest |

---

## Typecheck

```text
npm run typecheck -w @ip/mid -w @ip/agent -w @ip/search -w @ip/figure \
  -w @ip/ops -w @ip/inspire -w @ip/doc-harness -w @ip/fto -w @ip/ai-infra
→ green
```

---

## Blockers

无。Must 4 + Should 6 + Could 3 均落地。

---

## 怎么验（抽检）

1. `:5173/` Inbox 行右「办理」为芯片按钮感、高约 40；按下行使背景加深。
2. `:5182/` 主标题无 API/→error；展开「开发者选项」才见故障注入。
3. `:5187/edit/fig-seed-exploded` 气泡 1/2 在零件字上方，传感模块/处理单元全文可读。
4. 洞察 / Persona / 工作区 / figure「文档」与步进链命中 ≥40。
5. `:5175/…/sess-oa-1` 右栏期限/产物默认折叠；Confirm 条仍为一级。
6. `:5183/matrix` 未填 wash、已填色边；select 高 40。
