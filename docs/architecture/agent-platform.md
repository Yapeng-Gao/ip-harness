# Agent 沙箱平台架构（正式稿）

> **正式规格**（2026-09-21）。讨论纪要源稿：[incoming/agent-sandbox-platform-design.md](./incoming/agent-sandbox-platform-design.md)。  
> **产品面叠层**：[product-apps/agent-layers.md](./product-apps/agent-layers.md)（L1/L2/L3 入口决策不变；叠 Solo/Team/Domain 命名）。  
> **专利 Domain Pack**：[domain-packs/patent-pack-design.md](./domain-packs/patent-pack-design.md) · [impl](./domain-packs/patent-pack-impl.md)。  
> **样机诚实**：今日 `apps/agent` 为 Vite 壳 + mock 剧本；**无**真实沙箱、**无** Engine Driver、**无** dsh/Codex harness 接线。本文件描述目标平台，不等于已交付。

---

## 1. 目标与范围

搭建企业级 Agent 平台，在已有前端壳、API、数据中台与双执行引擎候选（Codex app-server、DeepSeek Harness / dsh）之上，补齐：

| 层 | 内容 |
|----|------|
| **L0 工具层** | 模型网关、检索、原型绘制、代码执行、浏览器、Skill(MCP) — 全部注册为 Tool |
| **模式层** | **Solo**（单对话全能）/ **Team**（多 Bot 自由协作）/ **Domain**（预编排领域包） |
| **领域层** | Domain Pack = bot 阵容 + 流程编排 + 领域知识库 + 产物规范 |

产品入口命名与既有 L1/L2/L3 **叠加、不推翻**：

| 产品入口（冻结） | 平台命名 | 用户心智 |
|------------------|----------|----------|
| **L1** `/agent`（通用默认） | **Solo** | 单助手对话 |
| **L2** `/agent/team` | **Team** | 多 bot 自由协作 |
| **L3** `/agent/projects` · 专利壳 Catalog | **Domain** | 预编排专家专班 |

**铁律**：Team 与 Domain **共用同一套多 bot 运行时**；差异仅在「分工由领队现场决定」vs「分工提前固化为 SOP」。**入口可并列**（顶栏直达），勿写成 Domain 只能从 Team 升。

---

## 2. 核心架构决策

### 2.1 一 Run 一沙箱

- **粒度**：一次任务（Run）绑定一个沙箱；引擎随沙箱生灭。
- **用户状态**落在 workspace / 对话记录 / 数据中台，**不**落在引擎进程。
- 「环境还在」靠快照 + 休眠唤醒，而非常驻引擎。
- 对外多租户推荐：**拓扑 B**（API → 调度器 → 沙箱内含引擎）；内部可信租户可评估拓扑 A（引擎池租沙箱执行工具）。

### 2.2 双引擎 Driver 接口

引擎（`codex` | `dsh`）经薄封装收敛调用点；换 backend 只改配置。

| 操作 | 职责 |
|------|------|
| `lease(run_id, engine_type, image, ttl)` | 领沙箱并启动引擎 |
| `stream(lease)` | SSE 事件转发前端 |
| `collect(lease)` | diff / 日志 / 文件落工件存储 |
| `release(lease)` | 销毁 |
| `pause(lease) → ResumeToken` | Domain 流程 HITL 挂起 |
| `resume(token) → Lease` | 批准后恢复 |

凭证由调度器注入沙箱环境变量（Credential Vault）；前端与用户不可见。  
dsh 自带「沙箱」模式是防误操作边界，**不是**多租户安全边界——整个 harness 仍须跑在本平台沙箱内；禁 `danger-full-access`。

### 2.3 沙箱选型策略

| 环境 | 选型 | 说明 |
|------|------|------|
| **开发 / 学习** | **OpenSandbox**（Docker → K8s） | K8s 一等公民；本地与生产同接口 |
| **生产 / 不可信负载** | **CubeSandbox**（MicroVM） | 隔离更强；E2B SDK 兼容，迁移成本近零 |
| Agent 侧 | 薄封装 `create / run / files / destroy` | 换 backend 只改配置 |

隔离强度参考：普通容器 < gVisor < Kata/Firecracker ≈ 轻量 VM < 传统 VM。OpenStack 提供底层 VM 池，**不**直接做沙箱。

三池分桶建议：`solo-tools` / `team-workers` / `domain-{pack}`。

### 2.4 模式 × 沙箱差异（摘要）

| 机制 | Solo | Team | Domain |
|------|------|------|--------|
| 粒度 | 一次工具调用一沙箱（短 TTL） | 一个 worker 一沙箱（任务级） | 按 Pack 预声明，可按 bot 差异化 |
| workspace | 无共享要求 | **共享卷（RWX）** | 步骤间共享；HITL 点锁快照 |
| egress | 按需白名单 | 白名单 + 成员独立 | **按 bot 定级**（检索白名单 / 撰写断网） |
| 快照 | 通常不用 | 长任务可用 | 跨周流程必须 |
| 审计 | 工具调用日志 | 成员级事件流 | **步骤级**（输入/产物/审批落中台） |

---

## 3. 产品三层与能力工具化

```text
L0 平台层：模型网关 / 检索 / 画原型 / 代码执行 / 浏览器 / Skill(MCP)
           ↑ 全部 Tool：统一 Schema、统一鉴权审计
模式层：   Solo / Team / Domain（同一多 bot runtime；入口并列）
领域层：   Domain Pack（bots + flows + kb + output_spec + HITL）
```

- **能力全部工具化**：例如「画原型」= 生成代码 → 沙箱运行 → 截图导出，不是某 bot 的特殊功能。
- Domain 特有：**HITL 审批点** + **产物规范 `output_spec`**（模板 + validator）。
- 工程重心：执行层、编排层、领域包；通用检索/浏览器/MCP 优先吃现成。

专利生命周期 Pack 见 [domain-packs/](./domain-packs/)：F1–F9 · 16 席 · HITL×8。

---

## 4. 合规与假设验证（施工前置）

正式开工前必须对齐源稿两章（不在本文重复展开）：

| 主题 | 源稿位置 | 要点 |
|------|----------|------|
| **专利执业边界 / 技术秘密** | incoming §13 | 推荐起步 B 档「机构合作版」；交底即技术秘密——加密、租户隔离、审计链、私有化选项 |
| **假设验证清单** | incoming §14 | OpenSandbox 启停/限额/快照/egress、dsh headless、期限表专家核对等为 **P0**；未实测数字不得当承诺 |

内容安全（注入消毒）、Run 状态持久化与崩溃恢复、评测三层门禁见源稿 §15；实现蓝图见 [patent-pack-impl](./domain-packs/patent-pack-impl.md)。

---

## 5. 与现仓产品面关系

| 现仓文档 | 关系 |
|----------|------|
| [agent-layers](./product-apps/agent-layers.md) | L1/L2/L3 入口钉；叠 Solo/Team/Domain |
| [agent-patent-shell](./product-apps/agent-patent-shell.md) | 专利产品冷启动 = Catalog；Domain Pack 目标态 |
| [agent-l3-patent](./product-apps/agent-l3-patent.md) | 当前 Catalog / 中台映射为 Pack **子集/过渡** |
| [agent-platform-gap](./product-apps/agent-platform-gap.md) | 样机 ↔ 目标差距表；**样机本轮未动** |
| [enterprise/agent-runtime-options](./enterprise/agent-runtime-options.md) | 企业 Agent 选型（C 混合 · DSH/Codex）互补 |

---

## 6. 实施路线（目标态 · 非本轮施工）

| 阶段 | 内容 |
|------|------|
| Week 1 | Solo：Bot 配置 + 对话 + 工具链走沙箱 |
| Week 2 | Run 状态机 + Driver（先 Codex 后 dsh）+ 预热池 |
| Week 3 | Team：子代理 + 共享 workspace + SSE 看板 |
| Week 4 | 首个 Domain Pack 切片（专利新申请一条 flow + HITL）付费验证 |
| 之后 | pause/resume、egress、Vault、审计、Pack 市场 |

**本轮（文档冻结）**：只落规格与 gap；**不**改 `apps/**` / `packages/**`；样机仍无真沙箱。

---

## 7. 决策速查

1. 一 Run 一沙箱；引擎随沙箱生灭；状态在 workspace。  
2. 对外拓扑 B；开发 OpenSandbox / 生产评估 Cube。  
3. Driver：lease / stream / collect / release + pause/resume。  
4. 能力全部 Tool/MCP 化。  
5. Team ≡ Domain **同一 runtime**；Pack = bots/flows/kb/specs + HITL。  
6. 密钥永留服务端；断网撰写 / 出网检索为合规卖点。  
7. **诚实**：今日 Vite 样机 ≠ 本平台已上线。

## 8. Owner

规格：架构设计 · 运行时落地：后续平台刀（另开） · 产品壳：Agent应用助手（壳 IA 见 product-apps）
