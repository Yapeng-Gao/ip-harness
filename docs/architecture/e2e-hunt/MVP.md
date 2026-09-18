# e2e-hunt · MVP 任务单（N2 收口刀）

> 规格底：`docs/architecture/e2e-hunt/`（Pass `4c83476` / REVIEW `fab595f`）  
> **不做**：替换 L0；全壳扫；heap 默认开；CI 阻断。

## 成功标准

1. 通用 Driver 语义 ≤10 动作（goto/click role|testid/fill/scroll/wait/snapshot/stop）  
2. CheapSignals：console error · pageerror · requestfailed（可白名单）  
3. 每步：截图 + a11y/snapshot 摘要  
4. AgentLoop：observe→decide→act→judge + maxSteps/去重/中止  
5. 产出 `report.json` + `report.md`（契约见 report-contract.md）  
6. **一条** CasePack：优先 `CP-search-smoke`（:5182）或 `CP-agent-hitl`（:5175）  
7. Driver MVP：Cursor 自动浏览器；Playwright 后置不挡 MVP  

## 目录建议（实现时）

`tools/e2e-hunt/` 或 `packages/e2e-hunt/`（与 `e2e/` L0 并列，勿混进 l0-smoke）

## 验收

- 人为跑通 1 条 CasePack，报告含至少 1 条证据链步骤  
- L0 `npm run test:e2e` 仍绿、不被 Hunt 绑架  
- 样机诚实：mock 横幅不记缺陷  

## Owner

总控派「猎虫」实现 Owner 或 e2e 助手兼做；开干前读完本目录全篇。
