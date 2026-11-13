# @ip/contracts

Phase 0 shared contracts for IP Harness monorepo (not a microservice).

- Commands / `AUDIT_SCHEMA_VERSION` / `AuditEntry`
- `CaseContext` schemaVersion + snapshot types（含 `CaseContextAgentHint` tier/hitlGates）
- Handoff keys / labels / actions
- Domain event name constants
- Guardrail result types + pure merge helpers
- Dev app ports (`APP_PORTS` / `APP_DEV_URLS`)：五壳 + api，及并行样机壳（docHarness/aiInfra/aiData/search/fto/…/searchApi）；深链用此表，勿硬编码端口
- **Cross-port keys** (`crossPortKeys.ts`)：cookie / LS / BroadcastChannel / bridge message type

Executable `evaluateGuardrails` / `buildCaseContext` live in `@ip/domain` (Phase 1) and import schema constants from here.
