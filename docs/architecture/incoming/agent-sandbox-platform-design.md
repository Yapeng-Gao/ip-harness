> **正式稿见** [../agent-platform.md](../agent-platform.md)。本文为讨论纪要源稿，保留备查。

# Agent 沙箱平台技术方案（讨论纪要整理）

> 整理自一次完整的技术讨论：从零散问题（"OpenStack 能创建沙箱吗"）到最终的平台级设计。
> 日期：2026-09-20

---

## 1. 背景与目标

- 已有系统：前端、API 服务、数据中台、两个执行引擎（Codex app-server、DeepSeek Harness / dsh）
- 目标：搭建**企业级 Agent 平台**
  - 通用对话能力（类似 Kimi 网页版：对话内可检索、画原型、用 Skill）
  - 团队模式（多 Bot 自由协作，类似 GrokBot）
  - 领域模式（预编排的领域 Bot 团队，如专利生命周期）
- 核心待解问题：沙箱怎么做（粒度、隔离、调度、成本）

---

## 2. 基础概念：VM / 容器 / 沙箱

| 资源 | 谁创建 | 隔离强度 |
|---|---|---|
| VM 虚拟机 | OpenStack Nova / KubeVirt | 硬件虚拟化，最强 |
| 容器 | Docker / K8s | 命名空间隔离，弱（共享内核） |
| 沙箱 | 容器 + 安全运行时（gVisor / Kata / Firecracker） | 介于两者之间 |

- **K8s 原生管容器**；管 VM 用 KubeVirt；管沙箱用 **RuntimeClass** 选运行时
- 隔离强度：普通容器 < gVisor（用户态内核）< Kata/Firecracker microVM ≈ 轻量 VM < 传统 VM
- OpenStack 的角色：提供底层 VM 资源池，不直接做沙箱

## 3. 沙箱平台选型对比

### 3.1 三个候选

| 维度 | OpenSandbox（阿里） | CubeSandbox（腾讯） | E2B（海外商业） |
|---|---|---|---|
| 许可 | Apache 2.0 | Apache 2.0（2026-04 开源） | 核心 Apache 2.0 + 托管商业版 |
| 隔离底座 | 可插拔：runc/gVisor/Kata/Firecracker | 固定 MicroVM（RustVMM+KVM），默认最强 | Firecracker |
| 编排 | **K8s 一等公民**，本地→生产同接口 | 自有控制面（CubeMaster），K8s 部署 preview | 托管 SaaS / 自托管为 Nomad+Consul |
| 生态接口 | 自有 SDK + REST + MCP | **E2B SDK 兼容** | 事实标准 |
| 生产验证 | 阿里体系；商业版 ACS Agent Sandbox 有 Kimi/MiniMax/车企案例 | 腾讯内部（元宝、MiniMax 分钟级数十万沙箱） | Manus/Perplexity/HF 等 |
| 主要短板 | 默认隔离偏弱（需自接安全运行时） | 开源版外部案例少；需 KVM；运维较重 | 国内网络/自托管重；托管版数据驻留需评估 |

关键指标（CubeSandbox）：<60ms 冷启动、单沙箱内存开销 <5MB、单机数千实例。

### 3.2 企业级选型结论

按企业形态选，没有绝对更好：

1. **强合规/不可信代码执行为核心** → CubeSandbox（独立 Guest 内核 + eBPF 网络隔离 + 成本模型最优）
2. **已有 K8s 体系、要统一治理** → OpenSandbox（运维体系不另起炉灶；商用可平滑切阿里云 ACS Agent Sandbox）
3. **无专职基础设施团队、要快速上线** → E2B 托管 / 云厂商商业版（ACS Agent Sandbox）
4. **GPU 沙箱** → 三家都不完美，需 POC
5. 需要学习 K8s → OpenSandbox（K8s 是其正式 runtime；E2B 自托管是 Nomad 栈，学了 K8s 无处安放）

### 3.3 推荐策略

- **开发/学习主线**：OpenSandbox（Docker 模式 → K8s 模式）
- **生产/不可信负载**：CubeSandbox（E2B 兼容接口，迁移成本近零）
- Agent 侧做**薄封装**（create/run/files/destroy 四个操作），换 backend 只改配置

---

## 4. 参考案例：Kimi 的沙箱用法

| Kimi 产品 | 用不用沙箱 | 形态 |
|---|---|---|
| 网页版普通对话 | ❌ | 纯模型生成 |
| 深度研究 | ✅ | 沙箱跑 Code/Browser 工具 |
| OK Computer（Agent） | ✅ 重度 | 一个任务一个沙箱，快照休眠唤醒 |
| Kimi Code（CLI/IDE） | 默认不用 | 跑在用户本机；社区反向用法是装进沙箱 |
| Kimi Claw | ✅ | 云托管 OpenClaw + 常驻沙箱（~40GB） |

实测要点：OK Computer 宣传"虚拟电脑"，工程实现是 **K8s 上的容器沙箱**（典型 2C4G），Kimi 自研 FUSE 网关（root 跑在沙箱外）以 mount propagation 注入 `/mnt/agents`，凭证按 `kimi_chat_id` 按会话签发。

核心模式：
- **Agent 产品** → 服务端每任务一个可休眠沙箱
- **编码工具** → 用户本机跑，第三方平台用 OpenSandbox/CubeSandbox 反向把它关进沙箱
- 粒度：**一个任务/会话 = 一个沙箱**（多步操作共享文件系统），任务结束销毁，长任务 sleep/wake + 快照

---

## 5. 开发环境搭建（Ubuntu 26.04，国内网络，8C16G）

### 5.1 apt 源（清华 tuna，resolute）

```bash
sudo tee /etc/apt/sources.list.d/tuna.list <<'EOF'
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ resolute main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ resolute-updates main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ resolute-security main restricted universe multiverse
EOF
# 注意：删掉残留的 download.docker.com noble 旧源（版本不匹配会 NO_PUBKEY 报错）
```

### 5.2 Docker daemon.json（含资源保护）

```json
{
  "data-root": "/data/docker",
  "registry-mirrors": [
    "https://xxxxxxxx.mirror.aliyuncs.com",
    "https://docker.1ms.run",
    "https://docker.m.daocloud.io"
  ],
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" },
  "default-ulimits": {
    "nofile": { "Name": "nofile", "Hard": 65536, "Soft": 65536 },
    "nproc":  { "Name": "nproc",  "Hard": 512,   "Soft": 512 }
  },
  "live-restore": true
}
```

- 第一个地址为阿里云 ACR 专属加速器（控制台免费领取）；`cr.console.aliyun.com` 是网页地址不能当 mirror
- USTC/163 等公益源 2024 年后基本关停，配了会白等超时
- OpenSandbox 官方组件镜像在阿里云 ACR：`sandbox-registry.cn-zhangjiakou.cr.aliyuncs.com/opensandbox/<component>`，不占 Docker Hub 加速名额

### 5.3 uv / pip 清华源

```toml
# ~/.config/uv/uv.toml
[[index]]
url = "https://pypi.tuna.tsinghua.edu.cn/simple"
default = true
```

### 5.4 OpenSandbox 启动（Docker 模式）

```bash
uv tool install opensandbox-server
uv tool install opensandbox-cli
uvx opensandbox-server init-config ~/.sandbox.toml --example docker
# 修改 ~/.sandbox.toml：execd 镜像换 ACR 地址；cpu=1 / memory=1g / timeout=300
uvx opensandbox-server
```

验证四步：create → exec → file roundtrip → destroy（全部断言通过即链路 OK）。

### 5.5 8C16G 容量估算

| 沙箱类型 | 单沙箱空闲内存 | 可驻留 | 活跃并发 |
|---|---|---|---|
| alpine/轻量 shell | 10–20MB | 300–500 | 50–100 |
| Python 解释器 | 50–80MB | 120–180 | 20–50 |
| 带依赖 agent 环境 | 150–300MB | 40–80 | 10–25 |
| Chrome/Playwright | 400–800MB | 15–30 | 4–10 |

公式：`驻留上限 ≈ 可用内存×0.75 / 单沙箱空闲内存`；`并发 ≈ 核心数 / 单任务均CPU × 0.7`

实际限制更早出现的往往是：Docker daemon 开销（实用上限先按 100–200 容器规划，配热池）、PID/FD/iptables 规则数。**必须给每个沙箱设内存限额 + timeout**，否则一个 OOM 拖垮全部。

---

## 6. 附录：一次网络故障排查（单向 ping 不通）

症状：Mac 无法 SSH/ping Ubuntu；Ubuntu 能 ping 通 Mac；ufw 未启用、sshd 正常、IP 未变。

排查链：
1. `tcpdump -i any icmp` → Ubuntu **收不到** ping 包 → 问题在电脑侧或中间网络
2. Mac `arp -a` → 目标 IP `(incomplete)` → **ARP 解析失败**，Mac 根本没发出 IP 包
3. Ubuntu `tcpdump -i wlp5s0 -e arp` → **能看到 Mac 的 ARP 请求但没有 is-at 应答**（或时好时坏，表现为先超时后 Host is down）
4. 定性：无线客户端间单播帧被丢（AP 客户端隔离）或 Ubuntu 不应答 ARP
   - 绕过实验：`sudo arp -s <IP> <MAC>` 绑静态 ARP 再 ping——通则纯 ARP 问题，不通则中间设备丢帧
   - 排 `arp_ignore`（须为 0）、`nft list ruleset`（Docker 遗留）、Wi-Fi 省电（`iw dev wlp5s0 set power_save off`）
   - 两端一有线一无线交叉验证可确认 AP 隔离

经验：**单向通 = 回程正常、去程某处丢**；`(incomplete)` = 二层都没通，先查 ARP，再查隔离。

---

## 7. 服务端架构：双引擎 + 沙箱

### 7.1 核心结论

- **一个任务（Run）一个沙箱，引擎随沙箱生灭**；"一个用户一个引擎"不可取（成本、爆炸半径、升级、并发四重崩）
- 用户状态在仓库/workspace/对话记录里，不在引擎进程里
- 用户感觉"环境还在" = 快照 + 休眠唤醒制造的错觉

### 7.2 两种部署拓扑

| | 拓扑 A：引擎常驻，沙箱执行工具 | 拓扑 B：引擎随沙箱生灭（推荐对外） |
|---|---|---|
| 结构 | API → 引擎池 → 租沙箱执行工具 | API → 调度器 → 沙箱（内含引擎） |
| 优点 | 启动零开销、事件流稳定 | 沙箱是唯一信任边界，升级=换镜像 |
| 缺点 | 引擎本身是多租户信任边界（Kimi 的复杂来源） | 需预热池管理引擎启动 |
| 适用 | 内部/可信租户 | 多租户 SaaS、不可信代码 |

### 7.3 引擎适配层（Driver）接口

```python
class EngineDriver:
    def lease(run_id, engine_type, image, ttl) -> Lease  # 领沙箱+启动引擎
    def stream(lease) -> Iterator[Event]                 # SSE 事件转发前端
    def collect(lease) -> Artifacts                      # diff/日志/文件落工件存储
    def release(lease)                                   # 销毁
    def pause(lease) -> ResumeToken                      # 领域流程 HITL 挂起用
    def resume(token) -> Lease
```

- `engine_type ∈ {codex, dsh}` → 预热池按引擎类型分桶（img-codex-runner / img-dsh-runner）
- 模型 key / git token 由调度器注入沙箱环境变量，前端与用户不可见（Credential Vault）

### 7.4 dsh 特别说明

- dsh = DeepSeek Harness：MIT 开源的 Agent **基础设施**（对比：Codex CLI 是 Agent 产品）；模型/工具/Agent Loop/沙箱/UI 全是可替换插件
- 三层集成接口：`dsh --profile headless "任务"`（一次无人值守任务）、Python SDK（deepseek-harness-sdk）、app-server + 事件流 + 审批回调
- 原生多 agent：spawn/fork 子代理、send_message/list_agents 通信、report 汇报——Team 模式可直接复用
- ⚠️ v0.1 开发者预览版，接口有破坏性变更：**锁版本、Driver 薄封装收敛调用点**
- ⚠️ dsh 自带"沙箱"（workspace-write/read-only/danger-full-access）是防误操作不是安全边界；**整个 dsh 跑在我们的沙箱里**，多租户环境禁 danger-full-access
- 要求 Node 22.19+/24+

---

## 8. 产品三层设计

### 8.1 分层

```
L0 平台层（通用能力）：模型网关 / 检索 / 原型绘制 / 代码执行 / 浏览器 / Skill(MCP) 系统
                     ↑ 全部注册为 Tool，统一 Schema、统一鉴权审计
L1 模式层：Solo（单对话全能） / Team（多 Bot 自由协作） / Domain（编排固化）
L2 领域层：Domain Pack = bot 阵容 + 流程编排 + 领域知识库 + 产物规范
```

要点：
- **Team 和 Domain 是同一个东西的两个自由度**：Team 分工由领队现场决定，Domain 分工提前编排成 SOP；运行时只实现"多 bot 协作"一件事
- **能力全部工具化**："画原型" = 生成代码 → 沙箱运行 → 截图导出，不是某 bot 的特殊功能
- 领域模式特有：**HITL 审批点**（人工确认后才流转）+ **产物规范 output_spec**（模板+校验）
- 战略：通用能力别做重（检索/浏览器/MCP 吃现成），工程精力压在执行层、编排层、领域包

### 8.2 领域包示例：专利生命周期（完整版）

**三个阶段、九条 flow、十三个可复用 bot、八个 HITL 决策点。**

#### 全景图

```
阶段一 创新源头：
  F1 行业洞察 [行业分析师+竞争情报员] → 全景图/趋势/竞对雷达/空白点报告
  F2 创新孵化 [创新教练+专利挖掘师]   → 技术方案 → 可专利点清单
  F3 布局策划 [布局策略师]            → 核心+外围+防御公开+申请顺序 → 布局方案【HITL①】
阶段二 申请中：
  F4 立项决策 [立项评审]              → 可专利性×商业价值×成本打分【HITL②】
  F5 新申请   [交底→查新→撰写→附图→递交] 【HITL③④⑤】
  F6 OA 循环  [OA答复+查新+撰写]      → N 通答复循环【HITL⑥】→ 授权/驳回
阶段三 资产管理：
  F7 授权后管理 [年费管家+价值评估师]  → 年费/放弃决策【HITL⑦】→ 分级维护
  F8 转化变现  [转化顾问]            → 估值/挂牌/许可/质押/作价入股【HITL⑧】
  F9 维权防御  [无效维权顾问]         → 侵权监测/无效应对 → 布局调整回流 F3（飞轮）
```

#### 关键产物链（F5/F6 详拆）

- 交底书工程师 → `交底书.docx`（技术问题/方案/有益效果/附图说明）【HITL③】
- 查新检索员 → `检索报告`（对比文件+特征映射+新颖性/创造性风险评级）【HITL④】
- 撰写代理人 → `说明书+权利要求书`（validator 自修复循环：引用链/支持性/清楚性）【HITL⑤】
- 附图工程师 → `说明书附图`（与权项一致性校验，冲突则回流转撰写）
- 流程管家 → `递交包` → 受理归档
- OA 循环：拆解驳回理由 → 补充检索 → 三策略分叉（陈述/修改权项/组合）【HITL⑥】→ 提交 → 平均 2-3 轮

#### Bot 花名册（沙箱 egress 策略）

| Bot | Flow | 沙箱策略 |
|---|---|---|
| 行业分析师 / 竞争情报员 / 查新检索员 / OA答复代理 / 转化顾问 / 流程管家 / 年费管家 / 立项评审 / 专利挖掘师 | 检索类 | 白名单联网 |
| 撰写代理人 / 交底书工程师 / 附图工程师 / 创新教练 / 布局策略师 | 生成类 | **断网（法条库/模板打进镜像）** |

#### 设计要点

1. 流转密度集中在阶段二（F5/F6），bot runtime 与 handoff 信封在此打磨；阶段一、三以产物数据管道为主
2. 8 个 HITL 点 = 8 个收费节点（立项/答复策略/年费/交易是人背书最值钱处）
3. F9→F3 回流边构成飞轮：每次维权/无效反哺布局，这是"生命周期"区别于"申请工具"的本质

---
### 8.3 节点业务逻辑详设（16 节点 · 五层体现）

**方法论：业务逻辑必须落在五层** —— 规则层（公式/校验器/期限表，代码）、流程层（内循环 SOP/分支，编排脚本）、行为层（人设/边界/追问策略，prompt）、产物层（模板+Schema+validator）、数据层（法条库/模板库/判例库 KB，断网 bot 打进镜像）。
**铁律：代码做裁判，LLM 做选手。** 能写成 if/公式/校验器的绝不写进 prompt。

---

#### 阶段一 · 创新源头

**1. 行业分析师（F1）**
- 职责：技术全景与空白点识别
- 输入：技术领域/产品线 → 输出：全景图、趋势报告、空白点清单
- 内循环：技术分解（IPC/CPC 分类树）→ 分面检索 → 聚类成专利地图 → 趋势分析（申请量/申请人/法律状态分布）→ 空白点识别
- 规则层：**空白点评分 = 市场热度 × (1 − 专利密度) × 规避难度**；聚类阈值；Top-N 截断
- 体现：检索式模板库 + 分析 SOP 脚本 + 可视化模板；prompt 边界：只做事实分析，结论必须挂数据

**2. 竞争情报员（F1/F9）**
- 职责：竞对监控与预警
- 内循环：定期拉取竞对新公开 → 技术归类 → 与己方布局比对 → 预警分级
- 规则层：**预警分级 P0/P1/P2**（P0=覆盖己方核心专利，P1=进入己方空白点，P2=一般动态）；比对规则代码
- 体现：cron 触发器 + 预警模板 + 竞对清单配置

**3. 创新教练（F2）**
- 职责：从空白点/痛点产出技术方案
- 内循环：问题重构（TRIZ 40 发明原理/减法/反作用）→ 多方案生成 → 可行性自检（与现有技术冲突初检）
- 规则层：方案必须含 技术问题/方案/效果/替代方案枚举；自检触发条件
- 体现：TRIZ 知识库（数据层）+ 发散约束 prompt + 方案模板

**4. 专利挖掘师（F2）**
- 职责：从技术方案挖出全部可专利点
- 内循环：技术特征树拆解 → 逐特征问"还有没有其他实现方式"（可规避性）→ 保护客体枚举（方法/装置/系统/介质/用途）→ 创新点排序
- 规则层：**挖掘七问 checklist**（省去什么/替换什么/反过来/组合/放大缩小/用途迁移/预处理）；每个可专利点必须写成"技术问题—手段—效果"三段式
- 体现：checklist 强制流程（代码）+ 三段式 validator；挖掘出一个方案平均 3-5 个保护点

**5. 布局策略师（F3）**
- 职责：把可专利点排成棋局
- 内循环：分诊（核心/外围/防御公开）→ 时间排序（基础申请先于改进，防自我堵路）→ 地域建议 → 引用链设计（己方专利互相引用建篱笆）
- 规则层：**引用链 validator（图无环 + 全覆盖）**；公开时点规则（申请前不论文公开）
- 体现：布局画布模板 + 引用图 validator + 策略 prompt；【HITL①】布局方案人审

#### 阶段二 · 申请中

**6. 立项评审（F4）**
- 职责：三轴评分与申请建议
- 规则层：**评分 = 可专利性（近似对比文件数 × 区别特征显著度）× 商业价值（市场规模 × 对手规避成本）× 成本（申请+维持费现值）**；阈值：≥75 建议申请，<50 建议放弃，中间转人工
- 体现：评分卡模板 + 公式代码；【HITL②】

**7. 交底书工程师（F5）**
- 职责：结构化交底书采集
- 内循环：六段式采集（背景技术/现有缺陷/发明内容/实施方式/有益效果/附图说明）→ 缺项追问循环（≤5 轮）→ 成稿
- 规则层：六段必填 validator；有益效果必须有数据或机理支撑
- 体现：交底书模板 + 追问策略 prompt；【HITL③】

**8. 查新检索员（F5/F6）**
- 职责：可支撑决策的检索报告
- 内循环：特征拆解（三段式校验）→ 检索式生成（同义词扩展表=代码常量）→ 初检过滤 → 精读填特征映射表 → 覆盖度 CHECK（全部特征有对比文件？否→补检索式，内循环）→ 风险评级
- 规则层：检索式生成器、覆盖度检查、**新颖性风险=有无单篇全覆盖；创造性风险=最接近文件+区别特征公知性**
- 体现：检索报告模板 + 映射表 schema；【HITL④】

**9. 撰写代理人（F5/F6）**
- 职责：说明书 + 权利要求书
- 内循环：权项布局（独权最小保护集 + 从权梯度）→ 说明书五段 → validator 自修复（≤3 次）
- 规则层：**引用链完整性 / 支持性（权项术语说明书必有定义）/ 单一性 / 清楚性** 四类校验器
- 体现：法条库打进断网镜像（数据层）+ 权项模板 + validator 代码；【HITL⑤】

**10. 附图工程师（F5/F6）**
- 职责：说明书附图
- 内循环：读权项 → 确定必要附图类型（装置/流程/时序）→ 绘制 → 一致性校验
- 规则层：专利附图规范（线条/标注/不得照片化）；**图注术语与权项术语一致性检查**，不一致回流转撰写
- 体现：绘图工具链 + 校验代码

**11. 流程管家（F5–F7）**
- 职责：期限台账与递交
- 内循环：官方法定期限台账（申请日/公开日/实审请求/答复期）→ 到期提醒 → 递交材料清单核查 → 通知书归档
- 规则层：**期限表=代码常量**（法定期限+滞纳金规则）；答复期计算器
- 体现：台账 schema + cron

**12. OA 答复代理（F6）**
- 职责：通知书 → 可提交答复
- 内循环：拆解（**驳回理由分类器**：新颖性/创造性/公开不充分/清楚性/单一性）→ 针对性动作（创造性→查新补充检索；公开不充分→撰写补实施例；清楚性→修术语）→ 策略生成（陈述/修改/组合三案并列+成功率预估）→【HITL⑥】→ 修改（**不得超范围检查器：新权项每特征须有原文件字面或等同依据**）→ 提交包
- 体现：理由分类器（代码关键词+LLM 兜底）+ 策略分叉矩阵 + 答复策略卡模板

#### 阶段三 · 资产管理

**13. 年费管家（F7）**
- 职责：期限监控与缴费建议
- 规则层：法定期限+滞纳金规则表；缴费窗口计算；放弃建议联动价值评估师评分
- 体现：规则表代码 + 提醒模板；【HITL⑦】

**14. 价值评估师（F7）**
- 职责：专利分级
- 规则层：**分级评分 = 引用次数 + 同族数 + 许可历史 + 产品映射度** → 核心维持 / 外围观察 / 建议放弃
- 体现：评分卡 + 复核触发规则

**15. 转化顾问（F8）**
- 职责：估值与交易
- 内循环：估值（收益法 DCF / 市场法对标）→ 交易结构设计（普通/排他/独占许可，地域/期限）→ 合同草案
- 规则层：估值公式；**合同必备条款 validator**（标的/范围/对价/违约/分许可）
- 体现：合同模板库 + 估值计算器；【HITL⑧】

**16. 无效维权顾问（F9）**
- 职责：侵权监测与应对，布局飞轮发起点
- 内循环：侵权比对（**全面覆盖原则比对器：权项每特征 × 被控产品逐项映射**）→ 己方稳定性初筛 → 应对策略 → 布局调整建议
- 规则层：比对器代码 + 稳定性指标（同族/无效史/审查档案）
- 产出：**F9→F3 回流信封**（布局漏洞报告），飞轮闭环

---

**共同模式**：检索类 bot 白名单联网，生成类 bot 断网（法条/模板进镜像）；每个 bot 的确定性规则（validator/公式/分类器）是代码资产，prompt 只负责"怎么做动作"不管"怎么判对错"；所有 handoff 信封与 validator 结果落数据中台形成审计链。

---

## 9. 三种模式的沙箱设计

| 机制 | Solo | Team | Domain |
|---|---|---|---|
| 粒度 | 一次工具调用一个沙箱（5–15min） | 一个 worker 一个沙箱（任务级 TTL） | 按 pack 预声明，可按 bot 差异化 |
| 池子 | 按工具类型维温（proto/python/docx） | 按引擎类型 + 通用 worker | 按 pack 镜像维温，开机即热 |
| workspace | 无 | **共享卷（RWX）**，产物互相可见 | 步骤间共享卷传产物，HITL 点锁快照给人审 |
| egress | 按需白名单 | 白名单 + 成员独立 | **按 bot 定级**：检索员白名单联网；撰写代理人完全断网（法条库打进镜像） |
| 快照/休眠 | 不用 | 长任务用 | 跨周长流程必须，挂起不占资源 |
| 审计 | 工具调用日志 | 成员级事件流 | **步骤级**（输入/产物/审批全落数据中台） |

HITL 配合：bot 产出 → 写 workspace → **沙箱快照休眠**（不占 CPU）→ 前端人工批注 → 批准则恢复快照续跑 / 驳回带批注重跑该步。

---

## 10. 容量规划（生产）

单沙箱 2C4G 档：

| 并发任务 | 8C16G 节点数 |
|---|---|
| 50 | 6–8 台 |
| 200 | 25–30 台（CubeSandbox 密度更高可省 30–40%） |
| 1000+ | 100+ 台，控制面本身需 HA |

---

## 11. 实施路线图

| 阶段 | 内容 | 产出 |
|---|---|---|
| Week 1 | Solo 模式：Bot 配置 + 普通对话 + 工具链（检索/画原型走沙箱） | 流量入口可用 |
| Week 2 | Run 状态机 + Driver（先 codex 后 dsh）五步闭环 + 预热池 | 单任务带沙箱执行 |
| Week 3 | Team 模式：dsh 子代理 + 共享 workspace + SSE 成员看板 | 多 Bot 协作演示版 |
| Week 4 | 首个 Domain Pack（专利·新申请一条 flow + 2 个 HITL 点）找种子客户付费验证 | **商业模式验证** |
| 之后 | pause/resume、快照续会话、egress 白名单、Credential Vault、审计合规、Pack 市场 | 企业级加固 |

验证路径（开发机 8C16G）：Solo 画原型链路 → Team 三 bot 共享卷 → 专利 flow 断网撰写 + HITL 挂起恢复。

---

## 12. 关键决策清单（速查）

1. 沙箱粒度：**一任务一沙箱**，引擎随沙箱生灭；用户状态在 workspace 不在引擎
2. 对外多租户：**拓扑 B** + gVisor/Kata；商业化不可信负载评估 CubeSandbox MicroVM
3. 引擎抽象：Driver 四操作 + pause/resume，harness 即插件，锁版本
4. 通用能力全部 MCP/工具化，权限分级在平台层
5. Team=Domain 同一运行时，领域包四件套（bots/flows/kb/specs）+ HITL
6. 沙箱三池分桶：solo-tools / team-workers / domain-{pack}
7. 密钥永留服务端，短期凭证注入；断网撰写、出网检索的 egress 分级是合规卖点
8. 8C16G 开发机：Python 类沙箱 100+ 驻留、20–50 并发；浏览器沙箱只够 4–8 并发

---

## 13. 合规与产品定位（P0，先于施工）

### 13.1 专利代理执业边界

中国专利代理是**许可执业行业**（《专利代理条例》《专利代理管理办法》），未取得专利代理机构执业许可证的主体不得从事专利代理业务。本平台直接踩线的功能：**撰写代理人**（生成权利要求书/说明书）、**OA 答复代理**（生成答复文件）。

三档产品定位（必选其一并写进用户协议）：

| 档位 | 定位 | 合规要点 |
|---|---|---|
| A. 工具辅助版（C端） | "AI 辅助撰写工具，申请文件由用户或其委托的代理机构负责" | 所有产出文件强制走"执业责任人确认"（有资质代理人签字）后才允许导出/递交；UI 全程明示责任归属 |
| B. 机构合作版（B端，**推荐起步**） | 卖给专利代理机构，作为其内部效率工具 | 机构自带资质，平台不触线；按席位收费，客单价高、决策链短 |
| C. 自持资质版 | 平台自己申请专利代理机构资质 | 周期长，作为 B 端验证后的升级选项 |

### 13.2 技术秘密保护（比合规更致命）

交底书上传平台的那一刻，它是**未申请的技术秘密**——而且泄露的法律后果不是赔偿那么简单：**公开导致新颖性丧失，这个专利直接死掉**。因此：

- 传输/存储全程加密，密钥按租户隔离；
- 检索、撰写沙箱的镜像和卷按租户隔离，杜绝跨租户残留；
- 用户协议中数据处理条款 + 泄密责任条款；日志审计链（handoff + validator 结果全留痕）同时就是责任追溯证据；
- 对敏感客户提供**私有化部署**选项（整套 pack + 运行时交付到客户环境）——这反而是企业级收入点。

### 13.3 其他合规面

- 发明人个人信息（PII）处理：数据中台脱敏；
- 流程完整性和期限计算的法律责任：流程管家的期限表必须经领域专家核对并版本化，错误导致的逾期损失需要责任条款兜底；
- 输出物水印：AI 生成文件的元数据留痕。

---

## 14. 假设验证清单（P0，施工前置条件）

文档中所有三方组件细节来自官方 README/搜索资料，**未经本环境实测**。开工前逐项验证；验证结果回填此表，实测数字替换前文斜体估算。

| # | 假设 | 来源 | 状态 | 验证方法 | 阻塞级别 |
|---|---|---|---|---|---|
| 1 | `uvx opensandbox-server init-config --example docker` 可用且能启动 | 官方 README | 待验证 | 开发机执行 §5.4 | **P0** |
| 2 | `~/.sandbox.toml` 支持 per-sandbox cpu/memory/timeout 限额 | 推测 | 待验证 | 生成配置后逐字段比对 example | **P0** |
| 3 | OpenSandbox 支持沙箱暂停/恢复或等价快照机制 | 推测（HITL 挂起的前提） | 待验证 | 查 server 配置 + SDK API | **P0** |
| 4 | per-sandbox egress 白名单可配置 | 官方 README 声称 | 待验证 | 沙箱内 curl 白名单外域名应失败 | **P0** |
| 5 | Credential Vault 可注入密钥且对负载不可见 | 官方 README 声称 | 待验证 | 沙箱内 env/文件审计 | P1 |
| 6 | OpenSandbox K8s runtime + Helm chart 存在且可用 | repo 结构 | 待验证 | 集群搭好后 helm install | P1 |
| 7 | dsh 存在 `--profile headless` 与 Python SDK | v0.1 dev preview 文档 | 待验证 + 接口可能变 | 锁版本安装后跑通非交互任务 | **P0** |
| 8 | dsh 原生 spawn/report 子代理原语 | 同上 | 待验证 | 写一个双 agent 演示 | P1 |
| 9 | CubeSandbox 指标（<60ms 冷启动、<5MB 开销） | 厂商宣称 | 未复测 | POC 压测，复现不了则降级预期 | P1 |
| 10 | CubeSandbox `MIRROR=cn` 国内安装路径 | 厂商文档 | 待验证 | 测试机执行 | P1 |
| 11 | CubeSandbox E2B SDK 兼容 | 厂商宣称 | 待验证 | 用 E2B SDK 调 Cube 端点 | P2 |
| 12 | 阿里云 ACS Agent Sandbox 可商务购买 | 案例文章 | 待验证 | 联系销售 | P2 |
| 13 | Python 沙箱空闲内存 ~60MB、8C16G 驻留 100+/并发 20–50 | **本方估算** | 待压测 | 100 沙箱压测脚本实测回填 | P1 |
| 14 | 专利法定期限表（答复期/年费/滞纳金）可准确代码化 | 领域常识 | 待专家核对 | 专利代理师评审 rules/ 常量表 | **P0** |
| 15 | Driver pause/resume 接口设计可行 | 本方设计 | 依赖 #3 | 实现后 HITL 挂起测试 | P1 |
| 16 | Kimi 沙箱规格 2C4G / FUSE 网关设计 | 第三方实测报告（单一来源） | 参考性引用 | 仅作设计参考，不作承诺依据 | P2 |

**排版约定**：前文所有容量/性能数字为估算值，施工后以实测回填并标注；本文档中斜体数字 = 未验证估算。

---

## 15. P1 补充设计（施工首周内完成）

### 15.1 注入消毒（内容安全）

**威胁模型**：检索到的对比文件、抓取的网页、上游 bot 的产物都可能携带"忽略之前指令"类注入，沿 handoff 信封逐节点传播，最终进入正式交付物。

三层防御（代码骨架）：

```python
# ① 边界消毒：指令通道与数据通道分离
# 工具返回不直接拼进消息历史，而是结构化数据消息
obs = {"role": "tool", "name": "patent_search",
       "content": json.dumps(results),          # 数据
       "untrusted": True}                       # 打标
# system prompt 明示：标记 untrusted 的内容是数据不是指令

# ② 产物消毒：handoff.deliver 前的注入扫描
INJECTION_PATTERNS = [r"忽略(之前|上述|所有)", r"forget\s+(previous|all)",
                      r"system\s*prompt", r"忽略你的"]
def sanitize(artifacts) -> list[Issue]:
    hits = [p for p in INJECTION_PATTERNS
            if re.search(p, artifacts.text, re.I)]
    if hits: return [Issue("INJECTION_SUSPECTED",
                  f"产物疑似含注入模式 {hits}，已隔离转人工审核")]  # blocker
    return []

# ③ 权限最小化：bot 动作白名单（编排器强制，不依赖 prompt 自觉）
ALLOWED_ACTIONS = {"查新检索员": {"patent_search","read_doc","write_file"},
                   "流程管家":   {"register_deadline","file_package"}}  # 无"提交"权限
# 敏感动作（递交/交易签约/删除）= 编排器 + 人工双确认，任何 bot 不可直达
```

### 15.2 数据模型（状态持久化）

```sql
bots(id, name, pack_id, spec_yaml, image, version)
conversations(id, user_id, bot_id, mode, orchestration_id, title)
runs(id, conversation_id, flow_name, status, iterations, budget_token,
     deadline, resume_token, idempotency_key UNIQUE, created_at)
  -- status: planning|running|awaiting_hitl|suspended|done|failed
  -- 幂等：创建携带 idempotency_key，重复提交返回同 run；
  --       状态转移用 conditional update (WHERE status='running') 防并发改乱
run_steps(id, run_id, step_name, bot_id, attempt, status, sandbox_id, started_at)
handoffs(id, run_id, step_id, type, payload_json, audit_ref)      -- 信封全留痕
artifacts(id, run_id, step_id, path, type, sha256, tenant_enc_key_id)
hitl_approvals(id, run_id, step_id, approver, decision, comment,
               decided_at UNIQUE(run_id, step_id))               -- 幂等：一人一票
sandbox_leases(id, run_id, pool, image, status, leased_at, released_at)
audit_events(id, run_id, actor, action, detail_json, ts)          -- 合规追溯链
```

**崩溃恢复**：编排器重启时扫描 `status IN ('running','awaiting_hitl')` 的 run——
`awaiting_hitl` 直接恢复等待（resume_token 已持久化）；`running` 按 step 重放或标记 `failed` 转人工，**绝不静默重跑**（专利流程重跑有副作用，如重复递交）。

### 15.3 评测体系

三层指标，各配基线与门禁：

| 层 | 指标 | 基线来源 | 门禁（pack 发布前） |
|---|---|---|---|
| 工程层 | validator 一次过检率、沙箱启动延迟、单任务 token 成本 | 灰度运行 2 周统计 | 过检率 ≥70%，超基线成本 20% 阻断发布 |
| 任务层 | 查新召回率（对比专家 golden set）、OA 策略专家采纳率、交底书一次确认率 | 专家标注 ≥50 例评测集 | 召回率 ≥85%，采纳率 ≥60%，低于则回炉对应节点 |
| 业务层 | HITL 驳回率、单流程交付周期、客户复购 | 种子客户真实使用 | 驳回率连续 2 周下降才放量 |

**回溯机制**：每个评测失败样本必须归因到三层之一——prompt（改行为层）/ validator（规则漏判，改规则层）/ 检索源（换数据源），禁止"调一下 prompt 试试"式无归因调优。
