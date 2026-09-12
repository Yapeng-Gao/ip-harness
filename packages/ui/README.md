# @ip/ui

Phase 3 shared **pure presentation** package for IP Harness monorepo (not a microservice).

## Responsibility

- Stateless chips / badges / progress / empty chrome that render from **props**
- Tailwind / CSS class helpers for those surfaces (e.g. `handoffChipClass`)
- Optional callback props (`onToggle`) are fine; **no** `useApp` / network / `localStorage` business side effects

## Relationship to other packages

| Package | Owns |
| --- | --- |
| `@ip/contracts` | Command names, audit schema, ports, cross-port keys |
| `@ip/domain` | Domain types + executable guardrails / handoff / stage logic |
| `@ip/app-state` | React context + cross-port runtime store |
| `@ip/ui` | Pure presentational React components |

**Avoid** depending on `@ip/app-state` (prevents UI → state cycles). Components that need workspace / cases should take props, or stay under root `src/components` until refactored.

## Compat

Root files remain full re-exports so existing `@shared/components/*` imports keep working:

```ts
import { HandoffChip } from '@shared/components/HandoffChip'
import { RiskBadge } from '@ip/ui'
```

## Not in this package

- Shells bound to context (`Sidebar`, `Layout`, `PersonaSwitcher`, `TenantBanner` until props-injected)
- `PageHeader` / `EmptyState` while they depend on `AppLink` multi-app routing
- Ops business pages / AppContext splits
