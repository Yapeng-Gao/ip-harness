# Full-skills P2b 落地 · REPORT（FS-P2-7/8/9）

| 项 | 值 |
|----|-----|
| **日期** | 2026-09-18（Asia/Shanghai） |
| **权威** | `docs/ui-polish/REVIEW_FULL_SKILLS_DEEP_2026-09-18.md` §6 P2 短 backlog |
| **基线 HEAD** | `4ef165d`（`dev`） |
| **Skills** | apple-design · make-interfaces-feel-better · web-design-guidelines |
| **范围** | 仅视觉 / 文案 / CSS；未改 contracts / HITL / 业务门；跳过 **FS-ENV-1**；未启 Cloud Agent |
| **证据目录** | `docs/ui-polish/full-skills-p2b/` |

---

## 勾选表

| ID | 状态 | 改动摘要 | AFTER |
|----|------|----------|-------|
| **FS-P2-7** | [x] | ai-infra / ai-data / ops `EmptyState`：自绘 `border-dashed border-slate-300` → `.ui-empty` / `.ui-empty-title` / `.ui-empty-desc`（对齐 FS-P2-6 并行壳） | `AFTER-FS-P2-7-ai-infra-gpus.png` · `AFTER-FS-P2-7-ai-data-exports.png` · `AFTER-FS-P2-7-ops-infra.png` |
| **FS-P2-8** | [x] | search 侧栏：去掉 `` `/families/:id` `` 路由模板；改为产品文案「从结果进入同族」 | `AFTER-FS-P2-8-search-sidebar.png` |
| **FS-P2-9** | [x] | agent `AgentShell` `#agent-main`：保留 `outline-none`，补 `focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-accent)]`（对齐 mid skip-main）；mid 无独立 AgentShell 镜像，已有同模式 | `AFTER-FS-P2-9-agent-main-focus.png` |
| **FS-ENV-1** | [ ] 跳过 | mid 开发服偶发宕机（环境），按令跳过 | — |

### FS-P2-7 已迁文件

| 壳 | 文件 |
|----|------|
| ai-infra | `apps/ai-infra/src/components/ui.tsx` |
| ai-data | `apps/ai-data/src/components/ui.tsx` |
| ops | `apps/ops/src/components/ui.tsx` |

DOM 抽检：`:5179/gpus` · `:5181/exports` · `:5176/infra` 根节点 class=`ui-empty`；legacy Tailwind dashed 命中 **0**。

---

## 可点 URL（本地 Vite）

| ID | URL |
|----|-----|
| FS-P2-7 | http://127.0.0.1:5179/gpus · http://127.0.0.1:5181/exports · http://127.0.0.1:5176/infra |
| FS-P2-8 | http://127.0.0.1:5182/ （宽屏侧栏底部文案） |
| FS-P2-9 | http://127.0.0.1:5175/agent （Skip「跳到主要内容」或 focus `#agent-main` 见 inset accent ring） |

---

## Typecheck

```text
npm run typecheck -w @ip/ai-data -w @ip/ai-infra -w @ip/ops \
  -w @ip/search -w @ip/agent
→ green (exit 0)
```

---

## Blockers

无。FS-ENV-1 按令跳过。无 Cloud Agent。

---

## 怎么验（抽检）

1. `:5179/gpus` · `:5181/exports` · `:5176/infra` — EmptyState DOM 为 `ui-empty`（白底 + token dashed），非 Tailwind `border-slate-300` 自绘盒。
2. `:5182/` 宽屏侧栏 — 「从结果进入同族」；无 `/families/:id` code。
3. `:5175/agent` — Tab/Skip 进 `#agent-main` 见 inset accent focus ring（非裸 `outline-none`）。
