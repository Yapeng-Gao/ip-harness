# 虚拟知产公司 · 主路径预览（本机）

**产品**：虚拟知产公司  
**路径**：`docs/prototype/main-path-v2/`  
**权威**：vision `031c412`/`203e401` · pages `38e330c` · combine `4483d2e`  
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
| `welcome.html` | 宣传站 · 大标题「虚拟知产公司」· 七部货架 · CTA 登录 |
| `login.html` | 企业 / 代理演示身份 → 薄入口 |
| `home.html` | **薄入口**：角色主 CTA + 顾言持续委托同区次级 +「现在需要我处理」轻量轨 |
| `delegate.html` | **持续委托可点链**：提目标 → 计划可调 → 部门执行 → 确认 → 接力 |
| `cases.html` | 案盘 / 项目列表（专业档加卷宗列密度） |
| `case-new.html` | 开案子 · 可顺手发起持续委托 |
| `company.html` | 一案总览：案况 + 七部网格 + 需我处理 + 顾言委托；专业档多案密度 |
| `dept.html` | 一屏 Cursor 三栏（左目录 / 中可编产物 / 右对话+确认）；两工作台 B 同模板不同权重；G1 齐套闸 |
| `pending.html` | 四类确认类型标签 · 通过后交付快照 · 自批禁用 |
| `shell.css` / `app.js` | 纸感 token · 角色/三档真行为 · 委托状态 · 快照 |

## 怎么验

1. **薄入口**：`home.html` — 企业有案主 CTA=进入本公司；无案=开案子；顾言委托次级；「现在需要我处理」。  
2. **持续委托链**：首页/公司提交目标 → `delegate.html` → `dept.html` → 勾齐交卷 → `pending.html` → 通过见快照。  
3. **三档**：顶栏切「助手」→ 侧栏与七部地图隐藏；「项目」日常；「专业」=同底座卷宗/多案/三栏密度（**不**另开第二套壳）。  
4. **两工作台 B**：`dept.html?role=enterprise` 中栏见事项/已确认事实/待决策（左树默认可收）；`?role=agency` 卷宗三栏更满。**禁**文书/协同双视图。  
5. **闸与快照**：公司齐套缺口主 CTA→部门台齐套（非直进确认）；未齐套交卷禁用；确认页拍板。  
6. **品牌与纸感**：处处「虚拟知产公司」；浅色纸感；无暗色 OS 皮；无 Kimi 橙。

## 约束

浅色 · 禁两套壳 · 禁万能助手 · 宣传在登录前 · 未改 `apps/agent` · 无 Figma。
