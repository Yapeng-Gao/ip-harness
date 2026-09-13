# fto 架构评审记录

| 项 | 值 |
|----|-----|
| 评审角色 | 架构评审 |
| 对象 | `docs/architecture/fto/`（README · overview · human-ui · deep-demo · agent-api-shape） |
| 对象 SHA | **`d511b95`**（`docs(architecture): FTO prototype spec (D1/W2 :5183)`） |
| 日期 | 2026-09-13 |
| **结论** | **通过** |

## 尺子对照（总控点名）

| # | 尺子 | 结果 | 说明 |
|---|------|------|------|
| ① | 特征→命中→矩阵→风险→报告 Confirm 闭环 | 过 | README 冻结主路径；human-ui 五步；deep-demo 状态机+门禁 |
| ② | `apps/fto:5183`、不改 APP_PORTS | 过 | 与 5178/5179/5181/5182 同策略；Owner=FTO助手 |
| ③ | 吃 Search Hit/种子篮、≠ case-core 写库 | 过 | Hit 形状对齐 search；Confirm 不 dispatch；禁 PatentCase 写 |
| ④ | 无真 FTO 引擎诚实 | 过 | 横幅/免责；假比对按钮明示非真引擎 |
| ⑤ | 与 search 边界清晰 | 过 | 消费 Hit、不重造引擎；深链只读 :5182；无跨口假 LS |

## 非阻塞建议

1. README 上游链文案写 `../PROTOTYPE_MASTER_PLAN.md` 而 href 为 `../../…`（指向 `docs/` 正确）；可改文案免误导。
2. Agent `fto.confirmReport` 若对人开放，须产品开闸（文已注明）。
3. 实现对照 deep-demo 验收勾；本评只规格。

## 裁决

**通过。** 可总控总验。
