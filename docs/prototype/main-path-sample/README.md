# 主链样机 · main-path-sample

中高保真可点主链：大厅 → 前台分诊 → ④交底 → 工单交⑤（+ ⑤/⑥关键闸薄做）。

**真源**：[`../MAIN_PATH_SAMPLE_IA.md`](../MAIN_PATH_SAMPLE_IA.md) · 交互大纲 · 故事板 ④⑤⑥  
**不做**：改造 `apps/agent`；复活已删 main-path/v2/v3/v4。

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
4. 看编制与交底正文 → 完成「事实确认」与「可交⑤」（分两道）  
5. 开④→⑤工单 → 打开案卷抽屉四页签  

支路：大厅可直达④（B1）；无交底冲⑤会被挡回（B2）。

## 验收烟测

```bash
# 先起 8769，再：
node smoke.mjs
```

报告写到 `../../../tools/_tmp_shots/sample-accept/smoke-report.json`。
