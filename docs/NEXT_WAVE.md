# N 波优先序（2026-09-18）

> 用户：额度刷新；下一刀由总控自定。

| 序 | 内容 | 状态 |
|----|------|------|
| **N1** | UI：`apple-design` + `make-interfaces-feel-better` + `web-design-guidelines` 重评 → 质感排修 | **Go** `6dc1675` / 复评 `6f24ea9` |
| **N2** | 样机缺口：跨口工作篮、深链/挂章、并行壳 e2e L0；e2e-hunt MVP 预备 | **收口中**（篮规格+并行 L0 已 Pass；Hunt MVP 待开） |
| **N3** | 检索数据面 / 模型训练 **落地 MVP 任务单**（跟定稿规格） | 排队 |
| **N4** | case-core · 真产业图谱 | 另立项 |

## N1 范围

1. UI评估：并行壳 `5182–5187` 全量 + 五壳 `5173–5177` 抽检；出 `docs/ui-polish/REVIEW_N1_*.md`  
2. 总控验收报告后：UI质感只修 P0/P1（有验收标准的项）  
3. 不改 contracts / HITL / Persona / STEPS；禁 Cloud Agent  

入口：`docs/ui-polish/UI_SKILLS.md`

## 相关方案

- 猎虫 Harness：[`docs/architecture/e2e-hunt/`](./architecture/e2e-hunt/README.md) · **规格 Pass** `4c83476` / REVIEW `fab595f`（N2 前后可开 MVP；不替代 L0）

## N2 范围（进行中）

1. **跨口工作篮约定**：文档 + 样机最小示意（search→fto/mining；诚实：不同端口 localStorage 不共享的现状与目标）  
2. **并行壳 e2e L0**：5182–5187 路由冒烟进 Playwright（不替代 Hunt）  
3. **e2e-hunt**：规格已 Pass；开 MVP Owner/任务单（Cursor 浏览器 + 1 CasePack），实现可另派  

残余 UI P2 不挡 N2。

- ~~跨口工作篮规格~~ **Pass** `4681bd4` / 补记 `2c7d477`
- ~~并行壳 e2e L0~~ **Pass** `3d737e8`（21 passed，含 5182–5187）
- e2e-hunt MVP：**待开**（规格已 Pass `fab595f`）
