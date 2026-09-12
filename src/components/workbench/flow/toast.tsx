import { AppLink } from '../../AppLink'
import { AlertCircle, Check } from 'lucide-react'
import type { StageId } from '../../../types'

export type ToastNextAction = { label: string; to: string }

/** Stage-aware Toast「下一步」chips — never mis-route (e.g. OA → 去立项). */
export function nextActionsForStage(stage: StageId, caseId: string): ToastNextAction[] {
  const back = { label: '回案件', to: `/cases/${caseId}` }
  const docket = { label: '去期限', to: `/docket?case=${caseId}` }
  switch (stage) {
    case 'pre_research':
      return [
        { label: '去立项', to: `/workbench/intake/${caseId}` },
        docket,
        back,
      ]
    case 'decision':
      return [
        { label: '去撰写', to: `/workbench/draft/${caseId}` },
        docket,
        back,
      ]
    case 'drafting':
      return [
        docket,
        back,
        { label: '去审查（需已递交）', to: `/workbench/prosecution/${caseId}` },
      ]
    case 'prosecution':
      return [
        docket,
        { label: '去维持', to: `/workbench/maintain/${caseId}` },
        back,
      ]
    case 'maintenance':
      return [docket, { label: '去费用', to: '/billing/cases' }, back]
    case 'commercialization':
      return [
        { label: '去监控', to: `/workbench/watch/${caseId}` },
        docket,
        back,
      ]
    case 'monitoring':
      return [
        docket,
        back,
        // 调研台入口（勿写死 c2；真正建案由 Watch「生成调研案」导航）
        { label: '去调研台', to: '/workbench/research' },
      ]
    default:
      return [docket, back]
  }
}


export function ToastBanner({
  message,
  error,
  nextActions,
}: {
  message: string | null
  error?: boolean
  /** Shown after success — e.g. 去立项 / 去期限 / 回案件 */
  nextActions?: ToastNextAction[]
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed right-6 top-6 z-50"
    >
      {message ? (
        <div
          className={`toast-enter ui-toast ${
            error ? 'ui-toast-error' : 'ui-toast-success'
          }`}
        >
          <div className="flex items-center gap-2">
            {error ? (
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <Check className="h-4 w-4 shrink-0" aria-hidden />
            )}
            <span>{message}</span>
          </div>
          {!error && nextActions && nextActions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pl-6">
              <span className="self-center text-xs font-medium text-emerald-900/70">下一步</span>
              {nextActions.map((a) => (
                <AppLink
                  key={a.to + a.label}
                  to={a.to}
                  className="btn-press inline-flex items-center rounded-lg border border-emerald-300 bg-white px-2.5 py-1 text-xs font-medium text-emerald-900 hover:bg-emerald-100 focus-ring"
                >
                  {a.label}
                </AppLink>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
