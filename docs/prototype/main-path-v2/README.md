# 虚拟知产公司 · 主路径预览（本机）

**产品**：虚拟知产公司  
**路径**：`docs/prototype/main-path-v2/`  
**权威**：跟齐 lifecycle 正式文（缺口主 CTA 只落公司 · home 助手无墨色大卡 · 登录一律助手）；proto 以本 commit 为准  
**取代**：`docs/prototype/main-path/`（旧版保留归档，不覆盖）  
**禁**：改 `apps/agent`；占端口 5174；改 Kimi Downloads 源码

## 怎么打开

```bash
cd docs/prototype/main-path-v2 && python3 -m http.server 8766
# http://127.0.0.1:8766/
```

建议从 `welcome.html` / `login.html` 进入（登录后一律 `home.html` · 助手高亮）。

## 页面

| 文件 | 说明 |
|---|---|
| `welcome.html` | 宣传站（登录前）· 示范缺口桥接「登录后进公司页」· 主按钮「登录干活」|
| `login.html` | 企业 / 代理演示身份 → **一律 home · mode=assistant** |
| `home.html` | **薄入口 / 助手**：委托+进行中/待接力；弱提示盯案用项目/选部用专业；弱链进公司；**无**墨色缺口大卡 |
| `delegate.html` | **持续委托可点链**（非登录后第一跳）：提目标 → 计划 → 工作台 → 接力 |
| `cases.html` | 案盘可发现 · 白话卡点 · 筛选 · 空态「还没有案子」 |
| `docket.html` | **期限台**（后勤弱入口）· 逾期标红 · 空态诚实 |
| `billing.html` | **账单/委托**（后勤弱入口）· 官费/服务费分口袋 · 空态诚实 |
| `members.html` | **成员与权限**（后勤弱入口）· 谁能拍板（非专家墙） |
| `case-new.html` | 开案子字段短 · 目标可选 · 主钮进公司（委托次级） |
| `company.html` | 一案总览：卡点/下一步/谁在干；**当前部默认露出**；缺口唯一墨色主 CTA；其余六部可折 |
| `professional.html` | **专业部门页**：能力/编制面；七部能力卡 + 在办/缺口；可「添加专家」轻配；技能/MCP 默认收折；「让该部开工」 |
| `dept.html` | 一屏 Cursor 三栏；两工作台 B；G1 齐套确认（右栏拍板） |
| `pending.html` | **已废主 hops** · 软跳转 `dept.html?gate=1` |
| `shell.css` / `app.js` | 纸感 token · 角色/三档换面 · 委托状态 · 快照 |

## 怎么验

1. **登录 → home 助手**：顶栏「助手」高亮；**无**墨色缺口大卡；弱链可见。
2. **项目三态**：点「项目」——有活跃→公司 / 无活跃→案盘 / 无案→开案子。
3. **公司缺口主 CTA**：公司页有且仅一处墨色「去当前部门」（案况条）；有缺口时 need-me 只开一条主卡点；**七部默认折**。
4. **持续委托链**：首页/公司提交目标 → `delegate.html` → `dept.html` → 右栏通过/驳回（`pending.html` 仅软跳）。
5. **三档换面**：助手=委托面；项目=三态着陆；专业=professional（须带案；MCP 默认收折；在办/缺口行）。
6. **右栏闸**：`dept.html` 缺项/交卷禁用/通过驳回可见。
7. **后勤三页**：期限/账单/成员；空态诚实。
8. **品牌与纸感**：处处「虚拟知产公司」；浅色纸感；无暗色 OS 皮；无 Kimi 橙。

自动化：`tools/_tmp_shots/mpv2-close/accept-close.mjs`（对 8766）。

## 约束

浅色 · 禁两套壳 · 禁万能助手 · 宣传在登录前 · 未改 `apps/agent` · 无 Figma。
