# apps/ai-data · 数据 Pipeline（样机）

对照样机：数据源 / 流水线 / 数据集 version / 配比采样 / 质量与安全 / 血缘 / 脱敏导出。  
**样机 · 非真 Spark / 湖仓 / PII**（亦非真对象存储 / 真血缘仓 / 真标注平台）。

**不改** mid / workbench / agent / ops / iam / doc-harness / ai-infra 业务代码；**不改** `packages/contracts` `APP_PORTS`（端口仅在本 app Vite 固定 **5181**）。  
**禁止**持有或写入 `PatentCase` / DomainCommand。

规格：`docs/architecture/ai-data/`（含 [deep-demo.md](../../docs/architecture/ai-data/deep-demo.md)）。

## 启动

在 **repo 根**：

```bash
npm run dev:ai-data
```

→ http://localhost:5181

```bash
npm run typecheck -w @ip/ai-data
```

## 可点闭环（内存状态机）

| # | 面 | 如何点通 |
|---|-----|----------|
| 1 | Sources → Ingest | `/sources` 点「拉取」→ IngestJob `queued→running→done/fail`，raw 计数增加 |
| 2 | Pipelines | `/pipelines` 点 Run；步序 采集→清洗→去重→质量门→发布；质量门 fail 则 publish=`blocked` |
| 3 | Quality | `/quality` 点「跑打分」；mock findings 标「非真引擎」；fail 卡片打红；可勾「下次强制 fail」 |
| 4 | Datasets | `/datasets`「发布新 version」仅在质量 pass 时可用（否则 disabled）；version 不可变 + 假 checksum；可 Pin |
| 5 | Recipes | `/recipes` 调配比 / 总量 →「保存配比」；采样预览显示条数拆分 |
| 6 | Lineage | 发布或导出候选后 `/lineage` 自动出现 source→version 边 |
| 7 | Exports | `/exports` 申请→审批→完成→「生成候选数据集」进入 datasets（无案正文） |
| 8 | 评测回流 | `/quality` 底部 ImprovementTicket →「创建难例回灌任务」挂到 pipelines |
| 9 | 跨壳写出 | 成功 publish 后写 localStorage 键（见下）；**同端口**多 tab/刷新可读 |

## 跨壳约定 · `ip.harness.aiData.publishedDatasets`

| 项 | 值 |
|----|-----|
| **键** | `ip.harness.aiData.publishedDatasets` |
| **写入时机** | 每次成功 publish 一个 dataset version（及首屏 bootstrap 种子） |
| **合并语义** | 读出数组 → 按 `id`+`version` 去重 → 新发布置顶 → 写回 |
| **JSON shape** | `[{ "id": "ds-claims-sft", "name": "claims-sft", "version": "v1.4" }]`（可带可选 `checksum` / `purpose` / `publishedAt` / `rows`；ai-infra 只读 id/name/version） |
| **用途** | 供同 origin 下作业下拉或演示脚本消费；**不是**跨 Vite 端口同步通道 |

### 诚实：端口与 localStorage

不同 Vite 端口（5181 vs 5179）是**不同 origin**，浏览器 **`localStorage` 不互通**。  
本键写入**仅利于同端口多 tab / 刷新**持久。**禁止**文案写「已与训推面实时同步」。

**跨壳演示以共享种子 ID 契约为准**（与 `apps/ai-infra/src/state/seed.ts` 的 `SEED_DATASETS` **同表**）：

| id | name | version |
|----|------|---------|
| `ds-claims-sft` | `claims-sft` | `v1.4` |
| `ds-eval-hard` | `eval-hard` | `v2.0` |
| `ds-pretrain-mix` | `pretrain-mix` | `v0.9` |

## 诚实边界

| 项 | 现状 |
|----|------|
| Spark / 湖仓 | **无**真集群；流水线为假进度 |
| 数据集 | **无**对象存储；version 为内存不可变标签 + 假 checksum |
| PII / 敏感 | **无**真引擎；质量页标「非真引擎」 |
| 血缘 | **无**持久仓；append-only 内存边表 |
| 脱敏导出 | 仅导出单状态机；**无**案正文 |
| PatentCase | **禁止**写入 |
| 数据 | 内存 mock；刷新即失（LS 键同口可保留 published 列表） |

## IA 路由（BrowserRouter）

| 路径 | 页面 |
|------|------|
| `/` | 总览 Overview（实时健康 / 最近发布） |
| `/sources` | 数据源（拉取 / IngestJob） |
| `/pipelines` | 流水线 DAG |
| `/datasets` | 数据集 + 不可变 version |
| `/recipes` | 配比 / 采样 |
| `/quality` | 质量与安全 + ImprovementTicket |
| `/lineage` | 血缘 |
| `/exports` | 脱敏导出 |
| `*` | `Navigate` → `/` |

顶栏横幅：`样机 · 非真 Spark / 湖仓 / PII`。深链：训推面 ai-infra → http://localhost:5179；运维面 ops → http://localhost:5176。

## 改动边界

只改 `apps/ai-data/**`。根 `package.json` 已有 `dev:ai-data` 则不动。禁止改五壳、doc-harness、ai-infra、packages 行为与 e2e。
