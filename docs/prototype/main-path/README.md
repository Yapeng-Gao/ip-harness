# 主路径可点原型（浅色）

**产品**：外挂知识产权部  
**路径**：`docs/prototype/main-path/`  
**对齐**：`docs/lifecycle/product-pages.md` · `docs/superpowers/specs/2026-10-23-main-path-ui-design.md`  
**日期**：2026-10-23（Asia/Shanghai）

## 怎么打开

```bash
cd docs/prototype/main-path
python3 -m http.server 8765
# http://127.0.0.1:8765/
```

也可 `file://` 直接打开任意 html（相对链接可用）。

## 主路径（权威文件名）

| 步 | 文件 | 要点 |
|---|---|---|
| Hub | `index.html` | 串联入口 |
| F1 宣传站 | `welcome.html` | 货架七部 + 场景 + 橱窗 · CTA 登录 · 无交卷 |
| F2 登录 | `login.html` | 企业/代理 · → thin-home |
| F3 薄入口 | `thin-home.html` | 三入口 + 待确认 · 无七部墙 |
| F4 公司首页 | `company-home.html` | 七部等宽卡 + 抽屉 · 去当前部门 |
| F5 部门台 | `dept-workbench.html` | Cursor 三栏 · 点目录换中栏 · 勾齐套解锁交卷（G1） |
| F6 确认页 | `pending-confirm.html` | 通过移交 / 驳回回流 · 自批禁用（G2/G3） |

样式：`proto.css`（浅色 token）。

兼容跳转壳（旧名）：`home.html` → thin-home · `company.html` → company-home · `pending.html` → pending-confirm · `dept.html` → dept-workbench。

## 交互

- **部门台**：左树切换中栏文档；右侧勾「权属声明」→ 齐套 6/6 → 交卷可用 → 进确认页。
- **公司首页**：点部开抽屉（Esc/遮罩关）；「去该部干活」。
- **确认页**：通过 → 公司首页；驳回 → 部门台；自批按钮禁用。

## 约束

浅色 · 禁暗色 · 禁假 KPI · 禁 Agent/Harness 黑话 · 无 Figma MCP · 无云端 · 未改 `apps/agent` 实现。
