# 主链样机 · main-path-sample

**产品**：Novada Team  
**形态**：高保真可点主链（纸感密度 · 借 Kimi 壳感；IA＝大厅八部）

大厅（接待+八部+待你拍）→ ④交底协同+两道硬请示 → 工单⑤ → ⑤ A/B/C →（可点）⑥。

**真源**：[`../MAIN_PATH_SAMPLE_IA.md`](../MAIN_PATH_SAMPLE_IA.md) · 交互大纲 · `一期-产品逻辑` / `一期节点` · [高保真六维](../../产品-老板思路/一期-产品逻辑/高保真六维-2026-10-30.md) · [Kimi复用清单](../../产品-老板思路/一期-产品逻辑/Kimi复用清单-2026-10-30.md)  
**不做**：`apps/agent`；lifecycle 三 tab；已删旧 v2/v3；不把 Kimi 跨案首页抄成 IA。

## 启动

```bash
cd docs/prototype/main-path-sample
python3 -m http.server 8769
```

浏览器：<http://127.0.0.1:8769>

## Happy Path

1. 大厅「上传 / 开始」→「加载样例材料」  
2. 分析结果 → **确认 · 去交底部**  
3. 交办清单 → 进入交底部  
4. 编制+交底文书 → 两道硬请示（事实 / 可交⑤）  
5. 开④→⑤工单 → 申请部接单  
6. ⑤ 见 A/B/C → 分钮 → 过线后再确认递交  
7. （可选）⑥：争点 → 缩限 → 本轮递交  

## 烟测

```bash
node smoke.mjs
```

报告：`../../../tools/_tmp_shots/sample-accept/smoke-report.json`
