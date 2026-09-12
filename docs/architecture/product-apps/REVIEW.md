# product-apps 架构评审记录

| 项 | 值 |
|----|-----|
| 评审角色 | 架构评审 |
| 对象 | `docs/architecture/product-apps/` 九篇（README + mid/workbench/ops/iam + agent×3 + cross-cutting） |
| 工作区 | 评审时目录为 **未提交**（`??`）；总验请以推仓后 SHA 为准 |
| 日期 | 2026-09-12 |
| **结论** | **通过** |

## 尺子对照

| 尺子 | 结果 | 说明 |
|------|------|------|
| 五面齐全 | 过 | mid / workbench / agent / ops / iam + 对照表含 api:5180 |
| 父索引 | 过 | `architecture/README` 已链 product-apps |
| 样机诚实 | 过 | 各篇双口径；无真 MCP/harness/通道/SSO |
| workbench「节点独立应用」 | **过 · 清晰可落地** | 默认同壳模块化；拆 app 有条件表+代价+检查清单；禁一人一仓微服务 |
| 工具 / MCP / 单 Agent 插件 | 过 | 目录≠MCP；副作用→DomainCommand；AgentDef=插件+版本化 catalog，不拆微服务 |
| 与 APP_PORTS | 过 | 5173–5177 + 5180 与 `ports.ts` 一致 |
| 与 landing / dev-spec / enterprise | 过 | case-core 写唯一；C+DSH/Codex；ops≠notify；禁壳/Agent 直写库 |
| STAGE_MODULES 抽查 | 过 | id/path/handoffKey 与 `apps/workbench/src/stages/index.ts` 一致 |

## 专项：工作台节点独立应用推荐

| 检查 | 结果 |
|------|------|
| 默认是否明确 | 是：同壳 stages+flows，勿按节点拆 Vite app |
| 例外是否可执行 | 是：团队/权限/流量三条件 + 七项勾选清单 |
| 是否与 landing「壳非服务」冲突 | 否 |

**专项裁决：推荐站得住。**

## 非阻塞建议

1. **先推仓**再总验。
2. workbench 表中 prosecution/maintain/monetize/watch 的 handoff 可用 `ARTIFACT_FOR_STAGE.*` 字面补全（现用括注可接受）。
3. Owner 链 `docs/workbench` / `docs/mid` 正确；推仓后确认不断链。

## 裁决

**通过。** 可总控总验。不要求为建议项重开全稿。
