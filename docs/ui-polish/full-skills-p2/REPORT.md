# Full-skills P2 落地 · REPORT

| 项 | 值 |
|----|-----|
| **日期** | 2026-09-18（Asia/Shanghai） |
| **权威** | `docs/ui-polish/REVIEW_FULL_SKILLS_2026-09-18.md` §6 |
| **基线 HEAD** | `db14ec9` |
| **Skills** | apple-design · make-interfaces-feel-better · web-design-guidelines（无 apple-hig-full） |
| **范围** | 仅视觉 / 文案 / CSS；未改 contracts / HITL / 业务门；跳过 **FS-ENV-1**；未启 Cloud Agent |
| **证据目录** | `docs/ui-polish/full-skills-p2/` |

---

## 勾选表

| ID | 状态 | 改动摘要 | AFTER |
|----|------|----------|-------|
| **FS-P2-1** | [x] | ai-data `/datasets`：旁注「按钮 disabled」→「按钮已禁用」；PageHeader「发布 disabled」→「发布按钮已禁用」；草稿 textarea → `ui-input ui-input-sm`（accent soft ring） | `AFTER-FS-P2-1-datasets.png` · `AFTER-FS-P2-1-datasets-focus.png` · `AFTER-FS-P2-1-datasets-disabled.png` |
| **FS-P2-2** | [x] | ai-infra `/gpus` EmptyState + ai-data `/exports` 次空态「无案正文」补 `action` → `Link`「回总览」 | `AFTER-FS-P2-2-gpus.png` · `AFTER-FS-P2-2-exports.png` |
| **FS-P2-3** | [x] | doc-harness `.ProseMirror`：保留 `outline: none`，补 `:focus-visible` 纸面 focus frame（白边 + accent + soft ring） | `AFTER-FS-P2-3-prosemirror-focus.png` |
| **FS-P2-4** | [x] | agent + mid 镜像 `SessionComposer` / `AgentHome` textarea：去掉冗余 Tailwind `outline-none`，依赖 `.focus-ring`（mid Home 同步补上 `focus-ring`） | `AFTER-FS-P2-4-agent-home-focus.png` |
| **FS-P2-5** | [x] | search `/`「应用过滤并重跑」`disabled={!lastQuery\|\|running}` 旁注「请先检索」（running 时「检索进行中」） | `AFTER-FS-P2-5-search-filter.png` |
| **FS-P2-6** | [x] | 并行六壳 EmptyState 自绘 dashed → `.ui-empty` / `.ui-empty-title` / `.ui-empty-desc` | `AFTER-FS-P2-6-fto-empty.png` · `AFTER-FS-P2-6-figure-empty.png` · `AFTER-FS-P2-6-inspire-empty.png` |
| **FS-ENV-1** | [ ] 跳过 | mid 开发服偶发宕机（环境），非产品 FAIL | — |

### FS-P2-6 已迁壳

| 壳 | 文件 |
|----|------|
| search | `apps/search/src/components/ui.tsx` |
| fto | `apps/fto/src/components/ui.tsx` |
| mining | `apps/mining/src/components/ui.tsx` |
| inspire | `apps/inspire/src/components/ui.tsx` |
| landscape | `apps/landscape/src/components/ui.tsx` |
| figure | `apps/figure/src/components/ui.tsx` |

未迁（非并行六壳 / 本单范围外）：`ai-infra` · `ai-data` · `ops` EmptyState 仍自绘 dashed（与 FS-P2-2 只加 action 不冲突）。

---

## 可点 URL（本地 Vite）

| ID | URL |
|----|-----|
| FS-P2-1 | http://127.0.0.1:5181/datasets |
| FS-P2-2 | http://127.0.0.1:5179/gpus · http://127.0.0.1:5181/exports |
| FS-P2-3 | http://127.0.0.1:5178/ （Tab 进纸面） |
| FS-P2-4 | http://127.0.0.1:5175/ · mid http://127.0.0.1:5173/ |
| FS-P2-5 | http://127.0.0.1:5182/ （未检索时过滤区） |
| FS-P2-6 | 例：http://127.0.0.1:5183/hits · http://127.0.0.1:5187/versions · http://127.0.0.1:5185/favorites |

---

## Typecheck

```text
npm run typecheck -w @ip/ai-data -w @ip/ai-infra -w @ip/doc-harness \
  -w @ip/agent -w @ip/mid -w @ip/search -w @ip/fto -w @ip/mining \
  -w @ip/inspire -w @ip/landscape -w @ip/figure
→ green
```

---

## Blockers

无。FS-ENV-1 按令跳过。

---

## 怎么验（抽检）

1. `:5181/datasets` — 质量强制 fail 后旁注「按钮已禁用」；草稿 textarea Tab focus 见 accent soft ring。
2. `:5179/gpus` · `:5181/exports` — EmptyState 有「回总览」。
3. `:5178` — 纸面 `:focus-visible` 非裸剥。
4. `:5175` / mid Home — composer textarea 无 `outline-none` utility，仍有 `.focus-ring`。
5. `:5182` — 未检索时「应用过滤并重跑」旁「请先检索」。
6. 并行壳空态 — DOM 根节点 class 为 `ui-empty`。
