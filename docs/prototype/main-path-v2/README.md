# 虚拟知产公司 · 主路径预览（本机）

**产品**：虚拟知产公司  
**路径**：`docs/prototype/main-path-v2/`  
**权威**：vision `2ffbb7d` · pages `0bc7ce9`（§4.3a 专业部门页 · 换面）· combine `4483d2e`  
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
| `cases.html` | 案盘 / 项目列表 |
| `case-new.html` | 开案子 · 可顺手发起持续委托 |
| `company.html` | 一案总览：案况 + 七部网格 + 需我处理 + 顾言委托；弱链「看专业能力 / 编制」 |
| `professional.html` | **专业部门页（§4.3a）**：能力/编制面；七部能力卡 + ≤3 专家；CTA「去该部干活」→ 项目档部门台 |
| `dept.html` | 一屏 Cursor 三栏（左~200 / 中1fr / 右~260–280）；两工作台 B；G1 齐套闸 |
| `pending.html` | 四类确认类型标签 · 通过后交付快照 · 自批禁用 |
| `shell.css` / `app.js` | 纸感 token · 角色/三档换面 · 委托状态 · 快照 |

## 怎么验

1. **薄入口**：`home.html` — 企业有案主 CTA=进入本公司；无案=开案子；顾言委托次级；「现在需要我处理」。  
2. **持续委托链**：首页/公司提交目标 → `delegate.html` → `dept.html` → 勾齐交卷 → `pending.html` → 通过见快照。  
3. **三档换面**：顶栏「助手」→ 侧栏与七部地图隐藏；「项目」→ 公司/部门作业面；「专业」→ **着陆 `professional.html`**（能力卡，一眼异于作业面）。**作废**同面加密度。  
4. **去该部干活**：专业页 CTA → 切回项目档并进 `dept.html` Cursor 三栏。  
5. **两工作台 B**：`dept.html?role=enterprise` 中栏见事项/已确认事实/待决策；`?role=agency` 卷宗三栏更满。**禁**文书/协同双视图。  
6. **闸与快照**：公司齐套缺口主 CTA→部门台齐套（非直进确认）；未齐套交卷禁用；确认页拍板。  
7. **品牌与纸感**：处处「虚拟知产公司」；浅色纸感；无暗色 OS 皮；无 Kimi 橙。

## 约束

浅色 · 禁两套壳 · 禁万能助手 · 宣传在登录前 · 未改 `apps/agent` · 无 Figma。
