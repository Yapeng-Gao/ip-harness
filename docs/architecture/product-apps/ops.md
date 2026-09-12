# ops · 运维壳（:5176）

> **样机诚实**：`apps/ops` 六路由 + mock 数字/表格；SLA 非 live；告警试发只写 sessionStorage + toast；**不接**真 ELK / Prometheus / Sentry / SMTP / 短信 / Webhook。  
> **落地目标**：产品壳对接 **ops-platform**（配置 / 密钥引用 / 健康聚合 / OTel 钩子）；仍**不持** `PatentCase`；真通道须总控开闸。

权威细节：[../ops-observability.md](../ops-observability.md) · [../../apps/ops/README.md](../../../apps/ops/README.md)。端口：`APP_PORTS.ops = 5176`。

## 1. 职责

| 做 | 不做 |
|----|------|
| 运维总览 / 日志示意 / SLA 示意 / 模型与基础设施配置 UI | 办案写库、改闸门 / Flow / Persona |
| 开发者告警配置示意（`/config#alerts`） | 真出站（除非开闸） |
| 深链到 mid 案详审计（只读） | 订阅生产事件总线（今日未接） |

## 2. 样机六路由 → 落地 ops-platform

| 样机路由 | 页面 | 落地映射 |
|----------|------|----------|
| `/` | Overview | ops-platform 健康 / 版本 / 依赖状态聚合 |
| `/logs` | Logs | 日志查询 UI → 后端日志仓（OTel/ELK 等，开闸后）；深链 mid `?tab=audit` |
| `/monitor` | Monitor | SLA / 业务指标读模型（非办案写）；事件名对齐 `DOMAIN_EVENTS` |
| `/models` | Models | 模型网关配置引用（密钥不进壳明文） |
| `/infra` | Infra | 基础设施开关 / 功能旗标元数据 |
| `/config`（`#alerts`） | Config + 告警 | 通知渠道配置；出站属 **notify**，与 ops-platform 配置面分离 |

对齐 landing：`ops-platform` ≠ `notify`（配置/密钥 ≠ 出站投递）。

## 3. 禁真通道（除非开闸）

| 通道 | 样机 | 开闸前 |
|------|------|--------|
| SMTP / 短信 / Webhook | 试发 toast + sessionStorage 日志 | **禁止**接真 |
| ELK / Prometheus / Sentry | 未接 | **禁止**接真；可先 OTel 导出钩子设计 |
| 事件总线订阅 | Monitor 只展示事件名常量 | 落地再订 `ip.command.failed` / `ip.docket.escalated` 等 |

开闸条件（文档级）：总控书面派工 + 密钥进密钥仓 + 失败可审计 + 与 `DOMAIN_EVENTS` 名对齐。

## 4. 样机 vs 落地

| 项 | 样机今 | 落地目标 |
|----|--------|----------|
| 数据 | 本地 mock | ops-platform API + 只读投影 |
| SLA | 非 live 聚合示意 | 真指标仓；仍标清业务 SLA vs 运行时异常 |
| 通知 | skipped/mock | notify 消费 outbox；ops 只配渠道 |
| 壳职责 | 独立 Vite、无 AppProvider 办案态 | 保持薄壳；不引入 PatentCase |

## 5. 相关链接

- [../landing/backends.md](../landing/backends.md)（ops-platform / notify）
- [../backends.md](../backends.md)
- [cross-cutting.md](./cross-cutting.md)
