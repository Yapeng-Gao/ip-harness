# 短复评 · REVIEW_AGENT_ENTRY_RECHECK

| 项 | 值 |
|----|-----|
| **评审方** | UI评估助手（只评不改 · 仅 docs/evidence） |
| **修点 HEAD** | `3fc2827`（`dev` · `fix(agent): close Agent entry P0/P1 gates…`）· **确认 ✓** |
| **对照** | `REVIEW_AGENT_ENTRY_2026-09-19.md`（基线 `ee34d63` · No-Go） |
| **自证** | `AGENT_ENTRY_FIX_EVIDENCE.md` · `agent-entry-evidence/fix-*.png` |
| **复测证据** | `docs/ui-polish/agent-entry-recheck/`（Playwright · 1440×900 · `:5175`） |
| **日期** | 2026-09-19（Asia/Shanghai） |
| **本单总评** | **Go**（点名 P0+P1 全 PASS） |

---

## 验收表

| ID | 裁决 | 证据一句 |
|----|------|----------|
| **P0-AE-1** 入口双「新建」同权 | **PASS** | Home 仅一枚 navy `cta-work`「开始办理」；侧栏无「+ 新建会话」主钮；「新建会话 / 项目（次级）」收进「更多」· `AFTER-01-home.png` · `AFTER-01c-home-more.png` |
| **P0-AE-2** Home Inbox vs 主区 | **PASS** | Home 侧栏 compact：无 `sess-*` 完整列表；「待确认 · 3」chip 深链 `/agent/sessions?filter=needs_human`（force 点击可达）· `AFTER-01-home.png` · `AFTER-02-sessions-filter.png` |
| **P1-AE-1** Home 绑案双 CTA | **PASS** | 无案 Home 可见「创建并绑定新案 / 绑定已有案」+「也可先开始办理，随后在会话顶栏…」引导 · `AFTER-01b-home-case-bind.png` |
| **P1-AE-2** ConfirmBar sticky/密度 | **PASS** | `sess-oa-1`：`agent-hitl-dock` `sticky bottom-0`；绑案顶带（y≈113）与底栏 Confirm 分带；禁用红字「请先选争点类型并填策略要点」保留 · `AFTER-03-session-confirm.png` |
| **P1-AE-3** 专利「须绑定」 | **PASS** | `proj-demo-patent` 无案条：「写回中台前须绑定」+ 说明；**无**「案件（可选）」软文；general 仍 soft「可选」· `AFTER-05-patent-bind.png` · `AFTER-04-general-bind.png` |

---

## 门禁

| 门 | 初评 | 复评 |
|----|------|------|
| P0-AE-1 / P0-AE-2 | 开 · No-Go | **关闭** |
| P1-AE-1 / P1-AE-2 / P1-AE-3 | 开 | **关闭** |
| **Verdict** | **No-Go** | **Go** |

**未做**：未改产品代码；未 git commit/push；未启 Cloud Agent。P2-AE-1–3 本波未复测，不挡 Go。

### 备注（不挡）

- Home「更多」打开时，底栏 `nav`「运行说明」曾拦截 chip 普通点击；chip `href` 与 `force` 点击均正确进 filter 列表（可达性小瑕，非 P0）。
- HITL 底栏仍含「批准策略 / 授权递交 / 退回」多钮，但主成功 CTA 禁用+红字原因清晰，且与绑案分带，符合本条验收核心。

---

*对照 `AGENT_ENTRY_FIX_EVIDENCE.md`；只评不改。*
