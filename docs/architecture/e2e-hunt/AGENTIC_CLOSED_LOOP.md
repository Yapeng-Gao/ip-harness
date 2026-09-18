# Agentic 测试闭环 · 完善版方案（贴 ip-harness）

| 项 | 值 |
|----|-----|
| **版本** | **v1.2** |
| **日期** | 2026-09-18 |
| **合并源** | A) 本仓 `docs/architecture/e2e-hunt/*` + `tools/e2e-hunt` MVP · B) 用户《Agentic 测试闭环系统方案》v1.1（L1–L7 / 噪声预算 / repro_script / 分阶段） |
| **分支口径** | `origin/dev` · 原型样机阶段 |
| **实现入口** | `tools/e2e-hunt/` · `npm run hunt:search-smoke` · `npm run test:e2e`（L0） |

## 与仓映射（一页看清）

| v1.1 概念 | 本仓落点 | 现状 |
|-----------|----------|------|
| 轨道 A（脚本化核心） | `e2e/l0-*.spec.ts` · Playwright · `npm run test:e2e` | **已有 · CI 绿灯** |
| 轨道 B（Agent 探索） | `tools/e2e-hunt` AgentLoop + CasePack | **MVP 雏形**（规则 decide；LLM 后置） |
| L1 观测 / Evidence Pack | CheapSignals + 逐步截图/a11y → `tools/e2e-hunt/artifacts/<runId>/` | **MVP 已有**；无 S3 |
| L2 探索 | CasePack + maxSteps / 去重 / 中止 | **MVP 已有**（1 CasePack） |
| L3 分析 / Oracle | `rules.ts` 白名单 + fail_hard/suspect；聚类去重雏形 | **O1 规则为主**；O2/O3 后置 |
| L4 决策门 | 人审 report.md / findings；**不挡合并** | **流程约定**；无 Dashboard |
| L5 实施（编码 Agent） | — | **延后 · 本版不做** |
| L6 验证 | L0 必绿；Hunt repro 人审复跑 | **L0 在线**；repro_script Phase 0′ 可手写 |
| L7 Agent 留痕 | 计划字段 `agent_reasoning`；现有 step.note / judge | **契约补齐 · 实现跟进** |
| 样机诚实白名单 | `tools/e2e-hunt/src/rules.ts` · signals §4 | **已实现** |
| 真 GPU / 真 SFT | I2 stub 已封存 | **冻结 · 本闭环范围外** |

---

## 1. 定位与原则

**一句话**：L0/L1 管绿灯；Hunt 管找虫；人守决策门；**不承诺无人值守**。

**解决什么**：预设断言盖不住过程态故障与探索路径；发现止于报告时，至少要有**可审证据链 + 可复现路径**，再谈自动修。

**不解决什么**：替代 L0 冒烟；零假阳性全自动放行；本阶段自动改产品代码。

### 六原则（保留 v1.1）+ 样机诚实

| # | 原则 | 本仓注解 |
|---|------|----------|
| 1 | 测试代码变更 ≠ 产品修复；断言变更走人审 PR | Hunt / e2e 改动与 `apps/*` 分 PR |
| 2 | 失败后重跑通过一律 flaky，绝不直接记绿 | L0 失败即红；Hunt 不记「绿代 L0」 |
| 3 | 自愈是提议；基线 diff + 人审批后才应用 | Phase 0′/1′ 无视觉自愈；仅人审 dismiss/approve |
| 4 | Agent 权限最小化；写操作仅限 sandbox | **L5 延后**；本地 Owner bot 修产品，禁 Cloud Agent 自动修 |
| 5 | 全链路审计；判断附证据链 | report.json steps + findings.evidence |
| 6 | **噪声预算制**：积压超阈熔断探索 | 按 **1 审批者**缩放（见 §6） |
| **7′** | **样机诚实白名单**（本仓硬约束） | mock 横幅 / 策略 A toast / SKU 空态 / OIDC 未接入等 **不记缺陷** |

---

## 2. 分层 L1–L7 与仓内对照

```text
L6 验证     L0 必绿 · （可选）重跑 repro_script / CasePack
            ▲ 人审通过后才谈「升格窄 L1」；Hunt 永不单独挡合并
L5 实施     【延后】无自动修 Agent；本地 Owner 手工修 + 人审 PR
            ▲
L4 决策门   人读 report.md · 批准/误报/转工单/忽略 · 噪声预算
            ▲
L3 分析     O1 规则（CheapSignals）· 去重指纹 · （后）O2/O3
            ▲
L2 探索     轨道A=L0 脚本 │ 轨道B=Hunt CasePack（熔断受 L4 积压约束）
            ▲
L1 观测     CheapSignals + 截图 + a11y → Evidence Pack（本地 artifacts/）
║
L7 贯穿     agent_reasoning / step.note / 失控熔断（maxSteps·loop·stall）
```

| 层 | 职责 | 仓内实现 / 约定 | 阶段 |
|----|------|-----------------|------|
| **L0（轨道 A）** | CI 绿灯：端口/地标挂立刻红 | `e2e/` Playwright · `test:e2e` | **已上线** |
| **L1 观测** | 眼睛：console / pageerror / requestfailed / 截图 / a11y | `cheap-signals.ts` · `observer.ts` · artifacts | MVP |
| **L2 探索（轨道 B）** | CasePack 目标驱动步进 | `loop.ts` · `casepacks/` · Adapter | MVP 雏形 |
| **L3 分析** | 信号→Finding；白名单；指纹去重 | `rules.ts` · reporter findings | O1 为主 |
| **L4 决策门** | 人审严重度 / 误报回写 | 读 `report.md`；**Hunt 不挡 PR** | 流程 |
| **L5 实施** | 编码 Agent 开修 PR | **明确不做（本版）** | 延后 |
| **L6 验证** | 定向复现 + L0 回归 | L0 必跑；repro 手写或后固化 | 0′–1′ |
| **L7 可观测** | Agent 决策留痕 + 失控自愈 | 契约补 `agent_reasoning`；loop 已有中止 | 跟进 |

**双轨纪律（不可破）**

| 轨 | 工具 | 挡合并？ | 目标 |
|----|------|----------|------|
| **A · L0** | Playwright 冒烟 | **是** | 秒级发现壳挂 |
| **B · Hunt** | e2e-hunt | **默认否** | 探索 + 证据；人审后可升格窄 L1 |

禁止：Hunt 绿代替 L0 绿；为「清单完整」把 Hunt 步数拉满当 L1。

---

## 3. Evidence Pack 形状

对齐现有 [report-contract.md](./report-contract.md) + MVP 产物目录；**Phase 0′ 不要求 S3**。

### 3.1 落盘位置

```text
tools/e2e-hunt/artifacts/<runId>/
  report.json          # 机器可读（契约权威）
  report.md            # 人审入口
  step-00N.png         # 逐步截图
  （后）trace-00N.zip  # Playwright trace，增强档
```

### 3.2 逐步证据（在 report.json `steps[]` 上扩展）

| 字段 | 来源 | 说明 |
|------|------|------|
| `i` / `url` / `action` | 现有 | Driver 语义动作 |
| `signals` | CheapSignals | 本步 delta；白名单已标 `whitelisted` |
| `screenshot` | Observer | 相对 artifacts 路径 |
| `a11ySummary` | Observer | 角色+名摘要（优先于裸 HTML） |
| `judge` | Loop | `pass_step \| suspect \| fail_hard \| stop` |
| **`agent_reasoning`**（补） | L7 | `{ observation_digest, judgement, judgement_basis }`；规则短路时可填 `"rule:…"` |
| `note` | 现有 | 人读旁注；可与 reasoning 并存 |

示意（单步增量，不推翻 schemaVersion 1.0 最小集）：

```json
{
  "i": 3,
  "url": "http://localhost:5182/",
  "action": { "type": "click", "role": "button", "name": "检索" },
  "signals": [],
  "screenshot": "step-003.png",
  "judge": "pass_step",
  "agent_reasoning": {
    "observation_digest": "三模式 Tab 可见；列表区有命中行",
    "judgement": "pass_step",
    "judgement_basis": "checkpoint search-results 已达；无新增 pageerror"
  }
}
```

### 3.3 设计要点

1. 证据包**可寻址、随 run 不可变**；Finding 必须回链 `steps[]` / 截图。  
2. `agent_reasoning.judgement_basis` **不允许空**（规则判定写规则 id；LLM 判定写自然语言）。  
3. 增强遥测（CDP Network / Performance / heap）默认关；嫌疑步才开——见 [signals-and-telemetry.md](./signals-and-telemetry.md)。

---

## 4. Finding 模型

在现有 `Finding`（`fail_hard | suspect` + evidence.repro[]）上对齐 v1.1，供人审与后续固化。

```json
{
  "id": "F-2026-0918-001",
  "title": "检索提交后列表区持续空白且无诚实空态文案",
  "category": "functional | visual | performance | network | a11y | honesty_violation",
  "severity": "P0 | P1 | P2 | P3",
  "oracle_level": "O1 | O2 | O3",
  "confidence": 0.9,
  "severity_mvp": "fail_hard | suspect",
  "evidence_chain": [3, 4],
  "evidence": {
    "steps": [3, 4],
    "screenshots": ["step-003.png", "step-004.png"],
    "logs": ["console: ..."],
    "repro": ["goto http://localhost:5182/", "fill 查询 …", "click 检索"]
  },
  "repro_script": "tools/e2e-hunt/repro/F-2026-0918-001.spec.ts",
  "root_cause": {
    "component": "可选",
    "code_location": "可选",
    "attribution_chain": "症状 → 机制 → 代码（人审补）"
  },
  "status": "new | triaged | approved | fixing | verifying | resolved | dismissed"
}
```

| 字段 | Phase 0′ | 说明 |
|------|----------|------|
| `severity_mvp` / evidence.* | **必填** | 与现 reporter 对齐 |
| `severity` P0–P3 | 人审填写或映射 | P0=挡演示/数据错；P3=观感 |
| `oracle_level` | O1 自动；O3 后人审标 | O3 **不可跳过人审** |
| **`repro_script`** | **可先手写** | 批准后理想自动固化；0′ 允许 Owner 手写 Playwright 窄脚本 |
| `root_cause` | 可选 | L5 延后前由人补 |

**严重度映射（MVP → 人读）**

| MVP | 人读建议 | 挡合并？ |
|-----|----------|----------|
| fail_hard 且挡演示 | P0 | 仅当**人升格**为 L0/L1 或明示拦 PR |
| fail_hard / 高置信 suspect | P1 | 否（Hunt 默认） |
| 低置信 suspect | P2–P3 | 否 |

---

## 5. 噪声预算 / 积压熔断（1 审批者缩放）

v1.1 假设可增派审批者；**本仓原型默认 1 人审**，阈值下探：

| 参数 | v1.1 建议 | **本仓 Phase 0′/1′** | 行为 |
|------|-----------|----------------------|------|
| 单人日审批容量 | 10 | **6** | 超则告警「先审再探」 |
| 待审积压熔断线 | 15 | **8 即提醒 / 暂停 nightly 探索** | 推送：清积压后再跑 Hunt |
| 单轮 O3 产出上限 | 5 | **3** | 超出进冷存储（markdown 附录） |
| P0 审批 SLA | 4h | **同日** | 原型节奏 |
| P1 审批 SLA | 24h | **48h** | — |
| 积压 >5 天 | 冷存 P3 | **冷存 P2/P3** | 只留 P0/P1 在队列 |
| 有效发现率 <30% 连续两轮 | 降频 | **同**：nightly → 每周 2 次 + 回调 Oracle/白名单 |

**有效发现率** = 人批准（真问题）/ 总 Finding 产出。低于 50% 先收紧 O1/白名单，不加深探索。

---

## 6. 样机白名单（不记缺陷）

下列**默认不记缺陷**（实现：`tools/e2e-hunt/src/rules.ts`；文档：[signals-and-telemetry.md](./signals-and-telemetry.md) §4）。Adapter 可追加，**禁止**从白名单删「样机诚实」类 token 而不走人审。

| 类 | 例 | 说明 |
|----|-----|------|
| 诚实横幅 / 文案 | 「样机」「演示」「mock」「非法律意见」「无真」「示意」 | 含 token → whitelist |
| API 标记 | `backend: 'mock'` | 检索未接旗标或显式 mock |
| **策略 A toast** | 跨口工作篮「种子共享 / 诚实提示」类 toast | P5 已落地的预期行为 ≠ bug |
| **SKU / Beta 空态** | Assist/Beta「非采购闭环」、ops 无真监控、占位空表 | 诚实空态 |
| **OIDC / SSO 未接入** | IAM 薄壳跳过、无真登录 | 样机登录策略 |
| 网络噪音 | `favicon.ico`、chrome-extension | request 白名单 |
| 冻结范围 | 真 GPU / 真 SFT / 真 ES 全球库缺失 | **产品决策冻结**，不报「没接真训练」 |

**反例（要记）**：声称「已写入真库」却只 toast；关键路径 pageerror；非白名单 5xx；检查点崩溃且无诚实文案。

---

## 7. Phase 0′ / 1′ / 2′ 落地路线（贴仓 · 缩短周期）

相对 v1.1 的 Phase 0–2，本仓已有 L0 + Hunt MVP，故改为 **′ 波**，周期压缩；**跳过 L5 自动修**。

| 阶段 | 周期（建议） | 范围 | 出口标准 |
|------|--------------|------|----------|
| **Phase 0′** 巩固 POC | **3–5 天** | 保持 L0 绿；Hunt `CP-search-smoke` 稳定；Evidence 本地 artifacts；补齐 Finding/`agent_reasoning` 契约说明；**手写** 1 条 repro 样例亦可；白名单演练；噪声预算数字写进本篇 | `hunt:search-smoke` 可重复产出 report；L0 全绿；白名单不误杀；故障注入勾选（search 壳已有）能打出 finding |
| **Phase 1′** 分析闭环 | **1–2 周** | +CasePack 2–3 条（见 §8）；指纹聚类；人审清单（md 队列即可）；积压≥8 提醒；O3 上限 3；视觉基线**不做**（或单壳固定 viewport 试验另案） | 聚类后独立 Finding 收敛；有效发现率可统计；熔断规则口头/脚本演练一次 |
| **Phase 2′** 复现固化（无 L5） | **1–2 周** | 批准 Finding → **repro_script 固化**（可半自动：从 `evidence.repro` 生成 stub）；V1=重跑脚本；稳定 P0 **回写窄 L1**（可选）；L7 留痕落地 | 批准项有可重跑脚本；L0 仍为唯一合并门；**无**编码 Agent 开修 PR |

**明确移出本路线**：L5 队列化修复 Agent、S3 证据湖、完整视觉/性能基线、覆盖率矩阵、PR 内嵌探索门禁。

---

## 8. 本仓验证剧本（立刻可跑）

### 8.1 现在

```bash
# 轨道 A · CI 绿灯
npm run test:e2e

# 轨道 B · Hunt MVP（需 search 壳 :5182）
npm run dev:search          # 另终端
npm run hunt:search-smoke
# 产物：tools/e2e-hunt/artifacts/<runId>/report.json|md + step-*.png
```

验收：L0 绿；Hunt report 含逐步证据；样机横幅/mock **无** fail_hard。

### 8.2 建议下一批 CasePack

| ID | 壳 | 目标 | 备注 |
|----|-----|------|------|
| `CP-search-smoke` | search:5182 | 关键词→列表→DetailDrawer | **已有** |
| `CP-fto-five` | fto:5183 | 五步走到报告页（不要求真引擎） | **已接线** |
| `CP-basket-strategy-a` | search→fto/mining | 工作篮策略 A：共享种子 + 诚实 toast 可见 | **已接线**；toast **白名单**；验链路可点非真跨口 LS |
| `CP-search-api-flag` / `CP-search-api-fallback` | search:5182 ± api:5190 | 旗标 sqlite-fts / 宕机回退 mock | **已接线**（A/B） |
| **`CP-agent-hitl`** | agent:5175 | 进入办理 → HITL ConfirmBar 可见 | **已接线** · `hunt:agent-hitl` · 深链 `sess-oa-1?focus=hitl` |
| **`CP-figure-dual`** | figure:5187 | 上下文 → mock 生成 → 画布编辑双闭环 | **已接线** · `hunt:figure-dual` · 样机级 |

**现状**：§8.2 原优先序（fto → basket → search-api）与 agent/figure 尾巴均已接线。Hunt **不挡合并**；**不开 L5**。下一批可继续扩壳 / 规则短路 vs LLM，仍不要求真引擎。

---

## 9. 度量与风险（裁剪）

### 9.1 度量（原型够用即止）

| 指标 | 目标（本仓） |
|------|----------------|
| L0 绿 | 合并前门禁 100% |
| 有效发现率 | ≥50%（人批准/总 Finding） |
| 审批积压 | **< 8**；超则停探索 |
| Hunt 失控率 | 触发 maxSteps/loop/stall 的轮次 <10%（早期宽松） |
| MTTR（批准→有人修复合入） | 人工节奏；**不**用 Agent MTTR |
| 单 Finding 成本 | 暂人工估；不强制 token 账 |

砍掉（本阶段不追）：自动化修复采纳率、完整故障注入 ≥90% 季度门、回归逃逸率 50% 降幅。

### 9.2 风险（贴仓）

| 风险 | 缓解 |
|------|------|
| 误报 / 审批疲劳 | 白名单 + 积压 8 熔断 + O3 上限 3 |
| 把诚实空态当 bug | §6 白名单；误报回写 rules |
| Hunt 代替 L0 | vs-l0-l1 纪律；CI 只跑 Playwright L0 |
| Agent 失控 | 已有 maxSteps / stall / fingerprint；L7 补 reasoning |
| 环境不确定 | 种子壳 + 探活（dev 起端口）；无种子不启轨道 B 扩跑 |
| L5 诱惑 | **本版不做**；修产品走本地 Owner + 人审 |
| 真 GPU/SFT 范围蔓延 | P 波已冻；Finding 分类禁报「未接真训」 |

---

## 10. 明确不做清单

| 不做 | 原因 |
|------|------|
| **L5 自动修复 Agent / Cloud Agent 改产品** | 硬约束；仅本地 Owner |
| Hunt 报告单独挡合并 | 人审升格除外 |
| 全壳全量 LLM 扫 | 成本与噪声；CasePack 限域 |
| 默认开 heap / 全量 CDP | 增强档按需 |
| S3 / 对象存储证据湖（Phase 0′） | 本地 `artifacts/` 足够 |
| 完整视觉回归基线体系 | 与闭环主线解耦；另案 |
| 真 GPU / 真 SFT / 真 ES 全球库 / N4 case-core | 已冻结或另立项 |
| 用 Hunt 绿代替 L0 绿 | 双轨纪律 |
| 通用 Rule 写死某一产品 CSS | 选择器只进 Adapter |
| 断言变更不经人审 | 原则 1 |

---

## 11. 文档与代码索引

| 资源 | 路径 |
|------|------|
| 本方案（完善版闭环） | `docs/architecture/e2e-hunt/AGENTIC_CLOSED_LOOP.md` |
| 包 README | [README.md](./README.md) |
| 架构 / 环 / 契约 / 信号 | architecture · agent-loop · report-contract · signals-and-telemetry |
| vs L0/L1 | [vs-l0-l1.md](./vs-l0-l1.md) |
| Adapter / CasePack | [ip-harness-adapter.md](./ip-harness-adapter.md) |
| MVP 任务单 | [MVP.md](./MVP.md) |
| 实现 | `tools/e2e-hunt/` |
| L0 尺子 | `e2e/REVIEW_RUBRIC.md` |

**修订记录**：v1.2 · 2026-09-18 · 合并仓内 e2e-hunt 与用户 Agentic v1.1；裁 L5；噪声预算按 1 审批者缩放；证据本地化。
