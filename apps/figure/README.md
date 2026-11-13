# apps/figure · 附图生成·编辑（样机）

对照样机：**上下文 → mock 生成草图 → 画布编辑（标注/图层/撤销）→ 版本资产 → 可挂文档章**。  
**样机 · 无真文生图 · 生成+编辑双闭环**。

规格：`docs/architecture/figure/`（README · overview · human-ui · deep-demo）。

## 启动

在 **repo 根**：

```bash
npm run dev:figure
```

→ http://localhost:5187

```bash
npm run typecheck -w @ip/figure
```

## 诚实边界

无真文生图、无 CAD；SVG 模板占位。挂章仅为 toast + 事件日志 + 深链 `APP_DEV_URLS.docHarness`（`@ip/contracts`）。不改 APP_PORTS / 五壳 / doc-harness 业务码。
