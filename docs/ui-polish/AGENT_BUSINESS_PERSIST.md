# Agent 业务态持久化（P0 · 2026-09-21 CST）

叠 `becca1e`（business mode）。仅 `apps/agent/**` + 本短记。禁 Cloud；未改 mid/packages。

## 活口

1. 新建案子 → 导航离开再进 → 「找不到这个案子」
2. Confirm 成功 → 刷新 → 收件箱数量/项回滚

## 根因

`BusinessCaseContext` 的案子列表（`caseIds` + meta）、进度（`progressById`）、待确认（`confirms`，含 confirmed/returned）仅 `useState` 内存；`ProjectFolder` 亦无业务案子快照。刷新 / Provider 重挂后回种子态。

## 修法

| 项 | 实现 |
|----|------|
| localStorage | 键 `ip-harness-agent-business-v1`（v:1） |
| 持久内容 | `caseIds` · `caseMeta`（title/summary/expertIds）· `progressById` · `confirms`（含 Confirm 后 status） |
| 合并策略 | 种子 id 以持久化为准（不回滚 Confirm/进度）；用户新建案子前置 |
| 回填 | mount 后按 `caseMeta` `createProject` 写入 ProjectFolder；首屏可用 meta 合成，避免闪「找不到」 |
| 非目标 | 未改 mid/packages；未用 sessionStorage（同标签刷新不够） |

## 重点文件

- `apps/agent/src/business/BusinessCaseContext.tsx`

## 自点（同标签）

- [ ] 新建案子 → 离开列表/其他路由 → 再进该案子仍在
- [ ] 待确认点确认 → 刷新 → 该项已确认且不在收件箱；铃铛/数量一致
- [ ] `npm run typecheck -w @ip/agent` 通过

## 样机诚实

演示环境本地持久，非真后端；清站点数据会回到种子两案。
