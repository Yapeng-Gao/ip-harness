# enterprise 架构评审记录（Agent 选型修订）

| 项 | 值 |
|----|-----|
| 评审角色 | 架构评审 |
| 对象 | Agent 选型修订：`agent-runtime-options.md`（新）+ `agent-platform.md` / `decision-matrix.md` / `README.md` / `agent-topology.md` |
| 正文 SHA | **`75ea490`**（prefer DSH/Codex over LangGraph default） |
| REVIEW 推仓 SHA | **`2a70d79`**（re-pass）；本文件为推仓后复验增补 |
| 相对 | 旧结论「C + LangGraph 库」（`2376eb6` / REVIEW `93db5af`）**作废为默认 ①** |
| 日期 | 2026-09-12 |
| **结论** | **通过**（推仓复验维持） |

## 尺子对照

| 尺子 | 结果 | 说明 |
|------|------|------|
| ①②③ 三层 +「开源≠业务质量」 | **过 · 诚实** | `agent-runtime-options` §0 硬结论；决策表质量列恒「否」；否决题 N8；README 一句话钉死 |
| DSH + Codex 纳入 + 许可/供应诚实 | 过 | DSH MIT + developer preview + 审计需再核；Codex Apache-2.0 代码 + 模型供应绑定单列 |
| 新推荐 C+DSH/Codex+自有闸 | **过 · 站得住** | ①=成熟 harness；②③自有；双轨 spike 后再锁主备；不阻塞 case-core MVP |
| Confirm ↔ approval | 过 | 框架暂停=①钩；ConfirmBar/`HitlGateId`/dispatch=写真相 |
| LangGraph 降档 | 过 | 仅可选 ② / C′；官方 Server 不默认 |
| landing / contracts / 禁直改库 | 过 | 不另起命令事件 |

## 专项复验（总控点名）

| 问 | 答 |
|----|-----|
| 相对旧 C+LangGraph，新推荐是否站得住？ | **是**。完整 harness（工具环/沙箱/审批暂停）更贴 ①；LangGraph 降为编排库角色正确。 |
| 三层「不保证业务质量」是否诚实？ | **是**。无假装上 DSH/Codex/LangGraph = OA/调研达标；质量归 ②闸 + ③工具/eval。 |

**专项裁决：站得住；三层诚实。**

## 非阻塞（维持）

1. DSH vs Codex 主备：双轨 spike 后再写死。
2. Codex 审批 RPC 方法名 spike 钉死（文已「需再核」）。
3. 工作区若有 README「再评通过」脚注一行未提交，可并入下刀，不重开全评。

## 裁决

**通过。** 可总控总验。
