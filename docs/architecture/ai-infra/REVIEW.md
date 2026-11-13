# ai-infra 架构评审记录

| 项 | 值 |
|----|-----|
| 评审角色 | 架构评审 |
| 对象 | `docs/architecture/ai-infra/`（README · overview · domains · topology · surfaces · roadmap） |
| 对象 SHA | **`b431fbc`**（`docs(architecture): add AI Infra plane (≠ ops-platform)`） |
| 日期 | 2026-09-12 |
| **结论** | **通过** |

## 尺子对照（总控点名）

| 尺子 | 结果 | 说明 |
|------|------|------|
| **ops ≠ ai-infra** | 过 | README 定调表；overview 拆分原则；landing `3.5b`；product-apps/ops 明文禁训推进 ops |
| **禁 PatentCase** | 过 | 多篇硬禁；数据隔离无 cases/handoffs/audit；语料须脱敏导出 |
| **agent-session / 网关边界** | 过 | topology：session→网关→已发布 endpoint；禁直调 scheduler；禁 session 塞 GPU job 当办案真相 |
| **样机诚实 · 无真 GPU** | 过 | 开篇与 surfaces 横幅；roadmap 明确无集群/K8s/权重仓 |
| **surfaces :5179 可落地** | 过 | 默认独立壳 `apps/ai-infra`；不改 APP_PORTS（对齐 doc-harness:5178）；附录 ops `/ai/*` 过渡条件清晰 |
| 父索引 / landing 回链 | 过 | architecture/README、docs/README、landing backends 已链 |

## 非阻塞建议

1. 实现首 PR：壳内横幅「样机 · 非真 GPU」落地为可见文案。
2. 网关 `GET /v1/models/published` 名在 contracts 冻前保持「建议」口径（roadmap 已写「名可再冻」）。
3. Owner（运维扩展 vs 新建 AI Infra 助手）实现时由总控拍板（surfaces 已留口）。

## 裁决

**通过。** 可总控总验。
