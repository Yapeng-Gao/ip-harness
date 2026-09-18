# AppAdapter · ip-harness

## 1. 范围

多 Vite 壳样机：`APP_PORTS` 五壳 + 并行壳（doc-harness / ai-* / search / fto / mining / inspire / landscape / figure）+ api-mock。

## 2. Adapter 配置项（示意）

| 字段 | 例 |
|------|-----|
| `entryUrls` | `{ mid: "http://localhost:5173/", search: "http://localhost:5182/", ... }` |
| `loginStrategy` | iam 薄壳 / 跳过（样机常无真 SSO） |
| `honestySelectors` | 含「样机」横幅的地标 |
| `checkpoints` | 按壳：如 search「三模式 Tab」、fto「五步」、figure「生成+画布」 |
| `casePacks` | 见下 |
| `issueTaxonomy` | 映射到内部问题类（可选 S1/S2…） |

## 3. CasePack 示例（MVP 只做 1～2 个）

| ID | 目标 | 壳 |
|----|------|-----|
| `CP-search-smoke` | 关键词检索→列表可见→开详情 | search:5182 |
| `CP-agent-hitl` | 进入办理→HITL 区可见 | agent:5175 |
| `CP-fto-five` | 五步走到报告页（不要求真引擎） | fto:5183 |

材料夹：种子账号/无需上传则空；需要上传时 adapter 提供文件选择器策略。

## 4. 与 L0 关系

Hunt **不替代** `e2e/l0-smoke.spec.ts`。  
发布前仍：L0 必绿；Hunt 报告附件供人审。

## 5. 并行壳策略

优先 Hunt 检查点覆盖 5182–5187；**不要**先为每壳堆 L1 click 链。
