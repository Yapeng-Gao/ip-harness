# Stage Module · 可卖单节点（SKU）

> 产品决策（2026-09-12）：**可卖 = Stage Module 边界 + 授权闸**；SaaS 工作台**默认同壳**。  
> 不靠「一人一仓 / 按节点微服务」售卖。规格依据：[../architecture/product-apps/workbench.md](../architecture/product-apps/workbench.md) §3。  
> `STAGE_MODULES` 权威：`apps/workbench/src/stages/index.ts`。

## 1. 一句话原则

**可卖的是模块边界与租户授权，不是又一个 Vite 壳。**  
壳只是目录（同壳路由 + `stages/*`）；卖单节点靠 SKU/license 打开对应 stage，而不是默认拆独立 app。

## 2. Stage × SKU 表

权威字段对齐 `STAGE_MODULES`；handoffKey 与 `@ip/contracts` `ARTIFACT_FOR_STAGE` / Agent `workbenchPath` 一致。

| id | path | stageId | handoffKey | 建议 SKU 名 | 默认可卖 |
|----|------|---------|------------|-------------|----------|
| research | `/workbench/research` | `pre_research` | `research_report` | `wb.stage.research` | **是**（Core 办理） |
| intake | `/workbench/intake` | `decision` | `intake_quote` | `wb.stage.intake` | **是** |
| draft | `/workbench/draft` | `drafting` | `draft_claims` | `wb.stage.draft` | **是** |
| prosecution | `/workbench/prosecution` | `prosecution` | `prosecution_response` | `wb.stage.prosecution` | **是** |
| maintain | `/workbench/maintain` | `maintenance` | `maintain_annuity` | `wb.stage.maintain` | **是** |
| monetize | `/workbench/monetize` | `commercialization` | `monetize_terms` | `wb.stage.monetize` | **是**（可标 Assist/Beta 包装） |
| watch | `/workbench/watch` | `monitoring` | `watch_alert` | `wb.stage.watch` | **是** |
| layout | `/workbench/layout` | — | `layout_insight` | `wb.stage.layout` | **否（默认）** · 辅台/洞察；可作加购 SKU |
| home | `/workbench` | — | — | `wb.shell.home` | **否** · 壳入口，随 workbench 基座赠送，不单卖 |
| inventor | `/inventor` | — | `disclosure_pack` | `wb.portal.inventor` | **条件可卖** · 发明人门户；可与 draft/intake 捆绑或单独 SKU |

说明：

- **默认可卖**：采购主路径上的 Core 办理节点；租户未购则路由/侧栏空态，不删代码。
- **layout**：无主 `stageId`，属辅台；默认关闭，加购后打开。
- **home**：导航与待办壳，不算「单节点商品」。
- **inventor**：交底入口，常与企业租户或 disclosure 能力捆绑；可单独报价。

## 3. 模块边界清单（卖的是这些，不是进程）

每个可卖 stage 至少具备下列边界（同壳内即可）：

| 边界 | 要求 |
|------|------|
| 路由 | 独立 path（上表）；可 deep-link；未授权不进入表单主路径 |
| UI | `stages/<id>` → `flows/<id>`；Stepper STEPS 与 `FLOW_CATALOG` 同源 |
| 命令 | 写库只经 `DomainCommand` / `dispatchCommand`；不 fork CommandName |
| handoff | 单一 `handoffKey`（上表）；labels/keys 唯一源 `@ip/contracts` |
| Agent | `AgentDef.handoffKey` + `workbenchPath` 与上表 path 对齐 |
| 授权检查点 | 进路由前 / 侧栏显隐 / 关键 CTA（提交·授权递交）前读 entitlements |

壳（home）与跨口 `AppLink` 不属于单节点 SKU 边界，属基座。

## 4. License / Persona 闸

### 4.1 行为（样机可 mock）

| 状态 | 体验 |
|------|------|
| 未购该 SKU | 侧栏节点隐藏或灰显；直链进入 → **诚实空态**（说明未授权 + 回 home / 联系管理员）；**不**执行 handoff 写 |
| 已购 | 正常 Flow；Persona 仍按现有 `persona` 闸叠加（发明人/委员等） |
| Persona × SKU | SKU 开≠人人可写；Persona 硬闸优先于 SKU |

### 4.2 落地字段建议（tenant entitlements）

```ts
// 示意 · 非已实现 schema
type StageSkuId =
  | 'wb.stage.research'
  | 'wb.stage.intake'
  | 'wb.stage.draft'
  | 'wb.stage.prosecution'
  | 'wb.stage.maintain'
  | 'wb.stage.monetize'
  | 'wb.stage.watch'
  | 'wb.stage.layout'
  | 'wb.portal.inventor'

type TenantEntitlements = {
  tenantId: string
  /** 已购 stage SKU；缺省 = 仅基座 home */
  stageSkus: StageSkuId[]
  /** 可选到期 · 样机可忽略 */
  expiresAt?: string
}
```

映射：`StageSkuId` ↔ `STAGE_MODULES[].id`（`wb.stage.*` ↔ id；`wb.portal.inventor` ↔ `inventor`）。

样机期：内存 / localStorage mock entitlements 即可；**不**扩 `APP_PORTS`，**不**为 SKU 新建 Vite app。

## 5. 迁移路径

```
同壳 stages + SKU 闸  ──默认──►  长期可卖形态
         │
         │ 仅当 product-apps/workbench.md §3.2–3.5
         │ 七项清单全勾（团队隔离 / CSP 域 / 包体等）
         ▼
   独立 Vite app（仍 monorepo · 仍 @ip/*）
         │
         ✗ 禁止：按节点起微服务 / 一人一仓 / 双份 handoff
```

回链：[product-apps/workbench.md §3](../architecture/product-apps/workbench.md#3-专节--每节点是否可独立应用)（同壳默认；拆 app 代价与检查清单）。

## 6. 非目标

- **不改**业务代码（本文档-only）
- **不扩** `APP_PORTS` / 不为单节点默认加端口
- **不**把 layout/home 默认为可卖 Core SKU
- **不**用拆壳代替授权模型

## 相关

- [OWNERSHIP.md](./OWNERSHIP.md) · [OWNER_STATUS.md](./OWNER_STATUS.md)
- 权威清单：`apps/workbench/src/stages/index.ts`
- Agent 对齐：`handoffKey` + `workbenchPath`（`src/data/agents.ts`）
