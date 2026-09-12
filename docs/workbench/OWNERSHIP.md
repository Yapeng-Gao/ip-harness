# Workbench ownership (`apps/workbench` · :5174)

> Owner surface for multi-app workbench. Do **not** sync-copy from root `src/pages/workbench` blindly — the trees have diverged (AppLink, `@ip/domain`, local banners).

Updated: 2026-09-12

## Ownership table

| Surface | Role | Owned by |
|---------|------|----------|
| `apps/workbench/src/flows/*` | Canonical **implementation** (page/flow bodies) | `@ip/workbench` |
| `apps/workbench/src/stages/*` | Canonical **public module boundary** (`STAGE_MODULES` + re-export). `App.tsx` imports **only** from `./stages` | `@ip/workbench` |
| `apps/workbench/src/lib/deepLinks.ts` | Thin re-export of `@shared/lib/deepLinks` (`resolveAppHref` / `navigateApp`) | `@ip/workbench` (wrapper only) |
| Root `src/pages/workbench` | **Legacy** `npm run dev:legacy` only | **Not** owned by workbench app |
| Root `src/pages/InventorPortal.tsx` | Legacy / root tree | Separate from app `flows/inventor` |

## Rules

1. **Multi-app (:5174)** — edit only under `apps/workbench` (+ docs under `docs/workbench`). Prefer `AppLink` / `navigateApp` / `resolveAppHref`; no local `APP_DEV_URLS` forks in UI.
2. **Do not** re-export root `src/pages/workbench` into the app (would regress AppLink / `@ip/domain` / local Insight·Billing banners).
3. **Do not** treat root and app as interchangeable until an explicit audit unifies legacy.
4. **InventorPortal** — app path is `flows/inventor` (+ `stages/inventor`); root keeps its own `src/pages/InventorPortal.tsx`.
5. **Dual barrel** — public list lives in `stages/index.ts` only. `flows/index.ts` is internal/deprecated (no parallel export list).

## Out of scope until legacy audit

- Unifying or deleting root `src/pages/workbench`
- Sync-copying files from root into `apps/workbench` without a diff review
- Physical move of every flow body into `stages/<id>/` (optional later; stages may stay as boundary)

See also: [OWNER_STATUS.md](./OWNER_STATUS.md), [apps/workbench/README.md](../../apps/workbench/README.md).
