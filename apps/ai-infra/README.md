# apps/ai-infra · 训推基建（样机）

对照样机：GPU 池 / 作业 / 已发布端点 / 模型注册 / 训推门禁 / 压测 / 告警。  
**样机 · 非真 GPU / 非真 K8s**（亦非真权重仓 / 真调度 / 真推理进程）。

**不改** mid / workbench / agent / ops / iam / doc-harness 业务代码；**不改** `packages/contracts` `APP_PORTS`（端口仅在本 app Vite 固定 **5179**）。  
**禁止**持有或写入 `PatentCase` / DomainCommand。

规格：`docs/architecture/ai-infra/`（overview / domains / topology / surfaces / roadmap）。

## 启动

在 **repo 根**：

```bash
npm run dev:ai-infra
```

→ http://localhost:5179

```bash
npm run typecheck -w @ip/ai-infra
```

## 诚实边界

| 项 | 现状 |
|----|------|
| GPU / K8s | **无**真集群；节点与配额为内存表，无 nvidia-smi / kubelet |
| 作业调度 | **无**调度器；训练/批推为假进度条 |
| 权重仓 | **无**对象存储；晋级 / 回滚只弹 Toast |
| 在线推理 | **无**真进程；卡片为「已发布」形状供网关示意 |
| 压测 | **不**打真端点；报告静态 mock |
| 告警出站 | 仍标 **notify**；不发 SMTP / 短信 / Webhook |
| PatentCase | **禁止**写入；语料须经脱敏导出（本样机不做） |
| 数据 | 内存 mock；刷新即失 |

## IA 路由（BrowserRouter）

| 路径 | 页面 |
|------|------|
| `/` | 总览 Overview（GPU 池 / 队列深度） |
| `/gpus` | GPU 资源（节点 + 配额表） |
| `/jobs` | 作业（训练 / 批推 + 假进度） |
| `/endpoints` | 在线推理（已发布端点卡片） |
| `/models` | 模型注册（版本 / 晋级 / 回滚） |
| `/pipelines` | 训推门禁（训练→评测→发布模板） |
| `/loadtest` | 压测（场景与报告 mock） |
| `/alerts` | 训推告警（规则示意；出站 notify） |
| `*` | `Navigate` → `/` |

侧栏（窄屏为顶栏）覆盖以上分区。顶栏横幅：`样机 · 非真 GPU / 非真 K8s`。

## 与 ops 边界

| | ops-platform :5176 | ai-infra :5179 |
|--|--------------------|----------------|
| 管什么 | 日志 / SLA / 配置 / 告警渠道 | GPU 与调度、训练/批推/在线推理、发布门禁 |
| 本样机 | **不改** ops 六路由 | 独立壳并行 |

深链（只读、不改 ops）：顶栏 `运维面 ops → http://localhost:5176`；告警页另链 `/config#alerts`。未使用 `AppSurfaceLinks` 新 surface（避免改 `packages/ui`）。

## 改动边界

只改 `apps/ai-infra/**`。根 `package.json` 仅加 script `dev:ai-infra`。禁止改五壳、doc-harness、packages 行为与 e2e。
