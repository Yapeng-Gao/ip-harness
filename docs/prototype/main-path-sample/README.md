# 主链样机 · main-path-sample

**产品**：Novada Team

中高保真可点主链：大厅（接待+八部+老板待办）→ ④交底协同+两道硬请示 → 工单⑤ → ⑤关键闸 **A/B/C 可见** →（可点）⑥。

**真源**：[`../MAIN_PATH_SAMPLE_IA.md`](../MAIN_PATH_SAMPLE_IA.md) · 交互大纲 · 故事板 ④⑤⑥ · `一期-产品逻辑` / `一期节点`  
**不做**：改造 `apps/agent`；lifecycle 三 tab；已删的旧 main-path 对照包。

## 启动

```bash
cd docs/prototype/main-path-sample
python3 -m http.server 8769
```

浏览器打开：<http://127.0.0.1:8769>

## Happy Path（演示）

1. 大厅点「前台接待」→ 用「加载样例材料」  
2. 看分析结果 → **确认去向：交底部**（未确认不能进部）  
3. 交办清单 → 进入交底部  
4. 看编制与交底正文 → 完成「事实确认」与「可交⑤」（分两道硬请示，不可 Toast 冒充）  
5. 开④→⑤工单 → 申请部接单  
6. ⑤ 看见 **A 理解 / B 查新·申不申 / C 撰写递交** 三段 → 分钮确认 → 过线后再「确认递交」  
7. （可选）⑥：争点理解 → 缩限 → 本轮递交  

支路：大厅可直达④（B1）；无交底冲⑤会被挡回（B2）；①②③⑦⑧ 进得去+合格线+禁超卖。

## 验收烟测

```bash
# 先起 8769，再：
node smoke.mjs
```

报告写到 `../../../tools/_tmp_shots/sample-accept/smoke-report.json`。
