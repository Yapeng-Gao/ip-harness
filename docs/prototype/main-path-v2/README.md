# 外挂知识产权部 · 主路径预览（本机）

**产品**：外挂知识产权部  
**路径**：`docs/prototype/main-path-v2/`  
**权威**：combine `4483d2e` · vision `6aa679e` · pages `baff817` · design（本轮 sync）  
**取代**：`docs/prototype/main-path/`（旧版保留归档，不覆盖）  
**禁**：改 `apps/agent`；占端口 5174；改 Kimi Downloads 源码

## 怎么打开

```bash
cd docs/prototype/main-path-v2 && python3 -m http.server 8766
# http://127.0.0.1:8766/
```

建议从 `welcome.html` / `index.html` 进入。

## 页面

| 文件 | 说明 |
|---|---|
| `welcome.html` | 宣传站 · 大标题「外挂知识产权部」· 七部货架 · CTA 登录 |
| `login.html` | 企业 / 代理演示身份 → 薄入口 |
| `home.html` | **薄入口**：一主 CTA（顾言持续委托 / 案盘）+「现在需要我处理」轻量轨；无跨案经营台 |
| `delegate.html` | **持续委托可点链**：提目标 → 计划可调 → 部门执行 → 确认 → 接力 |
| `cases.html` | 案盘 / 项目列表 |
| `case-new.html` | 开案子 · 可顺手发起持续委托 |
| `company.html` | 七部网格（按档显隐）+ 交付快照槽 + 专业工作室占位 |
| `dept.html` | 同一模板两工作台 B；**文书 ↔ 协同** Tab；G1 齐套闸 |
| `pending.html` | 四类确认类型标签 · 通过后交付快照 · 自批禁用 |
| `shell.css` / `app.js` | 纸感 token · 角色/三档真行为 · 委托状态 · 快照 |

## 怎么验（combine 六条）

1. **薄入口**：`home.html` — 企业主 CTA=顾言持续委托；下方「现在需要我处理」；无 KPI/经营台。  
2. **持续委托链**：首页提交目标 → `delegate.html?step=plan` → 确认计划 → `dept.html` → 勾齐交卷 → `pending.html` → 通过见快照 → 接力。  
3. **三档**：顶栏切「助手」→ 侧栏与七部地图隐藏（公司页可唤回）；「项目」日常；「专业」工作室占位。  
4. **两工作台 B**：`dept.html?role=agency` 卷宗三栏；`?role=enterprise` 简版；顶栏「文书/协同」Tab。  
5. **闸与快照**：未齐套交卷禁用；确认页类型标签；通过后快照；自批禁用。  
6. **品牌与纸感**：处处「外挂知识产权部」；浅色纸感；无暗色 OS 皮。

## 约束

浅色 · 禁两套壳 · 禁万能助手 · 宣传在登录前 · 未改 `apps/agent` · 无 Figma。
