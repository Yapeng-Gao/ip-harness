# AGENT_FEEL 质感安装 · REPORT

| 项 | 值 |
|----|-----|
| **日期** | 2026-09-19（Asia/Shanghai） |
| **基线 HEAD** | `92de45e`（`dev`） |
| **权威** | `docs/ui-polish/REVIEW_AGENT_FEEL_2026-09-19.md` |
| **范围** | **仅** `apps/agent/**` 视觉/密度/文案/CSS + `src/index.css` agent 确认热区补强 |
| **禁止** | HITL 闸语义 / DomainCommand / onHitl·onGate / ENTRY·FULL 已关 P0/P1 / Cloud Agent |
| **Skills** | apple-design · make-interfaces-feel-better · web-design-guidelines（无 apple-hig-full） |
| **运行时** | Vite `http://127.0.0.1:5175` · `/agent` → 200 · 视口 1440×900 |
| **typecheck** | `npm run typecheck -w @ip/agent` → **green** |

---

## Must

### AFE-M-1 · 工具芯片中文主文案 + button ≥40
- [x] 主文案：「分派任务」「汇总时间线」「打开专家私信」
- [x] 英文 id 进 `title` / 「高级」fold（`高级 · {expert.id}`）
- [x] 真实 `button`，实测高 **40**
- [x] 路径：`proj-demo-general` / `proj-demo-patent`
- **证据**：`01-patent-tools-after.png` · `02-patent-density-after.png` · `03-general-tools-after.png` · `_afe-after.json`
- **实现**：`apps/agent/src/components/projects/ProjectChatPane.tsx`

### AFE-M-2 · 项目中栏密度 / composer 舒适带
- [x] 压缩工具带/页眉留白；消息区贴底；composer `sticky bottom`
- [x] 实测 `composerTop=**774**` @ vh=900（目标 ≲780）✓
- **证据**：`02-patent-density-after.png` · `_afe-after.json` AFE-M-2
- **实现**：`ProjectChatPane.tsx` + `agent.css` `.project-chat-*`

### AFE-M-3 · Confirm 字阶 + 热区
- [x] 状态芯片「待批准/待授权/逐步」字号 **12px**（原 10px）
- [x] 「还有 N 条」高 **40**；composer 折叠条高 **40**
- [x] 主 CTA「批准策略」高 **40**
- **证据**：`04-session-confirm-after.png` · `05-confirm-closeup-after.png` · `_afe-after.json` AFE-M-3
- **实现**：`SessionConfirmBar.tsx` · `AgentSessionWorkspace.tsx` · `agent.css` / `src/index.css`

---

## Should（§8 序）

### AFE-S-3 · 双跳只留一套
- [x] 移除 `AppSurfaceLinks`（顶栏 segmented）
- [x] 保留壳内 `ProductSwitcher`（作业中台 / 知产 Agent）
- **证据**：`_afe-s1-recheck.json` surf 仅 ProductSwitcher；无办理台 segmented
- **实现**：`apps/agent/src/App.tsx`

### AFE-S-2 · Catalog Assist/Beta disclaimer
- [x] `line-clamp: 2`；「详情」展开
- **证据**：`06-catalog-after.png` · `_afe-after.json` AFE-S-2（clamp=2）
- **实现**：`AgentPickerCard.tsx` + `agent.css`

### AFE-S-1 · 消灭 `transition: all`（dock/confirm/rail/chip）
- [x] agent 作用域枚举 `transition-property`（transform/opacity/colors…）
- [x] 复核：dock/confirm/rail 精确 `transition-property: all` → **0**
- **证据**：`_afe-s1-recheck.json`（all=0）
- **实现**：`apps/agent/src/agent.css`

### AFE-S-4 · 项目时间线空态 + 动作 CTA
- [x] 仅种子「创建」时展示「下一步」+「打开总控分派」等 CTA
- **证据**：`07-timeline-cta-after.png` · `_afe-after.json` AFE-S-4
- **实现**：`ProjectTimelinePanel.tsx`

### AFE-S-5 · chrome 热区 ≥40
- [x] 专家席链 / 绑案钮 实测 **40**
- **证据**：`_afe-after.json` AFE-S-5
- **实现**：`ProjectFolderSidebar.tsx` · `CaseBindControls.tsx` · `SessionContextPanel.tsx` · `agent.css`

### AFE-S-6 · Confirm CTA/折叠 ≥40
- [x] 与 M-3 重叠；CTA/折叠/还有 N 条均为 40
- **证据**：同 M-3

### AFE-S-7 · 右栏相对 Confirm 降权
- [x] aside 降对比/饱和；meta summary 次要色；表单链 hit≥40
- **实现**：`SessionContextPanel.tsx` · `agent.css` `.agent-aside*`

---

## Could（未做 / 时间不够）
- [ ] AFE-C-1 Harness 再折叠
- [ ] AFE-C-2 composer 展开改抽屉
- [ ] AFE-C-3 Home「待确认」chip 软竞争

---

## 未改（硬边界）
- HITL gate 语义、DomainCommand、onHitl/onGate 逻辑
- ENTRY/FULL 已关 P0/P1 行为
- 未动 Cloud Agent

## 可点 URL
- Home: http://127.0.0.1:5175/agent
- 专利项目: http://127.0.0.1:5175/agent/projects/proj-demo-patent
- 通用项目: http://127.0.0.1:5175/agent/projects/proj-demo-general
- OA 会话: http://127.0.0.1:5175/agent/sessions/sess-oa-1
- Catalog: http://127.0.0.1:5175/agent/agents

## Blockers
无。Must 全清；Should 1–7 已落地；Could 未做。

## SHA
见本提交 `git rev-parse HEAD`（push `origin dev` 后回填）。
