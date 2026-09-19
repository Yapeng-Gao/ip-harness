# Agent P2 轻量 · Home 通用副文 + pending_create

> **口**：`apps/agent/**` · 分支 `dev` · 2026-09-19（CST）  
> **不做**：项目线程↔sessions 合流 · 不恢复 amber 顶栏 · 不改 mid

## 1) Home 副文案 · 通用入口

| 面 | 改前 | 改后 |
|----|------|------|
| `AgentHome` 主副文 | 「专利检索 · OA · 交底 · 年费 · 确认后写入案件」 | **「先聊起来 · 案可选 · 确认后再写入」** |
| 次行 | 「主闭环优先 · 项目模式（次级）」 | **「可先开聊，不必先选案 · 项目模式（次级）」** |
| placeholder / 有案 hint | 固态电解质专利示例；「确认后写入案件」 | 通用目标示例；「有案 · 确认后再写入」 |

Catalog 领域 pills / Home「常用」专利快捷任务 **保留**（领域入口，不抢首页叙事）。

## 2) `pending_create` 死类型 → 短瞬真实态

- 类型仍：`CaseBindState = 'none' | 'bound' | 'pending_create'`（`types.ts` / `mockCase.ts`）
- `CaseBindControls.createAndBind`：点确认 → **`pending_create`**（按钮「创建中…」+ disabled）→ ~280ms 后 seed mock 案 → `onBind` → **`bound`**
- `ProjectWorkspacePage`：创建绑定时先 `patchProject({ caseBindState: 'pending_create' })`，再在控件回调落到 `bound`（与控件 loading 对齐）

## 验收

1. Home 副文无「专利检索 · OA · 交底 · 年费」抢戏句
2. 「创建并绑定」确认钮短瞬 loading / 禁用，再出现已绑案
