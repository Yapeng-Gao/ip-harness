# 路线图

## MVP（先做）

1. 冻 Driver 语义（≤10 动作）+ report.json schema  
2. CheapSignals 订阅 + 每步截图/a11y  
3. Cursor 浏览器 Driver  
4. 一个 Adapter + **一条** CasePack（建议 search 或 agent HITL）  
5. AgentLoop + 中止/去重 + report.md  
6. 规格评审 Pass  

**不做**：全壳扫、heap、CI 阻断、Playwright 批跑。

## 增强

- Playwright Driver 对齐同一契约  
- CDP Network/Performance 抽查档  
- 更多 CasePack（fto 五步、figure 双闭环）  
- finding → 可选工单/注释  

## CI

- Nightly Hunt（限步数、限壳）  
- PR：仅 L0（+ 可选 L1）；Hunt 附件人工看  
- 升级策略：连续复现的 fail_hard 可升「建议 L1」  

## 与 N 波

| 波 | 关系 |
|----|------|
| N1 UI | 并行；Hunt 不阻塞质感 |
| N2 样机缺口 | Hunt CasePack 可验跨口/深链 |
| 本包 | 文档先行 → MVP 另开 `e2e-hunt` 实现 Owner |
