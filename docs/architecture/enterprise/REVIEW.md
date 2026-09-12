# enterprise 架构评审记录（Agent 选型修订）

| 项 | 值 |
|----|-----|
| 评审角色 | 架构评审 |
| 对象 | Agent 选型修订：`agent-runtime-options.md`（新）+ `agent-platform.md` / `decision-matrix.md` / `README.md` / `agent-topology.md`（最小同步） |
| 相对 | 旧结论「C + LangGraph 库」（`2376eb6` / REVIEW `93db5af`）**作废为默认 ①**；本记录为**再评** |
| 工作区 | 评审时修订稿多为 **未提交**（`M` + 新文件 `??`）；总验请以推仓后 SHA 为准 |
| 日期 | 2026-09-12 |
| **结论** | **通过** |

## 尺子对照

| 尺子 | 结果 | 说明 |
|------|------|------|
| ①②③ 三层 +「开源≠业务质量」 | 过 | `agent-runtime-options` §0 硬结论；决策表业务质量列恒「否」；否决题 N8 |
| DSH + Codex 正式纳入 + 许可/私有化诚实 | 过 | DSH MIT + developer preview + 审计需再核；Codex Apache-2.0 代码 + **模型供应绑定**单列；公开仓可查 |
| 新推荐可落地 | 过 | 仍 C 混合；①=DSH 和/或 Codex；自有闸+DomainCommand；双轨 spike 后再锁主备；不阻塞 case-core MVP |
| Confirm ↔ approval 映射 | 过 | §2 表：框架暂停=①钩；ConfirmBar/`HitlGateId`/dispatch=②+写真相；`request_changes` 标明非 gate |
| LangGraph 降档清晰 | 过 | 可选 ② 子图/备选；官方 Server 仍不默认 |
| landing / contracts 可演进 | 过 | 不另起命令/事件；Agent 禁直改库维持 |
| 样机诚实 | 过 | Agent 今=UI+mock；修订说明要求再交评（不代评） |

## 专项：推荐默认是否仍站得住（修订后）

| 检查 | 结果 |
|------|------|
| 是否纠正「LangGraph = 业务能力」误读 | 是（三层 + 恒否质量列） |
| DSH/Codex 是否冒充已生产基线 | 否（preview / 供应风险写明） |
| 「和/或」双候选是否空喊 | 可接受：强制双轨 spike，未 spike 不写死唯一厂商 |
| 与旧 REVIEW 冲突处理 | 明确标注修订再评；本文件**取代**旧默认 ① 锁 |

**专项裁决：修订后的推荐站得住。** 旧「默认 ① = LangGraph 库」废止；LangGraph 仅 C′。

## 非阻塞建议

1. **先推仓**再总验（含新篇 + 更新 REVIEW）。
2. Codex 审批 RPC 公开面同时见 `item/permissions/requestApproval` 与 `item/commandExecution/requestApproval` 等——spike 钉死方法名；文已留「需再核」即可。
3. 父 `architecture/README` 已指向修订口径；确认与 enterprise README 同步推。

## 裁决

**通过。** 可总控总验（推仓后）。不要求为建议项重开全稿。
