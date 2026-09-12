import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { navigateApp } from '../lib/deepLinks'
import { workbenchPathForStage } from '../data/workbenchMap'
import {
  ArrowRight,
  Link2,
  Radar,
  Lightbulb,
  X,
  Building2,
} from 'lucide-react'
import { INDUSTRY_CHAINS } from '../data/insight'
import { useApp } from '../context/AppContext'
import { InsightDataBanner } from '../components/InsightDataBanner'
import { PageHeader } from '../components/PageHeader'
import { InsightSisterNav } from '../components/InsightSisterNav'
import type { ChainNode } from '../types'

export function InsightChain() {
  const chain = INDUSTRY_CHAINS[0]
  const { addCase, bumpInsightDriven } = useApp()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<ChainNode | null>(null)

  const createMonitor = (node: ChainNode) => {
    const created = addCase({
      title: `${node.name}环节竞品监控（产业链）`,
      stage: 'monitoring',
      type: '发明',
      ownerTeam: '情报监控组',
      risk: '中',
      inventor: '—',
      summary: `由产业链全景「${chain.name}」·「${node.name}」生成监控案件。环节公开量示意 ${node.patents} 件。${node.blurb}`,
      fulfillmentMode: 'self_serve',
      agencyName: '—',
      fromInsight: true,
    })
    bumpInsightDriven()
    navigateApp(navigate, workbenchPathForStage('monitoring', created.id))
  }

  const createResearch = (node: ChainNode) => {
    const created = addCase({
      title: `${node.name}环节专利调研（产业链）`,
      stage: 'pre_research',
      type: '发明',
      ownerTeam: '专利策略组',
      risk: '中',
      inventor: '待指定',
      summary: `由产业链全景「${chain.name}」·「${node.name}」生成调研案件。主要玩家：${node.players.map((p) => p.name).join('、')}。${node.blurb}`,
      fulfillmentMode: 'self_serve',
      agencyName: '—',
      fromInsight: true,
    })
    bumpInsightDriven()
    navigateApp(navigate, workbenchPathForStage('pre_research', created.id))
  }

  return (
    <div className="relative p-6 lg:p-8">
      <PageHeader
        title="产业链全景"
        context="示意数据 · 材料 → 电芯 → 模组 → 整车/储能 · 点击节点生成监控或调研"
        primary={{
          label: '打开赛道洞察',
          to: '/insight/tracks',
          icon: <Radar className="h-4 w-4" aria-hidden />,
        }}
        secondary={{ label: '打开监控办理', to: '/workbench/watch' }}
      />

      <InsightSisterNav />
      <InsightDataBanner compact />

      <div className="mb-6 flat-card p-4">
        <div className="mb-1 text-xs text-slate-500">{chain.domain}</div>
        <h2 className="text-lg font-semibold text-slate-900">{chain.name}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{chain.summary}</p>
      </div>

      <div className="mb-6 overflow-x-auto flat-card p-4">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-800">
          <Link2 className="h-4 w-4 text-slate-700" />
          价值链（示意 · 可点击）
        </div>
        <div className="flex min-w-[720px] items-stretch gap-0">
          {chain.nodes.map((node, idx) => (
            <div key={node.id} className="flex flex-1 items-center">
              <button
                type="button"
                onClick={() => setSelected(node)}
                className={`card-hover flex w-full flex-col items-center rounded-xl border px-4 py-5 text-center transition-colors ${
                  selected?.id === node.id
                    ? 'border-slate-400 bg-slate-100 ring-2 ring-slate-200'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-200 hover:bg-white'
                }`}
              >
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-800 ring-1 ring-slate-200">
                  {idx + 1}
                </div>
                <div className="text-sm font-semibold text-slate-900">{node.name}</div>
                <div className="mt-2 inline-flex items-center rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-medium text-white">
                  {node.patents} 件公开
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  {node.players.length} 家示意玩家
                </div>
              </button>
              {idx < chain.nodes.length - 1 && (
                <div className="mx-1 flex shrink-0 items-center text-slate-300">
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* vertical compact view for small screens already covered by overflow; optional list */}
        <div className="mt-6 border-t border-slate-100 pt-4 lg:hidden">
          <div className="mb-2 text-xs text-slate-500">纵向简览</div>
          <ol className="space-y-2">
            {chain.nodes.map((node, idx) => (
              <li key={`v-${node.id}`}>
                <button
                  type="button"
                  onClick={() => setSelected(node)}
                  className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-800">
                    {idx + 1}
                  </span>
                  <span className="flex-1 font-medium text-slate-800">{node.name}</span>
                  <span className="text-xs text-slate-500">{node.patents} 件</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-xl">
          <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <div className="text-xs text-slate-500">产业链环节 · 示意数据</div>
              <h3 className="text-lg font-semibold text-slate-900">{selected.name}</h3>
              <p className="mt-1 text-xs text-slate-500">{selected.blurb}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <div className="mb-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span className="text-xs text-slate-600">环节公开量（示意）</span>
              <span className="text-sm font-semibold text-slate-800">
                {selected.patents} 件
              </span>
            </div>
            <h4 className="mb-3 flex items-center gap-1.5 text-sm font-medium text-slate-800">
              <Building2 className="h-4 w-4 text-slate-500" />
              主要玩家
            </h4>
            <ul className="space-y-2">
              {selected.players.map((p) => (
                <li
                  key={p.name}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5"
                >
                  <div>
                    <div className="text-sm text-slate-800">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.role}</div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                    {p.patents} 件
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2 border-t border-slate-200 p-5">
            <button
              type="button"
              onClick={() => createMonitor(selected)}
              className="btn-press focus-ring flex w-full items-center justify-center gap-1.5 cta-work rounded-md px-5 py-2.5 text-sm font-semibold"
            >
              <Radar className="h-4 w-4" />
              对该环节生成监控案件
            </button>
            <button
              type="button"
              onClick={() => createResearch(selected)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Lightbulb className="h-4 w-4" />
              对该环节生成调研案件
            </button>
          </div>
        </div>
      )}
      {selected && (
        <button
          type="button"
          aria-label="关闭侧栏"
          className="fixed inset-0 z-30 bg-slate-900/20"
          onClick={() => setSelected(null)}
        />
      )}
    </div>
  )
}
