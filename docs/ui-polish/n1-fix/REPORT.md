# N1 UI 质感 · 落地报告

| 项 | 值 |
|----|-----|
| **日期** | 2026-09-18（上海） |
| **基线 HEAD** | `e9cae49`（N1 Conditional Go 评审） |
| **技能** | apple-design · make-interfaces-feel-better · web-design-guidelines（未用 apple-hig-full） |
| **范围** | 视觉 / className / 文案 / 布局 only；未改 contracts / HITL / Persona / STEPS |
| **环境债** | **LS-ENV-1** landscape Vite 504 Outdated Optimize Dep — 仍记环境债，本波未追 |

---

## 按 ID 改动

| ID | 级 | 改动 | 路径 |
|----|-----|------|------|
| **IN-P0-1** | P0 | Prompt textarea 去掉 violet `outline-none` ring → `ui-input`（accent soft focus） | `apps/inspire/src/pages/PromptPage.tsx` |
| **N1-X-1** | P1 | 六壳共享 `Chip tone="mock"` violet → amber/slate（`#fffbeb` / `#78350f`，对齐 `shell-banner-demo`） | `apps/{search,fto,mining,inspire,landscape,figure}/src/components/ui.tsx` |
| **N1-X-2** | P1 | 顶栏/面板/送出页 raw `localhost:51xx` → 产品名（检索/挖掘/工作台/文档…）；URL 仅 `title`/`href` | 各 `*Shell.tsx` · `AgentPanel` · mining/inspire `SendPage` · figure `AttachPage` · ops `LogsPage` |
| **N1-X-3** | P1 | EmptyState 补 secondary CTA | search（idle/empty/saved/corpus）· landscape ingest · ops（logs/infra/alerts） |
| **OPS-P1-1/2** | P1 | 侧栏 `focus-ring`；输入 `ui-input` 替换 `outline-none`；EmptyState 支持 `action` | `OpsShell` · `AlertNotifyPanel` · `LogsPage` · `components/ui.tsx` |
| MN-P1-1 | P1 | 选中卡 violet wash → accent-soft | mining `SendPage` / `DisclosurePage` |
| IN-P1-2（选中） | P1 | inspire 送出选中 violet → accent-soft | inspire `SendPage` |
| LS-P1-1 | P1 | 热力柱 / 入库进度 violet → `--color-accent` | landscape `TreePage` / `IngestPage` |
| FTO/MN Beaker | P1 | Home Beaker violet → amber | fto/mining `HomePage` |
| SR-P1-2 | P1 | 空篮禁用旁注 Chip「请先加入工作篮」 | search `SearchPage` / `SavedPage` |
| Domain 灰钮 | 顺手 | 不可用旁注「另立项 · 非样机域」 | landscape `DomainPage` |

未追 P2（corpus `transition-all`、iam focus 等）。inspire Sparks 空态 CTA 基线已有，未再改。

---

## 截图（AFTER）

| 文件 | 验收点 |
|------|--------|
| `AFTER-inspire-prompt-focus.png` | IN-P0-1 accent focus |
| `AFTER-inspire-chip-mock.png` / `AFTER-figure-home-chip.png` | N1-X-1 mock amber |
| `AFTER-fto-labeled-links.png` / `AFTER-mining-labeled-links.png` / `AFTER-inspire-labeled-links.png` | N1-X-2 标签深链 |
| `AFTER-search-empty-cta.png` / `AFTER-search-saved-empty.png` | N1-X-3 CTA |
| `AFTER-landscape-ingest-empty.png` | ingest EmptyState CTA |
| `AFTER-ops-home.png` / `AFTER-ops-logs.png` | ops focus + EmptyState CTA |
| `AFTER-mining-send.png` | 送出禁用 Chip / 标签深链 |

实机校验（Playwright）：mock Chip `bg=rgb(255,251,235)` · Prompt focus `box-shadow rgba(0,122,255,0.18)`。

---

## 可点验收 URL

| 壳 | URL |
|----|-----|
| inspire Prompt | http://localhost:5185/ |
| search 空态 | http://localhost:5182/ |
| search 收藏 | http://localhost:5182/saved |
| fto 顶栏 | http://localhost:5183/ |
| mining 顶栏 / 送出 | http://localhost:5184/ · `/send` |
| landscape ingest | http://localhost:5186/ingest |
| figure | http://localhost:5187/ |
| ops 日志 / 配置通知 | http://localhost:5176/logs · `/config` |

---

## Typecheck

```
npm run typecheck -w @ip/inspire -w @ip/search -w @ip/fto -w @ip/mining -w @ip/landscape -w @ip/figure -w @ip/ops
→ exit 0
```

---

## Blockers / 债

- **LS-ENV-1**：landscape Vite 504（Outdated Optimize Dep）— 环境债；产品侧本波已改色/空态。处理：重启 `dev:landscape` / 清 Vite deps。
- Chrome headless 偶发 crash（截图重试时）— 不阻塞代码；证据以已落盘 AFTER 为准。
