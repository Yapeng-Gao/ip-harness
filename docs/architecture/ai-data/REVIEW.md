# ai-data 架构评审记录

| 项 | 值 |
|----|-----|
| 评审角色 | 架构评审 |
| 对象 | `docs/architecture/ai-data/`（README · overview · domains · topology · surfaces · roadmap） |
| 对象 SHA | **`0140cc2`**（`docs(architecture): add AI Data plane (≠ ops/ai-infra/case-core)`） |
| 日期 | 2026-09-13 |
| **结论** | **通过** |

## 尺子对照（总控点名）

| 尺子 | 结果 | 说明 |
|------|------|------|
| **≠ ops / ≠ ai-infra / ≠ case-core** | 过 | README 定调四平面表；overview 硬原则；landing `3.5c`；ai-infra README 已划走数据面 |
| **dataset → ai-infra** | 过 | 发布 `dataset version`；topology 箭头清晰；ai-infra 只消费、禁自建语料真相 |
| **禁 PatentCase（仅脱敏导出）** | 过 | 多篇硬禁；导出无案列；agent-session 禁挂未脱敏案全文进湖 |
| **样机诚实** | 过 | 无 Spark/湖仓/PII；surfaces 横幅；roadmap 阶梯诚实 |
| **:5181 可落地** | 过 | 默认独立壳；不改 APP_PORTS（对齐 5178/5179）；Owner=AI Data助手 |
| 父索引 / 回链 | 过 | architecture/README、docs/README、landing、product-apps、ai-infra 已链 |

## 非阻塞建议

1. 实现首 PR：壳横幅「非真 Spark / 湖仓 / PII」可见。
2. 发布 API 路径名在 contracts 冻前保持「可再冻」口径（roadmap 已写）。
3. 脱敏导出审计字段归属（导出侧 vs case-core）实现时钉一张表即可。

## 裁决

**通过。** 可总控总验。
