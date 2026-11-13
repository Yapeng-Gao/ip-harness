# figure 架构评审记录

| 项 | 值 |
|----|-----|
| 评审角色 | 架构评审 |
| 对象 | `docs/architecture/figure/`（README · overview · human-ui · deep-demo） |
| 对象 SHA | **`af7bfca`**（`docs(architecture): figure gen+edit dual-loop spec (D5/W3)`） |
| 日期 | 2026-09-13 |
| **结论** | **通过** |

## 尺子对照（总控点名）

| # | 尺子 | 结果 | 说明 |
|---|------|------|------|
| ① | 生成+编辑双闭环硬要求 | **过** | README/overview/deep-demo 铁律：只生成不可编辑=不验收；成功后主按钮=打开画布 |
| ② | 标注/图层/撤销→版本→挂文档章 | 过 | human-ui §3–4；状态机 G→E→V→A；版本恢复需 Confirm |
| ③ | `apps/figure:5187`（或不改 APP_PORTS） | 过 | 推荐 A；备选挂 doc-harness；均不改 APP_PORTS |
| ④ | 无真文生图诚实 | 过 | 模板/SVG 占位；禁接真文生图 API；横幅钉死 |
| ⑤ | 与 doc-harness 边界 | 过 | 挂章深链/事件占位；不改 doc-harness 业务码；≠ DomainCommand |

## 专项：双闭环是否可被绕过

| 检查 | 结果 |
|------|------|
| 是否允许「仅预览图」作唯一结局 | **否**（deep-demo 验收显式禁止） |
| 生成失败路径 | 可重试，不替代编辑要求 |
| 备选挂 doc-harness | 仍须双闭环，禁只做侧栏预览 |

**专项裁决：硬要求站得住。**

## 非阻塞建议

1. 实现 W3 时对照 deep-demo 验收勾；缺画布/撤销/图层 = Fail。
2. 若总控改挂 B，路由变、状态机不变（overview 已写）。

## 裁决

**通过。** 可总控总验。
