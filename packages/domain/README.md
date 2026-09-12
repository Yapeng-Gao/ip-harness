# @ip/domain

Phase 1 shared **domain** package for IP Harness monorepo (not a microservice).

## Responsibility

- **Domain types** (`PatentCase`, `AgentDef`, handoff checklists, etc.)
- **Executable domain logic**: `evaluateGuardrails`, `buildCaseContext`, handoff transitions (`canPerformHandoff`), persona hard gates, stage metadata, full-filing checks
- Re-exports command/audit surfaces from `@ip/contracts` (no second command-name table)

## Relationship to `@ip/contracts`

| Package | Owns |
| --- | --- |
| `@ip/contracts` | Command names, audit schema, CaseContext **schema** types, handoff **keys/labels**, guardrail **result types** + pure merge helpers, ports / cross-port keys |
| `@ip/domain` | Rich domain types + **executable** logic that *uses* those contracts |

**Do not fork**: never duplicate `COMMAND_*` names, audit schema versions, or handoff key enums here. Import from `@ip/contracts` and re-export when a shared barrel is convenient.

## Not in this package

- App state (`AppContext` / `AgentContext` / `crossPortStore`) — now `@ip/app-state` (Phase 2)
- UI components / CSS chip helpers (`handoffChipClass` in `@ip/ui`; root `src/data/handoff` re-exports)
- Persona **URL route** isolation (stays under root `src/data/persona`)
- Agent catalog seed data (`AGENT_CATALOG` stays under `src/data/agents`; pass via `buildCaseContext` extras)

## Imports

```ts
import { evaluateGuardrails, type PatentCase } from '@ip/domain'
// Compat (unchanged for apps):
import type { PatentCase } from '@shared/types'
import { evaluateGuardrails } from '@shared/domain/guardrails'
```
