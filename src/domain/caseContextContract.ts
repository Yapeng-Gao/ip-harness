/** Compat re-export — CaseContext builders in packages/domain */
export {
  CASE_CONTEXT_SCHEMA_VERSION,
  caseContextVersionLabel,
  caseContextVersionLabelMd,
  type CaseContextSchemaVersion,
  type CaseContextArtifactSnap,
  type CaseContextChecklistSummary,
  type CaseContextGateState,
  type CaseContextGateSnap,
  type CaseContextPersonaVisibility,
  type CaseContextAgentHint,
  type CaseContextSessionBind,
  type CaseContextSnapshot,
  type BuildCaseContextExtras,
  buildCaseContext,
  buildCaseContextFromSession,
  summarizeCaseContext,
} from '../../packages/domain/src/caseContextContract'
