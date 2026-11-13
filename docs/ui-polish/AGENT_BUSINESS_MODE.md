# Agent 业务模式（我的案子冷启动 · 2026-09-21 CST）

叠权威 `c3fffe4`（[agent-business-mode](../architecture/product-apps/agent-business-mode.md)）+ `b53546f` 纪律（Confirm 真闭环、进度同源、禁 mid 深链）。  
仅 `apps/agent/**` + 本短记/截图。禁 Cloud；未改 mid/packages。

## 做了什么

| 项 | 实现 |
|----|------|
| `/agent` 冷启动 | **我的案子**列表 +「新建案子」→ 向导（非 Catalog） |
| Catalog | 迁 **`/agent/catalog`**（文案：专家工作台）；`/agent/experts` redirect |
| 默认 7 席 | 查新→立项→交底→撰写→附图→递交→审查答复；案子助手静默不计 7；更多专家折叠；Phase 灰显 |
| 向导时间线 | 准备→立项→撰写申请→递交→审查答复；主 CTA 推进/去确认 |
| 待我确认 | 首页预览 + 顶栏铃铛 + `/agent/pending` 收件箱/详情；Confirm 后进度与收件箱同源更新 |
| 隐藏 | 业务面默认藏租户/Persona/产品切换；Solo/Team 仅专家台旁路；`?debug=1` 可开调试壳 |
| 文案 | 禁用 Catalog/HITL/总控/Solo/Team 等上屏词（业务面用人话） |
| 样机诚实 | 页脚：「演示环境：进度与确认为样机闭环，非真递交局端。」 |

## 自点（`:5175` · Asia/Shanghai）

- [x] `/agent` 见「我的案子」，无 Catalog 超市
- [x] 新建案子进向导时间线（默认 7 席 + 更多专家折叠）
- [x] 待我确认可见（首页 + 铃铛 + 收件箱）；确认后进度推进、该项离开收件箱
- [x] `/agent/catalog` 仍有 16 席演示（专家工作台）
- [x] `npm run typecheck -w @ip/agent` 通过
- [x] 业务面无租户切换条（无 `?debug=1`）

## 截图

`docs/ui-polish/agent-business-mode/`

- `01` / `11` 我的案子首页
- `03`–`05` 新建向导（时间线 / 7 席 / 更多专家）
- `06` / `09` 案子工作台（确认前后）
- `07`–`08` 待我确认收件箱与详情
- `10` 专家工作台 16 席

## 旁路

- Solo：`/agent/sandbox`
- Team：`/agent/team`
- 专家工作台：`/agent/catalog`
