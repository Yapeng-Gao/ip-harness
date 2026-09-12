# @ip/app-state

Phase 2 shared **app state** package for IP Harness monorepo (not a microservice).

## Responsibility

- `AppProvider` / `useApp` — case / workspace / persona / handoff / command dispatch
- `AgentProvider` / `useAgents` — agent sessions / HITL / catalog-driven runs
- `ProductProvider` / `useProduct` — saas vs agent product surface (cross-app)
- `crossPortStore` — cookie / localStorage / BroadcastChannel / mid bridge snapshot sync

## Relationship to other packages

| Package | Owns |
| --- | --- |
| `@ip/contracts` | Command names, audit schema, ports, cross-port **keys** |
| `@ip/domain` | Domain types + executable guardrails / handoff / stage logic |
| `@ip/app-state` | React context + cross-port **runtime** store that *uses* those packages |

**Do not fork** `@ip/contracts` keys or command names. Seed data / UI chip helpers stay under root `src/data` and `src/utils` (imported via `@shared/*` until those packages exist).

## Compat

Root files remain full re-exports so existing `@shared/context/*` and `@shared/lib/crossPortStore` imports keep working:

```ts
import { AppProvider, useApp } from '@shared/context/AppContext'
import { useAgents } from '@ip/app-state'
```

## Not in this package

- UI components (Phase 3 `packages/ui`)
- Agent catalog seed (`src/data/agents`)
- Flow page components
