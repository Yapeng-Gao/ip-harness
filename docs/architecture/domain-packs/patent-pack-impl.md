# 专利 Domain Pack · 实现蓝图（正式稿）

> **正式规格**（2026-09-21 · 补内/外循环表达）。源稿：[../incoming/patent-domain-pack-impl.md](../incoming/patent-domain-pack-impl.md)。  
> 设计规格：[patent-pack-design.md](./patent-pack-design.md)（含 Loop 总索引）。环边样机：[agent-pack-loops-roadmap](../product-apps/agent-pack-loops-roadmap.md)。平台：[../agent-platform.md](../agent-platform.md)。  
> **本轮纪律**：**无**在 `packages/**` / `apps/**` 落地真代码；本文为装配蓝图与排期，供评审与后续施工。  
> **样机诚实**：今日 Vite 样机用 mock 剧本，**无** BotRuntime / FlowEngine / 真 validator。

---

## 0. 目标包结构（未来仓内位置示意）

```text
patent-pack/                    # 未来可落 packages/ 或独立 pack 仓；本轮不创建
├── runtime/
│   ├── bot_runtime.py          # Bot 内循环驱动
│   ├── validators.py           # Validator 框架
│   ├── tools.py                # 工具注册表
│   └── handoff.py              # 信封序列化
├── orchestrator/
│   ├── flow_engine.py          # 状态机执行器
│   └── hitl.py                 # 挂起 / 恢复 / 审批
├── bots/                       # 每节点 YAML 装配（共 16）
├── rules/                      # 规则层代码（裁判）
├── prompts/                    # 行为层
├── templates/                  # 产物层
└── kb/                         # 数据层（断网镜像内）
```

**原则**：16 节点共用一套 runtime；差异全部外置为 YAML + rules + prompt。

---

## 1. BotRuntime（内循环）

职责：按 `BotSpec` 领沙箱 → 消息循环调 harness → 工具在沙箱内执行 → `validate(output_spec)` → 失败则注入 feedback 自修复（≤ `max_retries`）→ 交付或 escalate 人工。

`BotSpec` 字段（契约级）：`name` · `image` · `egress` · `tools[]` · `output_spec` · `max_steps` · `max_retries`。

接口要点（伪代码语义，非正式 SDK）：

| 步骤 | 行为 |
|------|------|
| `driver.lease` | 按镜像与 egress 领沙箱 |
| `_loop` | system prompt + task；`engine.complete`；工具经 registry 在沙箱执行 |
| `validate` | **代码裁判**；有 Issue 则重跑 |
| `Handoff.deliver` / `escalate` | 过检交付；超限不自爆，交编排器 |
| `driver.release` | finally 销毁 |

Driver 来自平台层（lease/stream/collect/release/pause/resume），见 [agent-platform](../agent-platform.md)。

---

## 1.1 内循环 vs 外循环（BotRuntime / FlowEngine 表达）

> **蓝图 only**；本轮不在 `packages/**` 落真代码。与 [patent-pack-design §0.2 / §5.4](./patent-pack-design.md) 对齐。

| 概念 | 谁表达 | 机制（契约级） | 退出 |
|------|--------|----------------|------|
| **内循环** | **BotRuntime** | 同一 bot · 同一 lease：`max_steps` turn budget + `validate` → Issue 注入 → 原地重跑（`max_retries`，典型 ≤3）；追问类用消息循环（如交底 ≤5） | 过检 → `Handoff.deliver`；超限 → `escalate`（不静默重跑） |
| **外循环** | **FlowEngine** | 跨 bot / 跨步骤 / 跨 Run 的图边 | 见下表各边 |

**外循环边（FlowEngine）**：

| 边 | 触发 | 表达 | 备注 |
|----|------|------|------|
| HITL 驳回 | `hitl_rejected` + 批注 | pause→注入批注→**重跑同一步**（attempts++） | 人工控制上限 |
| feedback 退回 | 下游 `type: feedback` 信封 | 退回指定上游 step；可换沙箱新 lease | 如附图→撰写术语差集 |
| 查新不乐观回流 | HITL④ 不乐观 | 新信封 / 跳转 F2 或 F3（换方向/调布局） | 跨 Flow |
| OA **N 通** | 新通知书到达 | **新 Run** 或同 Flow 计数器 `oa_pass++` 回到理由分类节点 | 法定程序结束于授权/驳回 |
| 超范围 blocker | 不得超范围检查失败 | **`max_retries=0`** → 直接 escalate | 红线，禁止自修复当内循环用 |
| F9→F3 飞轮 | 维权/无效事件 | feedback 信封 → 布局策略师；可跨年度 | Phase 可后落 |
| 全局熔断 | `iterations≥8` / token / deadline | Suspended → 人工兜底 | **禁静默重跑**（递交有副作用） |

**一句话**：内循环 = BotRuntime 的 turn + validator retry；外循环 = FlowEngine 的 Handoff feedback 边 / 新 Run / HITL reject 回边 / N-pass 计数 / F9→F3 信封。

样机三刀（mock，无真沙箱）：[agent-pack-loops-roadmap](../product-apps/agent-pack-loops-roadmap.md)。


---

## 2. FlowEngine + HITL

| 触发 | 行为 |
|------|------|
| `deliver` | 审计落库 → 下一步 |
| `feedback` | 退回指定上游 step |
| `hitl_approved` | `goto_next`；可 `driver.resume` |
| `hitl_rejected` | 批注注入 → 重跑该步 |
| `validator_escalate` | suspend 转人工 |
| 全局 `max_iterations` / token / deadline | fail → 人工兜底；**禁静默重跑**（专利递交有副作用） |

HITL：产物过检且步骤含审批点 → `driver.pause` → 前端人审 → 批准恢复 / 驳回带批注重跑。

---

## 3. Validator 框架

统一形态：`Issue { code, message, blocker }`；`validate(spec_name, artifacts) → Issue[]`。  
`message` 面向 bot 重跑指令，而非仅给人看的文案。

规则模块（示意）与设计席对应：

| 模块 | 覆盖 |
|------|------|
| `prior_art` | 覆盖度、新颖性/创造性风险 |
| `claim_drafting` | 引用链 / 支持性 / 单一性 / 清楚性 |
| `disclosure` | 六段必填、效果证据 |
| `layout_graph` | 引用图无环 + 全覆盖 |
| `oa_response` | 理由分类、**不得超范围**（红线可直接 escalate） |
| `valuation` | 立项/年费/转化评分公式 |
| `enforcement` | 全面覆盖比对 |
| `landscape` / `watch` / `ideation` | 空白点评分、P0/P1/P2、四要素 |

评分类公式须注册为**可调用工具**：LLM 只抽证据，数字从代码出。

---

## 4. 四原型装配（16 席归类）

| 原型 | 节点 | 内循环形态 | 排期提示 |
|------|------|------------|----------|
| **A 检索类** | 行业分析师、竞争情报员、查新检索员、OA答复 | 检索→精读→覆盖度/分类 | 查新（#8）先行打通 F5 主链 |
| **B 生成类** | 创新教练、布局、交底、撰写、附图 | 起草→validator 自修复 | 撰写（#9）validator 最重 |
| **C 评分类** | 立项、年费、价值、转化 | LLM 抽证据 + 公式工具 | 最快；公式集中 `valuation` |
| **D 比对类** | 无效维权 | 逐特征映射表 | 依赖特征结构化质量 |

每节点验收：设计稿内循环可自动走完；HITL 点按预期挂起；YAML + validator + prompt 三件套齐备。

YAML 示例形态（查新）：

```yaml
name: 查新检索员
image: img-research
egress: [专利库, …]
tools: [patent_search, read_doc, write_file]
output_spec: prior_art_report
max_steps: 25
```

断网生成类：`egress: []`，镜像内含 kb。

---

## 5. 与现仓 Catalog / 样机关系

| 现仓 | 本蓝图 |
|------|--------|
| Catalog mock 剧本 | 将来由 BotRuntime + YAML 替换；本轮不动样机 |
| Confirm → DomainCommand | 保留为 HITL 后的正式写形状 |
| 双文件 worklog | 产物层可映射为 artifacts + 过程面板；不冲突 |
| `packages/contracts` | 本轮**不改**；新 key 仅提案 |

施工前置：平台假设验证清单（OpenSandbox / dsh / 期限表专家核对等）P0 项通过；合规定位选定（推荐机构合作版）。见平台稿 §13–14。

---

## 6. 排期建议

| 块 | 估时量级 | 说明 |
|----|----------|------|
| 统一 Runtime + FlowEngine + HITL 桥 | ≈ 1 周 | 含 Driver 对接 |
| 原型 A 接入（尤其查新） | 每节点 ~validator+YAML | F5 主链路先通 |
| 原型 B | 校验器较厚 | 撰写优先 |
| 原型 C | 每节点 <0.5 天量级 | F7/F8 可 Phase |
| 原型 D | 比对器单独 | F9 飞轮可 Phase |

**建议顺序（文档已冻结后）**：docs（本轮）→ 样机内 mock validator（后续原型刀）→ 真沙箱 + Driver（平台刀）→ Pack 节点逐个接线。  
详见 [agent-platform-gap](../product-apps/agent-platform-gap.md)。**本轮样机未动。**

---

## 7. Owner

规格：架构设计 · 实现：后续领域/平台刀（另开 PR）· **禁止**本轮改 apps/packages
