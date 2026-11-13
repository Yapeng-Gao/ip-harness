import { useMemo } from 'react'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import { isBusinessSeedCaseId } from '../../business/businessSeeds'
import {
  pickLobbyFocus,
  pipelineIndexFromStage,
  scriptedDraftLines,
} from '../../business/demoPace'
import { artifactPreviewLine } from '../../business/companyActivity'
import { useLineStream } from '../../business/useLineStream'
import { StagePipelineBar } from '../business/StagePipelineBar'

export function LobbyTaskBar() {
  const { cases, getProgress, getPendingConfirms } = useBusinessCases()
  const pending = getPendingConfirms()
  const focus = useMemo(() => {
    const rows = cases.map((c) => {
      const prog = getProgress(c.id)
      return {
        id: c.id,
        title: c.title,
        updatedAt: prog.updatedAt,
        seed: isBusinessSeedCaseId(c.id),
        pending: pending.some((item) => item.caseId === c.id),
        stageId: prog.stageId,
      }
    })
    return pickLobbyFocus(rows)
  }, [cases, getProgress, pending])

  return (
    <div data-testid="lobby-task-bar">
      <StagePipelineBar
        index={pipelineIndexFromStage(focus?.stageId ?? 'prepare', !!focus?.pending)}
        pending={!!focus?.pending}
        done={false}
        streaming={false}
        caption={
          focus
            ? `${focus.seed ? '演示 · ' : ''}${focus.title}`
            : '暂无在办事项'
        }
      />
    </div>
  )
}

export function LobbyDraftPane() {
  const { cases, getPendingConfirms } = useBusinessCases()
  const pending = getPendingConfirms()
  const source = useMemo(() => {
    const hit =
      pending.find((item) => !isBusinessSeedCaseId(item.caseId)) ?? pending[0]
    if (!hit) return ''
    const title = cases.find((c) => c.id === hit.caseId)?.title ?? '本案'
    return [`${title}`, hit.title, artifactPreviewLine(hit.resultPreview, 120), hit.summary]
      .filter(Boolean)
      .join('\n')
  }, [cases, pending])
  const lines = useMemo(() => scriptedDraftLines(source), [source])
  const stream = useLineStream(lines)

  return (
    <section
      className="rounded-[var(--radius-lg)] border border-slate-200 bg-white p-3 shadow-[var(--shadow-rest)]"
      data-testid="lobby-draft-pane"
      data-stream-complete={stream.complete ? '1' : '0'}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[12px] font-semibold text-slate-800">正在写</h2>
        <span className="text-[10px] text-slate-400">
          {stream.complete ? '这一段写完了' : '按行往下写'}
        </span>
      </div>
      <pre
        className="mt-2 max-h-36 overflow-auto whitespace-pre-wrap font-sans text-[12px] leading-relaxed text-slate-800"
        data-testid="lobby-draft-body"
      >
        {stream.text || '…'}
        {!stream.complete ? (
          <span className="ml-0.5 text-[#007aff]" aria-hidden>
            ▍
          </span>
        ) : null}
      </pre>
    </section>
  )
}
