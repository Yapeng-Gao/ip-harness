# apps/ai-infra · 训推基建（样机深业务）

对照样机：GPU 池 / 作业 / 端点 / 模型注册 / 训推门禁 / 压测 / 告警。  
**样机 · 非真 GPU / 非真 K8s**（亦非真权重仓 / 真调度 / 真推理进程）。

状态机在浏览器 **内存**（`AiInfraStore` + `setInterval` 推进）；刷新即失。  
**不改** mid / workbench / agent / ops / iam / doc-harness / ai-data 业务代码；**不改** `packages/contracts` `APP_PORTS`（端口仅在本 app Vite 固定 **5179**）。  
**禁止**持有或写入 `PatentCase` / DomainCommand。

规格：`docs/architecture/ai-infra/`（含 [deep-demo.md](../../docs/architecture/ai-infra/deep-demo.md)）。

## 启动

在 **repo 根**：

```bash
npm run dev:ai-infra
```

→ http://localhost:5179

```bash
npm run typecheck -w @ip/ai-infra
```

## 跨壳数据集（读约定）

| 项 | 值 |
|----|-----|
| **键** | `ip.harness.aiData.publishedDatasets` |
| **shape** | `Array<{ id, name, version }>`（忽略未知字段） |
| **写入方** | `apps/ai-data:5181`（同 origin 内 publish 时） |
| **读取方** | 本 app Jobs 创建下拉；优先 `localStorage.getItem` |
| **空/无效** | 回退 **共享种子**（与 ai-data 对齐） |

### 共享种子（契约 ID）

- `{ id: 'ds-claims-sft', name: 'claims-sft', version: 'v1.4' }`
- `{ id: 'ds-eval-hard', name: 'eval-hard', version: 'v2.0' }`
- `{ id: 'ds-pretrain-mix', name: 'pretrain-mix', version: 'v0.9' }`

UI 在种子模式下标明 **「种子 · 非跨壳」**。

### 诚实：跨端口靠种子契约，不靠 localStorage

Vite **不同端口 = 不同 origin**（5179 ≠ 5181），浏览器 **`localStorage` 不互通**。  
因此：**跨端口演示以共享种子 ID 契约为准**；键名冻结便于同仓对齐与将来反代同 origin。  
**禁止**声称「已跨 5179/5181 自动共享」。同端口多 tab / 刷新可读到本 origin 写入的键。

## 状态机闭环（怎么演示）

1. **Jobs** `/jobs`：选数据集 / 队列 / 优先级 → 创建；约 1s 后调度到非 drain 节点；进度条与假日志推进；勾选「强制失败演示」或名称含 `fail` → 失败并自动告警；取消 / 重试可点。点行进详情。
2. **GPU** `/gpus`：占用随 running 作业增减；**drain** 后新作业不再落到该节点（文案已说明）。
3. **Models** `/models`：注册 / 加 revision；**晋级 Confirm**（registered→staging→canary→prod）。非办案 HITL。
4. **Endpoints** `/endpoints`：从 revision 部署；滑杆调金丝雀 %；一键回滚（canary→0）。
5. **Pipelines** `/pipelines`：启动「训练→评测门禁→发布」；训练自动过；门禁需 **Pass/Fail**；Fail 停；Pass 后才可 **发布**；Fail 后可重跑评测。
6. **Loadtest** `/loadtest`：选端点 + 并发/时长 → 报告 TTFT / tokens/s / errorRate（随参数变）。
7. **Alerts** `/alerts`：失败作业与 GPU≥80% 自动追加；确认 / 静默。出站仍 notify。
8. **Overview** `/`：运行中作业、GPU 占用、端点数、未确认告警均绑 live store。

## 诚实边界

| 项 | 现状 |
|----|------|
| GPU / K8s | **无**真集群；节点与配额为内存表 |
| 作业调度 | **无**真调度器；定时器推进假进度 |
| 权重仓 | **无**对象存储；晋级只改内存 stage |
| 在线推理 | **无**真进程；金丝雀为 UI 态 |
| 压测 | **不**打真端点；公式假报告 |
| 告警出站 | 仍标 **notify**；不发 SMTP / 短信 / Webhook |
| 跨壳数据 | **种子契约**；非跨端口 localStorage |
| PatentCase | **禁止**写入 |

## IA 路由

| 路径 | 页面 |
|------|------|
| `/` | 总览（live counts） |
| `/gpus` | GPU + drain |
| `/jobs` · `/jobs/:jobId` | 作业 + 详情日志 |
| `/endpoints` | 端点 / 金丝雀 / 回滚 |
| `/models` | 注册 / 晋级 Confirm |
| `/pipelines` | 训推门禁 |
| `/loadtest` | 压测 |
| `/alerts` | 告警 |
| `*` | → `/` |

顶栏横幅保持：`样机 · 非真 GPU / 非真 K8s`。ops 深链：`http://localhost:5176`。

## 改动边界

只改 `apps/ai-infra/**`。禁止改五壳、doc-harness、ai-data、packages 行为与 e2e。
