# Dashboard v2-top — 看板顶栏 + 优先办理

## 1. 改了什么

### `src/pages/Dashboard.tsx`
- 去掉本页 sticky `PageHeader` 大白块；顶栏 + 「下一步 · 优先办理」合并为单一 `dash-board-top`
- **轻顶栏**：标题 / 机构 pill / 一行状态 + 快捷链（官方期限 · 我方承办…）与主次 CTA（知产 Agent / 进入业务工作台）光学对齐
- **优先办理条**：同源 `inbox[0]`；来源 pill + 案号标题 + 副文案；内联「期限 / 谁该动 / 闸」要点 + 主按钮「去办理/去确认」成一条行动单元
- 深链、Persona、`buildOpsInbox`、KPI 三卡、Inbox 语义未改

### `src/index.css`
- 新增 `dash-board-top` / `dash-board-head*` / `dash-board-quiet-link` 等
- 重写 `dash-next*`：琥珀强调条 + 内联 fact，而非第二张迷你看板卡

## 2. 截图路径

`docs/ui-polish/dashboard-v2-top/` 与 `.ui-evidence/dashboard-v2-top/`：

| 文件 | 说明 |
|------|------|
| `full-before.png` | 改前整页（未覆盖） |
| `top-before.png` | 改前顶两块特写（未覆盖） |
| `hero-before.png` | 改前「下一步」特写（未覆盖） |
| `full-after.png` | 改后整页 |
| `top-after.png` | 改后合并顶栏特写 |
| `hero-after.png` | 改后优先办理条特写 |
| `ladder-after.png` | 改后 ladder（顶栏→优先→KPI） |

## 3. 怎么验

```bash
# mid @ 5173（本波曾重启 Vite 以吃到共享 CSS/TSX）
open http://127.0.0.1:5173/
npm run typecheck -w @ip/mid
```

看点：单一顶卡 = 轻头 + 琥珀优先条；CTA 仍进 Agent / workbench；「去办理」仍用 `nextItem.href`；KPI / Inbox 外观与过滤不变。

## 4. 刻意未做

- 未改 Persona / `buildOpsInbox` / 计数 / Inbox 行 / KPI 三卡逻辑
- 未改共享 `PageHeader` 组件本身（仅 Dashboard 不再用 sticky 大头）
- 未 push；停在 `dev`；未开 Cloud Agent

## 5. typecheck

`npm run typecheck -w @ip/mid` — **PASS**

## 6. blockers

- mid Vite 对共享 `src/` 偶发缓存旧模块；本波 `kill` 后 `npm run dev -w @ip/mid` 才稳定吃到 `dash-board-top`。无功能 blocker。
