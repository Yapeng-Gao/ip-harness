# 主链样机 · main-path-sample

**产品**：Novada Team（外挂 IP 部 / 虚拟知产公司）  
**形态**：中保真可点主链 · **整站对标 agent 工作台密度**（Kimi / Codex / WorkBuddy）· 纸墨墨蓝  
> 业务闸门扎实；**仍不自称已追平三家产品壳**——密度与驾驭感本轮拉近，视觉精致度仍有差距。

**真源**：[`../MAIN_PATH_SAMPLE_IA.md`](../MAIN_PATH_SAMPLE_IA.md) · `一期-产品逻辑` / `一期节点` · [Agent工作台对标](../../产品-老板思路/一期-产品逻辑/Agent工作台对标-2026-10-30.md) · [Kimi复用清单](../../产品-老板思路/一期-产品逻辑/Kimi复用清单-2026-10-30.md)  
**不做**：`apps/agent`；lifecycle 三 tab；不把 Kimi 跨案首页抄成 IA；色不跟 Kimi 橙；不抄成通用纯聊天丢掉八部/硬请示。

## 启动

```bash
cd docs/prototype/main-path-sample
python3 -m http.server 8769
```

浏览器：<http://127.0.0.1:8769>

## Happy Path

1. **登录门** → 选企业/代理所 · 已有工作 → 进入  
2. 大厅：问候计数 + **委托 composer** + 要你拍的 + **进行中轨** + 八部  
3. 交给前台 → 分析轨迹 → 确认去向 → 交底部  
4. ④：编制（1:1/看产出）+ 时间线 + 硬请示依据 + **feed 工具芯片** + composer  
5. 工单④→⑤（agent 交接条）→ ⑤ A/B/C + composer →（可）⑥ + composer  

## 本轮整站改动（按页）

| 页 | 改了什么 |
|---|---|
| **登录门** | 新建：身份 + 已有/首次 + 进入（对标 Kimi login，不采集账户） |
| **壳顶栏** | 大厅/案卷 · ⌘K · 通知铃 · 企业/代理所切换 · 案卷芯片 |
| **大厅** | 问候计数 · 统一委托 composer · 待办标签/期限/CTA · 进行中案轨 · 八部次之 |
| **前台** | 分析中/后 **agent 步骤轨迹** |
| **④交底** | feed **工具芯片** · 进行中头像 pulse ·（保留时间线/硬请示/composer/编制） |
| **工单 H45** | 双方 agent 条 + 交接步骤 |
| **⑤⑥** | 侧栏贴底 **composer** |
| **薄部** | 部顶栏 + 合格线/状态卡 + composer 禁用 stub |
| **B2 挡板** | 部壳 + agent 挡回步骤 |

## 烟测

```bash
node smoke.mjs
```

报告：`../../../tools/_tmp_shots/sample-accept/smoke-report.json`

硬请示 / 薄部禁超卖 / 前台闸 / B2 **不得回退**。
