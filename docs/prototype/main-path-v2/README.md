# 主路径可点原型 v2（Kimi 观感）

**产品**：外挂知识产权部  
**路径**：`docs/prototype/main-path-v2/`  
**取代**：`docs/prototype/main-path/`（旧版保留为归档，不再打磨）

## 怎么打开

```bash
cd docs/prototype/main-path-v2
python3 -m http.server 8766
# http://127.0.0.1:8766/
```

建议从 `welcome.html` 或 `index.html` 进入。

## 页面

| 文件 | 说明 |
|---|---|
| `welcome.html` | 宣传站 · 大标题「外挂知识产权部」· 定位句钉死 · 七部货架 · CTA 登录 |
| `login.html` | 企业 / 代理演示身份 → 首页 |
| `home.html` | app-shell + 顾言式知产负责人 lead + 待确认轨；角色感知主 CTA |
| `cases.html` | 案盘 / 项目列表 |
| `case-new.html` | 开案子 · 可选交办业务目标 |
| `company.html` | 七部网格 + 抽屉 |
| `dept.html` | **同一模板两工作台**：`?role=agency` 卷宗三栏；`?role=enterprise` 简版（事项/已确认事实/待决策）；`?dept=` 切换七部 |
| `pending.html` | 待你确认 · `?dept=` payload · 自批禁用 · 通过/驳回 |
| `shell.css` / `app.js` | Kimi 纸感 token + 角色 / 齐套闸 |

## 怎么验（对照 Kimi）

1. 并排打开 Kimi 参考与本原型：顶栏品牌 + 侧栏 + 纸感浅色，应像同一产品家族。
2. `dept.html?role=agency` → 左目录 / 中交底书正文 / 右协作+齐套+交卷。
3. `dept.html?role=enterprise`（或顶栏切企业）→ 中栏事项·事实·决策；左可收折；右栏仍有齐套与交卷。
4. 缺项时交卷按钮禁用；勾满最后一项 → 交卷 → `pending.html?dept=…`；自批禁用；通过回公司首页，驳回回部门台。
5. UI 文案无设计黑话；闸以「齐套 / 交卷 / 待你确认」呈现。

## 约束

浅色 · 禁两套壳 · 禁万能助手 · 宣传在登录前 · 未改 `apps/agent` · 无 Figma。
