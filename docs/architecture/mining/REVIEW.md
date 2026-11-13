# mining 架构评审记录

| 项 | 值 |
|----|-----|
| 评审角色 | 架构评审 |
| 对象 | `docs/architecture/mining/`（README · overview · human-ui · deep-demo） |
| 对象 SHA | **`3df6af8`**（`docs(architecture): patent mining spec (D2/W4 :5184)`） |
| 日期 | 2026-09-13 |
| **结论** | **通过** |

## 尺子对照（总控点名）

| # | 尺子 | 结果 | 说明 |
|---|------|------|------|
| ① | 交底/技术点→候选发明点→评分→送立项/撰写闭环 | **过** | README 主路径冻结；human-ui 四步；deep-demo 状态机+门禁（无候选不能送） |
| ② | `apps/mining:5184`、不改 APP_PORTS | 过 | 推荐独立壳；备选挂 workbench 模块；均不改 APP_PORTS |
| ③ | 可吃 Search Hit、≠ case-core 写库 | 过 | Hit 子集种子；送出=事件+深链；禁 DomainCommand / PatentCase |
| ④ | 内存 mock / 无真挖掘引擎诚实 | 过 | 规则/种子拆解；横幅钉死；非目标列真引擎 |
| ⑤ | 与 search / FTO 边界清晰 | 过 | search=对照示意不重造；FTO=深链占位不共享写模型；inspire 边界亦清 |

## 专项：写库与送出口径

| 检查 | 结果 |
|------|------|
| 「送立项/撰写」是否假装已建案 | **否**（禁用「已创建案件」文案） |
| DomainCommand / case-core 写路径 | **无** |
| Search Hit 依赖跨口 localStorage | **否**（种子为准） |

**专项裁决：送出占位诚实；≠ case-core 写库站得住。**

## 非阻塞建议

1. 实现 W4 时对照 deep-demo：四步可点 + 至少一条关联 Hit + 横幅诚实句。
2. 若挂 workbench 模块，状态机不变（overview 已写）。

## 裁决

**通过。** 可总控总验。
