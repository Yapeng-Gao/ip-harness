/**
 * 阶段模块边界聚合。业务实现仍在 flows/；本目录只做可独立依赖的 re-export + 清单。
 * 可执行领域逻辑来自 @ip/domain；handoff keys/labels 唯一源 @ip/contracts（禁止在 stage 内再定义）。
 */
import { ARTIFACT_FOR_STAGE } from '@ip/contracts'
import type { HandoffArtifactKey, StageId } from '@ip/contracts'

export { ResearchFlow } from './research'
export { IntakeFlow } from './intake'
export { DraftFlow } from './draft'
export { ProsecutionFlow } from './prosecution'
export { MaintainFlow } from './maintain'
export { MonetizeFlow } from './monetize'
export { WatchFlow } from './watch'
export { LayoutFlow } from './layout'
export { WorkbenchHome } from './home'
export { InventorPortal } from './inventor'

/** 与 FLOW_CATALOG 对齐的阶段模块清单（含 home / inventor 入口） */
export const STAGE_MODULES = [
  {
    id: 'research',
    flowKey: 'research',
    stageId: 'pre_research' as StageId,
    path: '/workbench/research',
    handoffKey: ARTIFACT_FOR_STAGE.pre_research as HandoffArtifactKey,
  },
  {
    id: 'intake',
    flowKey: 'intake',
    stageId: 'decision' as StageId,
    path: '/workbench/intake',
    handoffKey: ARTIFACT_FOR_STAGE.decision as HandoffArtifactKey,
  },
  {
    id: 'draft',
    flowKey: 'draft',
    stageId: 'drafting' as StageId,
    path: '/workbench/draft',
    handoffKey: ARTIFACT_FOR_STAGE.drafting as HandoffArtifactKey,
  },
  {
    id: 'prosecution',
    flowKey: 'prosecution',
    stageId: 'prosecution' as StageId,
    path: '/workbench/prosecution',
    handoffKey: ARTIFACT_FOR_STAGE.prosecution as HandoffArtifactKey,
  },
  {
    id: 'maintain',
    flowKey: 'maintain',
    stageId: 'maintenance' as StageId,
    path: '/workbench/maintain',
    handoffKey: ARTIFACT_FOR_STAGE.maintenance as HandoffArtifactKey,
  },
  {
    id: 'monetize',
    flowKey: 'monetize',
    stageId: 'commercialization' as StageId,
    path: '/workbench/monetize',
    handoffKey: ARTIFACT_FOR_STAGE.commercialization as HandoffArtifactKey,
  },
  {
    id: 'watch',
    flowKey: 'watch',
    stageId: 'monitoring' as StageId,
    path: '/workbench/watch',
    handoffKey: ARTIFACT_FOR_STAGE.monitoring as HandoffArtifactKey,
  },
  {
    id: 'layout',
    flowKey: 'layout',
    stageId: undefined,
    path: '/workbench/layout',
    handoffKey: 'layout_insight' as HandoffArtifactKey,
  },
  {
    id: 'home',
    flowKey: 'home',
    stageId: undefined,
    path: '/workbench',
    handoffKey: undefined,
  },
  {
    id: 'inventor',
    flowKey: 'inventor',
    stageId: undefined,
    path: '/inventor',
    handoffKey: 'disclosure_pack' as HandoffArtifactKey,
  },
] as const
