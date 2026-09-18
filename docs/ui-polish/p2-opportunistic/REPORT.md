# P2 Opportunistic UI Polish · 落地报告

| 项 | 值 |
|----|-----|
| **日期** | 2026-09-18（上海） |
| **基线 HEAD** | `b9d0994` → 落地 `fc8a2d2` |
| **技能** | apple-design · make-interfaces-feel-better · web-design-guidelines（未用 apple-hig-full） |
| **范围** | 仅 P-P2-1/2/3 className；未改 contracts / HITL / Persona / STEPS |
| **search 状态** | 动手前 `git status apps/search` **干净**，故一并修 CorpusPage（非「让检索服务先合」） |

---

## 按 ID 改动

| ID | 级 | 改动 | 路径 |
|----|-----|------|------|
| **P-P2-1** | P2 | composer textarea：保留 `outline-none` + 父 `focus-within`，补 `focus-ring` + `focus-visible:rounded-*`（accent soft ring） | `apps/agent/.../SessionComposer.tsx` · `AgentHome.tsx` · mid 镜像 `src/components/agent/session/SessionComposer.tsx` |
| **P-P2-2** | P2 | 进度条 `transition-all` → `transition-[width] duration-300 ease-out` | `apps/search/.../CorpusPage.tsx:151` · 根 `src/pages/DataStrategy.tsx` |
| **P-P2-3** | P2 | 主路径 `ui-btn*` / 回跳钮补 `focus-ring` | `apps/iam/.../IamHome.tsx` · `IamLoginPage.tsx` |

HITL：`hitlActive` / Confirm CTA / `agent-confirm-reason` **未动**。

---

## 截图（AFTER）

| 文件 | 验收点 |
|------|--------|
| `AFTER-agent-composer-focus.png` | Session / Home composer focus-visible accent ring |
| `AFTER-iam-home-focus.png` | IamHome 主钮 focus-ring |
| `AFTER-search-corpus-bar.png` | Corpus 进度条（代码侧已无 `transition-all`） |

---

## 怎么验

1. Agent `:5175` — Tab 进 Home / Session composer textarea，应见 accent `focus-visible` ring（父边框 focus-within 仍在）。
2. Search `:5182/corpus` — 进度条 class 为 `transition-[width]`（`rg transition-all apps/search/src/pages/CorpusPage.tsx` 应空）。
3. IAM `:5177` / `:5177/login` — Tab 主 CTA / 深链钮，应见 accent focus ring。
4. `npm run typecheck -w @ip/agent -w @ip/iam -w @ip/search` 绿。

## Blockers

无。
