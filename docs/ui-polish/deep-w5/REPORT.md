# Deep Wave 5 — Mid 节点视觉抛光

## 1. 改了什么

### CaseDetail（`src/pages/CaseDetail.tsx`）
- **节点进度**：阶段改为可展开/折叠（默认仅展开当前阶段）；当前阶段 `mid-node-stage[data-current]` 强调色底 + **accent rail**
- **当前步高亮**：子步骤用 `mid-node-step[data-active|done|pending]`；有写回水位时当前步 accent 填充圆点 + 左侧 rail
- **阶段进度条**：当前阶段环高亮、字重层次
- **闸门清单**：改用既有 `wb-check-row` + `data-checked`（视觉态，未改 toggle 语义）

### Pipeline（`src/pages/Pipeline.tsx`）
- 阶段筛选改为 `segmented` / `segmented-item`
- 列容器 `mid-pipeline-col` + 头栏层次；空列 dashed inset
- 案件卡 `mid-pipeline-card`：密度/圆角/阴影；`data-action` 待办卡 accent rail + 软底

### Docket（`src/pages/Docket.tsx`）
- 视图切换对齐 `segmented`
- 规则表 / 列表 / 月历外框改 `surface-card`；维持提示用 `wb-inset`
- 列表行 `mid-docket-row`：`data-state=default|warn|critical|writeback|done`（hover / focus-within 含 accent rail）
- 月历卡 `mid-docket-cal` 同态；逾期/critical 优先于 writeback

### 共用 token（`src/index.css`）
- 新增 Deep W5 工具类：`mid-node-*` / `mid-pipeline-*` / `mid-docket-*`（4/8 间距、concentric radius、accent rail）

## 2. 截图路径
`docs/ui-polish/deep-w5/` 与 `.ui-evidence/deep-w5/`（before 未覆盖）：

| 证据 | before | after |
|------|--------|-------|
| case-detail-nodes | ✅ | ✅ |
| pipeline | ✅ | ✅ |
| docket | ✅ | ✅ |
| case-detail-checklist | — | ✅（附加） |

## 3. 怎么验
```
http://127.0.0.1:5173/cases/c1?tab=overview   # 节点进度展开/当前阶段 rail；闸门清单 wb-check-row
http://127.0.0.1:5173/pipeline                # segmented 筛选 + 待办卡 accent
http://127.0.0.1:5173/docket                  # 行态：done 绿 rail / default hover
```
`npm run dev:mid` · 端口 **5173** · 分支 `dev`

## 4. 刻意未做
- 未改 contracts / Persona 闸 / dispatchCommand / docket escalate 语义 / 期限计算
- 未改工作台 flows（W4）；未启动 W6
- 未 push；`@ip/ui` 包源码未动
- 未伪造写回水位（无进度时无「当前步」文案，仅当前阶段展开+rail）

## 5. typecheck
`npm run typecheck -w @ip/mid` — **通过**（`@ip/ui` 未改）

## 6. blockers
- 当前租户可见 Docket 样例以 `done` + `default` 为主；`critical/warn` CSS 与优先级已就位，需有对应可见事件才出红/橙 rail
- 曾遇旧 Vite 进程缓存未热更新；已重启 `dev:mid` 后证据有效
