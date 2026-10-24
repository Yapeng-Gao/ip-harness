# 主路径可点原型（浅色）

**产品**：外挂知识产权部  
**路径**：`docs/prototype/main-path/`  
**对齐**：
- design spec `82c202c`（`docs/superpowers/specs/2026-10-23-main-path-ui-design.md` · Frame 5 两工作台 B · Frame 3/§3.5 知产负责人）
- vision `9fb0307` · pages `9fa961d`
**日期**：2026-10-24（Asia/Shanghai）

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
| F3 薄入口 | `thin-home.html` | 双角色一屏一主 CTA · 待确认+弱链 · **知产负责人「交办业务目标」弱入口**（MVP 增强、不拆 hops、禁万能 Agent） |
| 案盘 | `cases.html` | 多案流水 · 筛选 · 点进公司首页 · 开新案 |
| 开案子 | `case-new.html` | 极少字段 · **可选交办业务目标** · 创建→公司首页 · 无交底长表 |
| F4 公司首页 | `company-home.html` | 七部等宽卡 + 抽屉 · 去各部门台 |
| F6 确认页 | `pending-confirm.html` | `?dept=` 按部 payload · 通过移交 / 驳回回流 · 自批禁用（G2/G3） |

## 七部工作台（同模板 · 两工作台 B · G1）

**同一 HTML 路由模板**；`?role=agency|enterprise`（默认 agency）切换默认重心——**禁两套产品壳**。

| 角色 | 默认重心 | 怎么验 |
|---|---|---|
| 代理 `?role=agency` | 卷宗 Cursor 三栏（左目录 / 中产出 / 右对话+G1） | 中栏是全文产出 |
| 企业 `?role=enterprise` | 简版重心（事项 / 已确认事实 / 待决策）；左目录默认收折，可点「目录」展开；右栏仍 G1+确认 | 中栏三块简版；截图应能与代理态区分 |

| 部门 | 文件 | 交卷物 / 缺项演示 |
|---|---|---|
| 交底部 | `dept-workbench.html` | disclosure · 缺权属声明 · **对照页优先** |
| 查新部 | `dept-research.html` | research_report · 缺结论稿 |
| 立项部 | `dept-decision.html` | 决策书 + intake_quote · 缺决议签署 |
| 撰写部 | `dept-draft.html` | draft_claims · 缺权项树 |
| 附图部 | `dept-figure.html` | 附图包 · 缺图号核对 |
| 递交与程序 | `dept-filing.html` | 申请包 + filing_check · 缺授权人确认 |
| 审查答复 | `dept-oa.html` | OA答复稿 · 缺企业确认意见 |

样式：`proto.css`（浅色 token）。

兼容跳转壳（旧名）：`home.html` → thin-home · `company.html` → company-home · `pending.html` → pending-confirm · `dept.html` → dept-workbench。

## 交互

- **部门台**：顶栏「代理 / 企业」芯片或 `?role=`；左树切换中栏文档（代理）；企业简版中栏为事项/事实/决策；右侧勾缺项 → 齐套满 → 交卷可用 → `pending-confirm.html?dept=…`（G1）。
- **薄入口知产负责人**：点「交办业务目标」展开短表（目标一句话 + 类型占位）；提交 toast 后进公司首页——不跳过公司隐喻、不开万能 Agent。
- **开案子**：可选折叠「交办业务目标」；创建仍进公司首页。
- **公司首页**：点部开抽屉；「去该部干活」链到对应 `dept-*.html`。
- **确认页**：通过 → 公司首页；驳回 → 部门台；自批按钮禁用。

## 验收截图建议

1. `dept-workbench.html?role=agency` → 三栏卷宗全文  
2. `dept-workbench.html?role=enterprise` → 中栏事项/事实/决策 + 左收折 + 右 G1  
3. `thin-home.html#goal` → 弱入口展开（非第二大 CTA）  
4. `case-new.html` → 展开可选交办块后仍「创建并进入公司首页」

## 约束

浅色 · 禁暗色 · 禁假 KPI · 禁 Agent/Harness 黑话 · 无 Figma MCP · 无云端 · 未改 `apps/agent` 实现。
