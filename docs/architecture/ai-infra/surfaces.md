# 产品面：`apps/ai-infra` :5179

> **样机诚实**：壳尚未实现；本篇为路由与 IA 草案。端口 **5179** 写在未来 app 的 Vite 配置；**不**改现有 `APP_PORTS`（与 doc-harness:5178 同策略；可选后期 additive）。  
> **落地目标**：独立运维/算法控制台，不掏空 `apps/ops` 六路由。

## 1. 推荐默认：独立壳

| 项 | 值 |
|----|-----|
| 包路径 | `apps/ai-infra`（待建） |
| 端口 | **5179**（app 内固定） |
| Owner | 运维平台助手扩展 **或** 总控新建 AI Infra Owner（实现时定） |
| 与 ops | **并行**；ops 保留日志/SLA/配置/告警样机 |

### 路由草案（样机）

| 路径 | 页面 | 示意 |
|------|------|------|
| `/` | Overview | GPU 池 / 队列深度 mock |
| `/gpus` | GPU 资源 | 节点与配额表 |
| `/jobs` | 作业 | 训练/批推列表与假进度 |
| `/endpoints` | 在线推理 | 已发布端点卡片 |
| `/models` | 模型注册 | 版本 / 晋级 / 回滚空态 |
| `/pipelines` | 训推门禁 | 训练→评测→发布模板 |
| `/loadtest` | 压测 | 场景与报告 mock |
| `/alerts` | 训推告警 | 规则示意；出站仍标 notify |

横幅诚实句：「样机 · 非真 GPU / 非真 K8s」。

## 2. 附录 · 也可先挂 ops 子路由

**条件（需同时满足再拆独立壳）：**

1. IA 超过 ops 信息架构可承受（训推页压过日志/SLA）；  
2. 权限模型要与 SRE 角色分离；  
3. e2e / 深链需要稳定端口与独立发布。

**过渡形态**：`apps/ops` 增加 `/ai/*` 子路由，**仍**调用未来 `ai-infra` API 前缀，禁止把 PatentCase 引入 ops。  
条件满足后迁到 `:5179`，子路由留跳转。

## 3. 与 APP_PORTS

本期：**不**修改 `packages/contracts` `APP_PORTS`。  
可选后期：`aiInfra: 5179` additive（总控开闸 + contracts PR）。
