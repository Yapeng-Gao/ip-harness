# Agent Pack HF（高保真可跑 · 2026-09-21 CST）

叠 `5823d7b` Pack v1：取消 F7–F9 空态死胡同；主链 HITL①–⑥ 可演示推进；Solo/Team 旁路保留。

禁 Cloud；仅 `apps/agent/**` + 本短记/截图。未改 mid/workbench/iam/packages。

## 落地

| 项 | 实现 |
|----|------|
| F7–F9 四席可跑 | 年费/价值/转化/维权 = 步骤条 + 剧本/快捷 + 双文件 + mock validator + Handoff；保留「后置业务」标签；⑦⑧ Pass→Confirm（样机内存） |
| HITL①–⑥ 演示 | Catalog / 项目工作区 `PackHitlWalkBar`：打开演示项目 · 按序推进 · 一键演示；每闸 validator 失败→自修复→Pass→HITL |
| 16 席+总控 | Catalog 16/16；单聊可推进；mining≠intake · FTO≠enforcement；中台映射无 mid 可点深链 |
| Solo / Team | `/agent/sandbox` · `/agent/team` 旁路未砸 |
| Demo 种子 | `proj-demo-patent` 含全 Catalog 席线程（含后置） |

## 5 分钟演示路径

1. 打开 `http://127.0.0.1:5175/agent`
2. 点 **一键演示①–⑥**（或「打开演示项目」→「按序推进」）→ 检索席可见 Pass/HITL 解锁
3. 任选主链席（如检索员）点 **产出→校验 → 自修复重跑**，见 Confirm
4. Catalog 点 **后置⑦年费** → 推进一步到缴费闸 → validator Pass → **付款解锁 Confirm**
5. 同样点 **后置⑧转化** 走到签约 Confirm；维权/价值席跑剧本+双文件
6. 顶栏旁路点 Solo `/agent/sandbox`、Team `/agent/team` 确认非残页

## 改动路径（摘要）

```
apps/agent/src/projects/expertsPatent.ts          # F7–F9 全剧本
apps/agent/src/projects/pack/patentValidator.ts   # 四席(+辅席) schema
apps/agent/src/projects/pack/patentHandoff.ts     # F7–F9 信封链
apps/agent/src/projects/pack/patentHitlWalk.ts    # ①–⑥ 演示序
apps/agent/src/components/patent/PackHitlWalkBar.tsx
apps/agent/src/components/patent/PackHitlOverview.tsx
apps/agent/src/pages/patent/PatentSeatPage.tsx    # 取消空态死胡同
apps/agent/src/pages/patent/PatentCatalogPage.tsx
apps/agent/src/projects/ProjectFolderContext.tsx  # 种子全 Catalog
docs/ui-polish/AGENT_PACK_HF.md
docs/ui-polish/agent-pack-hf/*.png
```

## 截图

`docs/ui-polish/agent-pack-hf/`

- `01` Catalog 16 席 + HITL×8 + 演示条
- `03–05` 年费可跑 · validator Fail→Pass→Confirm
- `06–08` 转化/维权/价值可跑
- `09–10` 一键演示①–⑥ · 检索席 HITL
- `11–12` Solo / Team
- `13` Catalog 后置席「单聊」非空态

## 自点（Asia/Shanghai · `:5175`）

- [x] F7–F9 非灰显死胡同；后置标签仍在；可跑完至 Confirm
- [x] 一键/按序推进 HITL①–⑥；validator 自修复可见
- [x] 16 席名单；FTO≠维权 · mining≠intake；无 mid 深链
- [x] Solo/Team 可达
- [x] `npm run typecheck -w @ip/agent` 通过
