# Agent 平台 · 样机 ↔ 目标规格差距

> **冻结（2026-09-21）**：本轮 **只冻文档**；**样机未动**（`apps/agent` / 相关 packages **零改**）。  
> **业务壳**：[agent-business-mode](./agent-business-mode.md)（文档已开；样机另令）。  
> 目标规格：[../agent-platform.md](../agent-platform.md) · [../domain-packs/](../domain-packs/) · 壳 IA [agent-patent-shell](./agent-patent-shell.md)。  
> 用途：评审差距与下一刀前置条件；**不是**本轮实现清单。

---

## 1. 差距表

| 维度 | 当前样机（Vite） | 目标规格 | 差距等级 |
|------|------------------|----------|----------|
| 沙箱 | **无**；无 OpenSandbox/Cube | 一 Run 一沙箱；开发 OpenSandbox / 生产 Cube | **P0** |
| Engine Driver | **无**；无 lease/stream/pause | 双引擎 Driver + 预热池 | **P0** |
| Harness（dsh/Codex） | **无**真接线；剧本 mock | 沙箱内跑 harness；锁版本薄封装 | **P0** |
| Solo / Team / Domain runtime | 壳路由与 mock 互通 | 同一多 bot runtime；能力全 Tool 化 | P1 |
| Domain Pack 16 席 | Catalog ≈ 总控+主链+辅席（子集） | F1–F9 全矩阵；F7–F9 可 Phase | P1 |
| 规则层 validator | **无**代码裁判；Confirm 示意 | output_spec + Issue 自修复 | P1 |
| Handoff 信封 | 双文件 + DomainCommand 示意 | 运行时信封 + 审计链落中台 | P1 |
| HITL×8 | 部分闸（如 `go_nogo`）+ Confirm | Pack 八个收费审批点 + pause/resume | P1 |
| egress 断网/白名单 | **无** | 生成类断网 / 检索类白名单 | P2（依赖真沙箱） |
| 合规定位 / 假设验证 | 文档已指向 | 产品档位选定 + §14 P0 实测回填 | **P0（施工前）** |
| 端用户 mid 深链 | 已禁可点跳 mid 验收 | **继续禁止** | 纪律 · 已对齐 |
| L1/L2/L3 入口钉 | **双产品**：沙盒=L1；**业务=我的案子**（Catalog 降级） | Solo/Team/Domain 叠名不推翻 | **业务模式已钉** |

---

## 2. 本轮冻结声明

| 项 | 状态 |
|----|------|
| 架构正式稿（agent-platform · domain-packs） | **已冻** |
| product-apps 命名对齐补丁 | **已冻** |
| **样机（apps/agent 等）** | **未动** |
| packages（contracts/domain/…） | **未动** |

---

## 3. 建议下一刀顺序

```text
1. 文档评审通过（本轮产出）
2. 样机内 mock validator（仍无真沙箱：对双文件/产物做 schema 检查示意）
3. 真沙箱 + Driver POC（OpenSandbox 开发线；假设验证清单回填）
4. Pack 主链节点接线（查新→立项→交底→撰写…）；F7–F9 Phase
```

**前置条件（再动样机 / 平台代码前）**：

1. 合规定位档位书面选定（推荐机构合作版）。  
2. 假设验证清单 P0 有结果（见下表内联）。  
3. 总控确认：业务 7 席 + 专家台 Catalog 子集 ↔ 16 席目标态。  
4. B席硬拧已消：双产品冷启动、mining≠intake、FTO≠layout_insight。

### 3.1 施工前 P0 勾选（内联 · 勿只靠 incoming §14）

| # | 项 | 验收痕迹 |
|---|-----|----------|
| P0-1 | 沙箱启停 / 并发限额书面数 | 笔记或工单链接 |
| P0-2 | pause/resume（或等价挂起）可行性 | 结论：可/不可+替代 |
| P0-3 | dsh（或选定 harness）headless **锁版本** | 版本号钉死 |
| P0-4 | 期限/滞纳金表专家核对计划 | Owner+日期 |
| P0-5 | 合规定档（机构合作版等） | 一页决策 |
| P0-6 | Driver 接口草案评审（lease/stream/collect/release） | 纪要 |

---

## 4. 一句话

**文档已对齐 Pack 与 Solo/Team/Domain；样机仍是 Vite mock，无沙箱无 harness——下一刀先 mock validator，再真沙箱。样机本轮未动。**

## 5. Owner

规格：架构设计 · 样机刀：Agent应用助手（另开令）· 平台沙箱：另开平台刀
