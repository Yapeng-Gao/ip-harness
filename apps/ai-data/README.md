# apps/ai-data · 数据 Pipeline（样机）

对照样机：数据源 / 流水线 / 数据集 version / 配比采样 / 质量与安全 / 血缘 / 脱敏导出。  
**样机 · 非真 Spark / 湖仓 / PII**（亦非真对象存储 / 真血缘仓 / 真标注平台）。

**不改** mid / workbench / agent / ops / iam / doc-harness / ai-infra 业务代码；**不改** `packages/contracts` `APP_PORTS`（端口仅在本 app Vite 固定 **5181**）。  
**禁止**持有或写入 `PatentCase` / DomainCommand。

规格：`docs/architecture/ai-data/`（overview / domains / topology / surfaces / roadmap）。

## 启动

在 **repo 根**：

```bash
npm run dev:ai-data
```

→ http://localhost:5181

```bash
npm run typecheck -w @ip/ai-data
```

## 诚实边界

| 项 | 现状 |
|----|------|
| Spark / 湖仓 | **无**真集群；流水线为假进度条 |
| 数据集 | **无**对象存储；version 标签为内存 mock |
| PII / 敏感 | **无**真引擎；质量页标「非真 PII」 |
| 血缘 | **无**持久仓；简单 DAG 内存表 |
| 脱敏导出 | 仅导出单形状；**无**案正文 |
| PatentCase | **禁止**写入；仅经脱敏导出管道（样机不做真管道） |
| 数据 | 内存 mock；刷新即失 |

## IA 路由（BrowserRouter）

| 路径 | 页面 |
|------|------|
| `/` | 总览 Overview（Pipeline 健康 / 最近发布） |
| `/sources` | 数据源（接入卡片 / 空态） |
| `/pipelines` | 流水线（采集→清洗→发布假进度） |
| `/datasets` | 数据集（列表 + version 标签） |
| `/recipes` | 配比 / 采样（预训练·SFT·偏好·评测） |
| `/quality` | 质量与安全（打分 / 敏感 / 污染 · 非真 PII） |
| `/lineage` | 血缘（简单 DAG mock） |
| `/exports` | 脱敏导出（导出单 · 无案正文） |
| `*` | `Navigate` → `/` |

侧栏（窄屏为顶栏）覆盖以上分区。顶栏横幅：`样机 · 非真 Spark / 湖仓 / PII`。

## 与 ai-infra / ops 边界

| | ops-platform :5176 | ai-infra :5179 | ai-data :5181 |
|--|--------------------|----------------|---------------|
| 管什么 | 日志 / SLA / 配置 / 告警渠道 | GPU 与调度、训练/批推/在线推理、发布门禁 | 语料真相：采集清洗、dataset version、配比、质量、血缘、脱敏导出 |
| 本样机 | **不改** ops 六路由 | **不改** ai-infra | 独立壳并行 |

深链（只读、不改邻居）：顶栏 `训推面 ai-infra → http://localhost:5179`、`运维面 ops → http://localhost:5176`。未使用 `AppSurfaceLinks` 新 surface（避免改 `packages/ui`）。

## 改动边界

只改 `apps/ai-data/**`。根 `package.json` 仅加 script `dev:ai-data`。禁止改五壳、doc-harness、ai-infra、packages 行为与 e2e。
