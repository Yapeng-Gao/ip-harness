import { useState } from 'react'
import { Button, Card, ConfirmDialog, EmptyState, PageHeader, StatusPill } from '../components/ui'
import { useAiInfra } from '../state/AiInfraStore'
import { MODEL_STAGE_LABEL, MODEL_STAGE_TONE, STAGE_ORDER } from '../state/types'

export function ModelsPage() {
  const { state, registerModel, addRevision, promoteRevision } = useAiInfra()
  const [newName, setNewName] = useState('')
  const [revDraft, setRevDraft] = useState<Record<string, string>>({})
  const [confirm, setConfirm] = useState<{
    modelId: string
    revisionId: string
    label: string
    from: string
    to: string
  } | null>(null)

  return (
    <div>
      <PageHeader
        eyebrow="模型注册"
        title="版本 / 晋级"
        desc="注册与加 revision 立即进内存。晋级需 Confirm 门禁（registered→staging→canary→prod）。非办案 HITL。"
      />

      <Card className="mb-4">
        <p className="text-sm font-medium text-slate-900">注册模型</p>
        <form
          className="mt-2 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            registerModel(newName)
            setNewName('')
          }}
        >
          <input
            id="ai-register-model"
            className="min-w-[12rem] flex-1 rounded-md border border-slate-200 px-2 py-1.5 text-sm focus-ring"
            placeholder="模型名"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button type="submit">注册</Button>
        </form>
      </Card>

      {state.models.map((fam) => (
        <Card key={fam.id} className="mb-4">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-medium text-slate-900">{fam.name}</p>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                addRevision(fam.id, revDraft[fam.id] ?? '')
                setRevDraft((d) => ({ ...d, [fam.id]: '' }))
              }}
            >
              <input
                className="w-28 rounded-md border border-slate-200 px-2 py-1 text-xs focus-ring"
                placeholder="新版本号"
                value={revDraft[fam.id] ?? ''}
                onChange={(e) => setRevDraft((d) => ({ ...d, [fam.id]: e.target.value }))}
              />
              <Button type="submit" variant="secondary">
                加 revision
              </Button>
            </form>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs text-slate-500">
                <tr>
                  <th className="py-2 pr-3 font-medium">版本</th>
                  <th className="py-2 pr-3 font-medium">阶段</th>
                  <th className="py-2 font-medium">动作</th>
                </tr>
              </thead>
              <tbody>
                {fam.revisions.map((v) => {
                  const idx = STAGE_ORDER.indexOf(v.stage)
                  const canPromote = idx >= 0 && idx < STAGE_ORDER.length - 1
                  const next = canPromote ? STAGE_ORDER[idx + 1]! : null
                  return (
                    <tr key={v.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 pr-3 font-mono text-xs text-slate-800">{v.version}</td>
                      <td className="py-2 pr-3">
                        <StatusPill tone={MODEL_STAGE_TONE[v.stage]}>
                          {MODEL_STAGE_LABEL[v.stage]}
                        </StatusPill>
                      </td>
                      <td className="py-2">
                        {canPromote && next ? (
                          <Button
                            variant="secondary"
                            onClick={() =>
                              setConfirm({
                                modelId: fam.id,
                                revisionId: v.id,
                                label: `${fam.name} ${v.version}`,
                                from: MODEL_STAGE_LABEL[v.stage],
                                to: MODEL_STAGE_LABEL[next],
                              })
                            }
                          >
                            晋级 → {MODEL_STAGE_LABEL[next]}
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-400">已是最高阶段</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ))}

      {state.models.length === 0 ? (
        <EmptyState
          title="无模型"
          body="先注册一个模型族。"
          action={
            <Button
              variant="secondary"
              onClick={() => document.getElementById('ai-register-model')?.focus()}
            >
              去注册模型
            </Button>
          }
        />
      ) : null}

      <ConfirmDialog
        open={!!confirm}
        title="确认晋级"
        body={
          confirm
            ? `将 ${confirm.label} 从「${confirm.from}」晋级到「${confirm.to}」。样机不写真权重仓、不切真流量。`
            : ''
        }
        confirmLabel="确认晋级"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm) promoteRevision(confirm.modelId, confirm.revisionId)
          setConfirm(null)
        }}
      />
    </div>
  )
}
