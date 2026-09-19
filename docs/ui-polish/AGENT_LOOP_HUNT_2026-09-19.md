# Agent 壳 · 闭环① Hunt/CDP · AGENT_LOOP_HUNT

| 项 | 值 |
|----|-----|
| **日期** | 2026-09-19（Asia/Shanghai · ~10:35 CST） |
| **对象** | Agent 壳 `@ip/agent` · **localhost:5175** |
| **CasePack** | `CP-agent-hitl` |
| **Command** | `npm run hunt:agent-hitl` |
| **禁止** | CloudAgent / L5 / 改 `apps/` · **heap 默认关** |
| **总控点名** | `docs/ui-polish/AGENT_LOOP_HUNT_2026-09-19.md` |

## Pass/Fail

**Pass**（验证跑 · status=`passed` · findings 0）

## 跑次

| 轮次 | runId | status | steps | findings |
|------|-------|--------|-------|----------|
| 改前基线 | `3f70cd9f-8a1f-4368-9cb8-9ef3ed9cbd53` | passed | 2 | 0 |
| 接线后验证 | `6a8f3bb7-0eac-47b5-9412-430d4bdd3fa4` | **passed** | 2 | **0** |

## findings

计数：**fail_hard=0 · suspect=0** · 列表：_无_

## artifacts

- 验证跑：`tools/e2e-hunt/artifacts/6a8f3bb7-0eac-47b5-9412-430d4bdd3fa4/`
  - `report.json` / `report.md` / `step-001.png` / `step-002.png`
- 基线：`tools/e2e-hunt/artifacts/3f70cd9f-8a1f-4368-9cb8-9ef3ed9cbd53/`

## CDP / 信号做了什么

- **CheapSignals**（默认开）：console / pageerror / requestfailed；drain **全量**进 `steps[].signals`（白名单标 `whitelisted`）；judge 仍跳过白名单。
- **增强 Network**（本 Case **opt-in** `enhancedTelemetry: 'network'`）：Playwright request/response 轻量摘要 → `summary.network` + 逐步 `networkDelta`（失败 URL/方法/原因 · 慢请求 >2s 计数）；`report.telemetry = { mode: 'network', heap: false }`。
- **heap**：**未开**（对齐 `signals-and-telemetry.md` §2）。
- `report.md` 新增小节：**CheapSignals / 失败请求摘要**。
- 验证跑摘要：`failed=0 · slow=0 · reqs=258`（Vite 资源多，属噪音计数，非缺陷）。

## SHA

`d54e50f08f5cae5ec6a784e2c0f068ebbb92a57b`

## 优化建议

1. **Vite 请求计数噪音**：dev 下 `requestCount≈258/2 步` 偏高，摘要可排除 `node_modules` / `@vite` / HMR，或仅计 XHR/fetch。
2. **白名单 hydration 噪声**：`rules.ts` 已吞嵌套 `<a>` hydration；若回归再冒，优先查壳侧而非 Hunt 扩白。
3. **Network 失败抽样上限**：当前保留最近 20 条；长 Case 若需全量，可落 `network-failures.jsonl` 旁路文件。
