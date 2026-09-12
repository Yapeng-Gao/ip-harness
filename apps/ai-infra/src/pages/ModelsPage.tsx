import { useState } from 'react'
import { Card, EmptyState, PageHeader, StatusPill, Toast } from '../components/ui'
import { MODEL_EMPTY, MODEL_FAMILIES } from '../data/mockModels'

export function ModelsPage() {
  const [toast, setToast] = useState<string | null>(null)

  function mockAction(kind: 'promote' | 'rollback', version: string) {
    setToast(
      kind === 'promote'
        ? `晋级 ${version} · 样机不写真权重仓`
        : `回滚 ${version} · 样机不切真流量`,
    )
    window.setTimeout(() => setToast(null), 2400)
  }

  return (
    <div>
      <PageHeader
        eyebrow="模型注册"
        title="版本 / 晋级 / 回滚"
        desc="注册表为内存行。晋级与回滚只弹诚实 Toast，不改网关、不改办案 handoff。"
      />

      {MODEL_FAMILIES.map((fam) => (
        <Card key={fam.id} className="mb-4">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <p className="text-sm font-medium text-slate-900">{fam.name}</p>
            <p className="text-xs text-slate-500">Owner {fam.owner}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs text-slate-500">
                <tr>
                  <th className="py-2 pr-3 font-medium">版本</th>
                  <th className="py-2 pr-3 font-medium">阶段</th>
                  <th className="py-2 pr-3 font-medium">指标</th>
                  <th className="py-2 pr-3 font-medium">日期</th>
                  <th className="py-2 font-medium">动作</th>
                </tr>
              </thead>
              <tbody>
                {fam.versions.map((v) => (
                  <tr key={v.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-3">
                      <p className="font-mono text-xs text-slate-800">{v.version}</p>
                      <p className="text-xs text-slate-500">{v.note}</p>
                    </td>
                    <td className="py-2 pr-3">
                      <StatusPill tone={v.tone}>{v.stage}</StatusPill>
                    </td>
                    <td className="py-2 pr-3 text-xs text-slate-600">{v.metrics}</td>
                    <td className="py-2 pr-3 tabular-nums text-xs text-slate-600">{v.created}</td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="btn-press rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                          onClick={() => mockAction('promote', v.version)}
                        >
                          晋级
                        </button>
                        <button
                          type="button"
                          className="btn-press rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                          onClick={() => mockAction('rollback', v.version)}
                        >
                          回滚
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ))}

      <EmptyState title={MODEL_EMPTY.title} body={MODEL_EMPTY.body} />
      {toast ? <Toast message={toast} /> : null}
    </div>
  )
}
