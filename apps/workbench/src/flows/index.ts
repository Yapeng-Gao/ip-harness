/**
 * INTERNAL — do not import from here.
 * Public module boundary is `stages/` (STAGE_MODULES + re-exports).
 * App.tsx and consumers must import from `./stages`.
 * Implementation lives in flows/<id>/*; stages/<id> re-exports those files.
 * (Avoid re-exporting from stages here — that would cycle: stages → flows.)
 */
export {}
