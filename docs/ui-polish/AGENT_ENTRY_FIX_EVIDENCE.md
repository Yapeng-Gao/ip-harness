# Agent 入口关闸自证 · 2026-09-19

| 项 | 值 |
|----|-----|
| **对照** | `docs/ui-polish/REVIEW_AGENT_ENTRY_2026-09-19.md` |
| **分支** | `dev` |
| **范围** | `apps/agent/**` + 本证据 docs |
| **typecheck** | `npm run typecheck -w @ip/agent` ✓ |
| **截图目录** | `docs/ui-polish/agent-entry-evidence/fix-*.png` |

## 闸门对照

| ID | 如何关 | 自证 |
|----|--------|------|
| **P0-AE-1** | Home 主区仅「开始办理」为 `cta-work` 主 CTA；侧栏去掉 navy「新建会话」；「新建会话 / 项目」收进「更多」并标次级；Home 侧栏仅文字链「项目模式（次级）」 | `fix-01-home-single-cta.png` · `fix-01c-home-more-menu.png` |
| **P0-AE-2** | Home 侧栏改为 compact：无完整 Inbox 列表；待确认以 chip 深链 `/agent/sessions?filter=needs_human`；列表页/侧栏同步 `?filter=` | `fix-01-home-single-cta.png` · `fix-02-sessions-filter-needs-human.png` |
| **P1-AE-1** | Home 无案时露出 `CaseBindControls`（创建并绑定 / 绑定已有）+ 发送后引导；无案开工 `state.focusCaseBind` → 会话顶栏绑案带 | `fix-01b-home-case-bind.png` · `fix-03-session-confirm-sticky.png`（顶栏绑案带） |
| **P1-AE-2** | `needs_human` 时绑案上移顶带；ConfirmBar + Composer 入 `agent-hitl-dock` sticky 底栏；禁用红字保留 | `fix-03-session-confirm-sticky.png` |
| **P1-AE-3** | `prominence=strong`（patent/domain）无案时文案「写回中台前须绑定」；general soft 仍「案件（可选）」 | `fix-05-patent-must-bind.png` |

## 口播（约 30s）

Home 现在只有一个开工主钮「开始办理」；侧栏不再和主区抢「新建」，项目和新建会话都进「更多」。待确认变成计数 chip，点进带 filter 的会话列表，首屏不再摊一整列 Inbox。无案可在 Home 直接创建/绑定，或办完后在会话顶栏绑。待确认时确认条粘在底栏，绑案在顶，不挤在一起；专利无案会写明写回中台前须绑定。

