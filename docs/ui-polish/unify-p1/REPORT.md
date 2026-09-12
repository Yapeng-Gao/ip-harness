# unify-p1 · 跨壳视觉统一交付报告

| 项 | 值 |
|----|-----|
| **分支** | `dev`（未 push） |
| **权威** | `docs/ui-polish/DESIGN_SYSTEM.md` · `REVIEW_DEEP_2026-09-12.md` |
| **范围** | 视觉 only；未改 contracts / Persona / HITL / STEPS 语义；未开 Cloud Agent |
| **证据目录** | `docs/ui-polish/unify-p1/` ≡ `.ui-evidence/unify-p1/` |
| **日期** | 2026-09-12（用户时区 Asia/Shanghai） |

---

## 1. P1 验收矩阵（E→B→C→A→F→D）

### P1-E · violet/indigo 残留清扫 — **PASS**

| 项 | 内容 |
|----|------|
| **文件** | `WorkbenchHome`（apps+src）、`LayoutFlow`、`InventorPortal`、`Docket`、`Billing`/`Agencies`/`CaseDetail`/`Dashboard`/`DataStrategy`/`Insight*`/`OrgSettings`、`HandoffActionBar`、`IamLoginPage`、`ops/ui.tsx`、`AgentTierBadge`、`AuditReplayPanel`、`InsightDataBanner`、`workspaces.ts` 等 |
| **验收** | `rg 'violet-\|indigo-' apps src/pages --glob '*.tsx'` **0 命中**；主 CTA/态色改用 `primary` / `accent` / `status-*` / `token-info-*` |
| **结果** | **PASS**（本单末次 `rg` 无输出、exit 1） |

```text
$ rg 'violet-|indigo-' apps src/pages --glob '*.tsx'
# (no matches)
```

### P1-B · Catalog 展开 meta 墙字 — **PASS**

| 项 | 内容 |
|----|------|
| **文件** | `apps/agent/src/components/AgentPickerCard.tsx` · `src/index.css`（`.agent-meta-grid` 两列 / clamp / `.agent-meta-more`） |
| **验收** | 两列定义列表 + 标签弱化；超高「更多」折叠后三项；展开态截图 |
| **结果** | **PASS** · 证据 `agent-catalog-expanded-after.png` |

### P1-C · 会话上下文默认折叠 — **PASS**

| 项 | 内容 |
|----|------|
| **文件** | `apps/agent/src/components/AgentShell.tsx` · `src/components/agent/AgentShell.tsx` |
| **验收** | 待确认首次自动展开一次；常驻「上下文」chip + 未读数徽章 |
| **结果** | **PASS** · `sess-oa-1` 自动展开右栏；顶栏「上下文 · 2」· 证据 `agent-session-context-after.png` |

### P1-A · Pipeline 空列主导 — **PASS**（折叠路径）

| 项 | 内容 |
|----|------|
| **文件** | `src/pages/Pipeline.tsx` · `src/index.css`（`[data-empty]`） |
| **验收** | 空列可折叠/开关 **或** 评审租户 ≥4 阶段各 ≥1 卡 |
| **结果** | **PASS（开关路径）**：默认折叠空阶段 +「显示空阶段 (N)」；空列 `ui-empty` 含「打开工作台」动作 · 证据 `mid-pipeline-after.png` |
| **种子备注** | 当前演示「代理所租户 · 德恒知产」仅 **2 案 / 2 有案阶段**（答复+监控），空阶段折叠后看板干净。**若需「≥4 阶段各 ≥1 卡」演示路径，请 总控 → 中台 Owner 补 pipeline 租户种子**（本单未改业务数据契约，仅调 docket 日期做态色可见）。 |

### P1-F · Docket 态矩阵与色 token — **PASS**

| 项 | 内容 |
|----|------|
| **文件** | `src/pages/Docket.tsx`（去 indigo 态皮 → accent token）· `src/data/docketRules.ts`（`oa1_response` due → `2026-09-16` 进入 warn 窗） |
| **验收** | ≥1 warn、≥1 critical 轨色可见；无 indigo 态皮 |
| **结果** | **PASS** · 列表见逾期 critical 轨 +「剩余 5 天」warn · 证据 `mid-docket-after.png` |

### P1-D · Workbench tip/banner 叠层 — **PASS**

| 项 | 内容 |
|----|------|
| **文件** | `FormBlocks.tsx`（`WbStickyTip`）· `IntakeFlow.tsx` · `ResearchFlow.tsx` · `src/index.css`（`.wb-tip-sticky-slot`） |
| **验收** | 同视口 ≤1 sticky tip；info vs blocker 分级；blocker 不在折线以下 |
| **结果** | **PASS** · intake 红灯 sticky 单条置顶；内联 tip 降级为 muted/短句 · 证据 `wb-intake-tips-after.png` · `wb-research-tips-after.png`（demo 诚实横幅另计，DS-UX-HABIT-04） |

---

## 2. 扩围 · Color

| 动作 | 说明 |
|------|------|
| F1 清零 | 主产品 `apps` + `src/pages` tsx 无 `violet-*` / `indigo-*` |
| info 伪装 | `sky-*` 主路径改为 `token-info-chip` / `token-info-soft` / `accent-*`（Dashboard Inbox、ops StatusPill、Inventor/IAM 残留字色） |
| 状态色 | Docket escalate/primary 按钮改 accent soft；禁止 indigo CTA |

---

## 3. 扩围 · Layout

| 动作 | 说明 |
|------|------|
| Pipeline | 空阶段默认不占列宽；`data-empty` 弱化空列头 |
| Catalog meta | ≥420px 两列 grid；值 `-webkit-line-clamp: 3` |
| Shell pad | `.shell-content-pad` 统一 mid↔wb↔agent 内容边距 token |
| Agent shell | mid 镜像顶栏/背景与 agent 壳对齐（`app-shell-bg` / brand mark） |

---

## 4. 扩围 · UX-habits（对照 DS-UX-HABIT）

| ID | 自检 | 本单 |
|----|------|------|
| HABIT-01 首屏下一步 | mid `/` 主 CTA 保持 | 未破坏 · 证据 `mid-dashboard-after.png` |
| HABIT-02 默认展开 | 待确认会话自动展开上下文 | **已装** P1-C |
| HABIT-03 禁用理由 | Confirm 内联原因（P0 已有） | 未改语义 |
| HABIT-04 tip 上限 | ≤1 sticky | **已装** P1-D |
| HABIT-05 空态有动作 | Pipeline 空列「打开工作台」 | **已装** P1-A |
| HABIT-06 跨壳文案 | 顶 pill / 打开工作台动词 | 保持 |

---

## 5. DESIGN_SYSTEM §8 / §9 自检清单

- [x] 无 F1–F10（主路径 F1 清零；本单未引入 F2–F10 新债）
- [x] 同心圆角：meta / tip / pipeline empty 用既有 radius token
- [x] 扫视字段 chip 化：Dashboard Inbox 来源 pill → `token-info-chip`
- [x] 禁用主路径内联原因：未改 HITL Confirm
- [x] 五壳抽检：mid / wb / agent / ops / iam 均有视觉 token 对齐改动
- [x] DS-UX-HABIT 自检六项（见上表）

---

## 6. typecheck

| 包 | 命令 | 结果 |
|----|------|------|
| `@ip/mid` | `npm run typecheck -w @ip/mid` | **通过** |
| `@ip/workbench` | `npm run typecheck -w @ip/workbench` | **通过** |
| `@ip/agent` | `npm run typecheck -w @ip/agent` | **通过** |
| `@ip/ops` | `npm run typecheck -w @ip/ops` | **通过** |
| `@ip/iam` | `npm run typecheck -w @ip/iam` | **通过** |

---

## 7. AFTER 截图清单

| 文件 | 覆盖 |
|------|------|
| `mid-dashboard-after.png` | mid `/` |
| `mid-pipeline-after.png` | mid `/pipeline` · 空阶段折叠 |
| `mid-docket-after.png` | mid `/docket` · warn/critical |
| `agent-catalog-expanded-after.png` | catalog 展开 meta |
| `agent-session-context-after.png` | 待确认会话 + 上下文 chip |
| `wb-intake-tips-after.png` | intake sticky tip |
| `wb-research-tips-after.png` | research tips |

脚本：`scripts/unify-p1-shots.mjs`（本地 Playwright，非正式 e2e）。

---

## 8. 刻意未做

- 未 push；未开 Cloud Agent
- 未改 contracts / Persona 闸 / HITL / STEPS 判定
- 未扩改 draft/prosecution/maintain tip（P1-D 验收 URL 为 intake + research）
- mid `src/components/agent/AgentPickerCard.tsx` 仍为旧详情墙（agent 壳 5175 已用 apps 版 P1-B；mid `/agent` 外链为主）
- Pipeline「≥4 阶段满卡」种子留给中台 Owner

---

## 9. 给总控 / 评估

1. P1-A～F 均按验收闭环；建议短复评对照本报告证据。
2. **种子缺口**：代理所租户 pipeline 仅 2 有案阶段 — 若演示要「满列看板」请派 **中台 Owner** 补可见案种子（勿改闸语义）。
3. 合入前由人类 review working tree（约 36 files）后自行 commit/push。
