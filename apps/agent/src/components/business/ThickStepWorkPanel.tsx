import { useMemo, useState } from 'react'
import type { StepfulKind, WorkbenchStepDef } from '../../business/workbenchSteps'

type Props = {
  kind: StepfulKind
  step: WorkbenchStepDef
  caseId: string
  onRecordNote?: (note: string) => void
  /** §109：中栏已渲染交底书/本稿纸面时只出本步控件，不重复正文墙 */
  embedMode?: 'full' | 'widgets-only'
}

/**
 * 交底/申请/答复 按步主栏可点零件 · 对齐一期节点交付物密度（演示）
 * 正文仍可读；拍板仍在右栏硬请示。
 */
export function ThickStepWorkPanel({
  kind,
  step,
  caseId,
  onRecordNote,
  embedMode = 'full',
}: Props) {
  const [picked, setPicked] = useState<string | null>(null)
  const [qc, setQc] = useState<Record<string, 'green' | 'yellow' | 'red'>>({})

  const mark = (id: string, label: string) => {
    setPicked(id)
    onRecordNote?.(`${kind.toUpperCase()}·${step.id} · ${label}`)
  }

  const qcItems = useMemo(() => {
    if (kind === 'd4' && step.id === 'qc') {
      return [
        { id: 'q1', label: '技术领域清楚', def: 'green' as const },
        { id: 'q2', label: '问题与方案对应', def: 'green' as const },
        { id: 'q3', label: '关键结构可画', def: 'green' as const },
        { id: 'q4', label: '效果有数据/依据', def: 'yellow' as const },
        { id: 'q5', label: '发明人可联系', def: 'green' as const },
      ]
    }
    if (kind === 'd5' && step.id === 'c-qc') {
      return [
        { id: 'c1', label: '权项与交底一致', def: 'green' as const },
        { id: 'c2', label: '说明书支撑权项', def: 'green' as const },
        { id: 'c3', label: '形式要件齐全', def: 'yellow' as const },
      ]
    }
    return []
  }, [kind, step.id])

  const statusOf = (id: string, def: 'green' | 'yellow' | 'red') => qc[id] ?? def

  const cycleQc = (id: string, def: 'green' | 'yellow' | 'red') => {
    const cur = statusOf(id, def)
    const next = cur === 'green' ? 'yellow' : cur === 'yellow' ? 'red' : 'green'
    setQc((prev) => ({ ...prev, [id]: next }))
    mark(id, `质检 ${id} → ${next}`)
  }

  const pill = (s: 'green' | 'yellow' | 'red') =>
    s === 'green'
      ? 'bg-emerald-600/15 text-emerald-800 border-emerald-200'
      : s === 'yellow'
        ? 'bg-amber-500/15 text-amber-900 border-amber-200'
        : 'bg-rose-600/15 text-rose-800 border-rose-200'

  const widgetsOnly = embedMode === 'widgets-only'
  const isEndGate =
    (kind === 'd4' && step.id === 'hand') ||
    (kind === 'd5' && (step.id === 'c-submit' || step.id === 'c-qc')) ||
    (kind === 'd6' && step.id === 'c')

  return (
    <div
      className="mt-2.5 space-y-2.5"
      data-testid="thick-step-work-panel"
      data-kind={kind}
      data-step={step.id}
      data-case={caseId}
      data-embed={embedMode}
    >
      {!widgetsOnly ? (
      <article
        className="rounded-xl border border-slate-200 bg-[#fbfaf7] p-3 shadow-sm"
        data-testid="thick-step-body-fold"
        data-doc-feel="1"
      >
        <p
          className="text-[10px] font-medium uppercase tracking-wide text-slate-400"
          data-testid="thick-step-body-summary"
        >
          本步交付物
        </p>
        <pre
          className="mt-1.5 max-h-[min(48vh,22rem)] overflow-auto text-[12px] leading-relaxed text-slate-800 whitespace-pre-wrap font-sans"
          data-testid="dept-output-body"
        >
          {step.mainBody}
        </pre>
      </article>
      ) : isEndGate ? (
        <p className="sr-only" data-testid="thick-step-body-summary">
          本稿已在上方纸面；本步仅薄结束卡
        </p>
      ) : null}

      {kind === 'd4' && step.id === 'draft' ? (
        <div className="rounded-xl border border-slate-200 bg-white p-3" data-testid="thick-d4-draft">
          <p className="text-[11px] font-semibold text-slate-800">成稿块（可点留痕）</p>
          <ul className="mt-2 space-y-1.5">
            {[
              ['field', '技术领域', '电机散热 / 水道与鳍片'],
              ['problem', '技术问题', '高功率密度温升偏高'],
              ['solution', '技术方案', '螺旋水道 + 端盖鳍片 + 双密封'],
            ].map(([id, k, v]) => (
              <li key={id}>
                <button
                  type="button"
                  className={`btn-press focus-ring w-full rounded-lg border px-3 py-2 text-left ${
                    picked === id ? 'border-violet-400 bg-violet-50' : 'border-slate-200 bg-slate-50/80'
                  }`}
                  data-testid={`thick-d4-block-${id}`}
                  onClick={() => mark(id, k)}
                >
                  <span className="text-[10px] font-medium text-slate-500">{k}</span>
                  <p className="text-[12px] text-slate-900">{v}</p>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[10px] text-slate-400">本步只写成稿 · 事实/质检/可交申请部分步打开。</p>
        </div>
      ) : null}

      {kind === 'd4' && step.id === 'fact' ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3" data-testid="thick-d4-fact">
          <p className="text-[11px] font-semibold text-amber-950">事实核对卡 · 拍板在右栏</p>
          <dl className="mt-2 grid grid-cols-[4.5rem_1fr] gap-x-2 gap-y-1.5 text-[12px]">
            <dt className="text-slate-500">领域</dt>
            <dd>电机散热</dd>
            <dt className="text-slate-500">要点</dt>
            <dd>螺旋水道、端盖鳍片、错位进出口、双密封</dd>
            <dt className="text-slate-500">效果</dt>
            <dd>样机温升约 −12℃（演示）</dd>
          </dl>
          <div className="mt-3 flex flex-wrap gap-2">
            {['事实属实', '需改一处', '退回重写'].map((l) => (
              <button
                key={l}
                type="button"
                className={`btn-press focus-ring rounded-full px-3 py-1 text-[11px] font-medium ${
                  picked === l ? 'bg-slate-900 text-white' : 'border border-amber-300 bg-white text-amber-950'
                }`}
                data-testid={`thick-d4-fact-${l}`}
                onClick={() => mark(l, l)}
              >
                {l}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-amber-900/70">主栏点选=示意留痕；正式拍板在右栏对话。</p>
        </div>
      ) : null}

      {qcItems.length > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-3" data-testid="thick-qc-board">
          <p className="text-[11px] font-semibold text-slate-800">质检分卡 · 未过优先</p>
          <ul className="mt-2 space-y-1.5">
            {qcItems
              .filter((item) => statusOf(item.id, item.def) !== 'green')
              .map((item) => {
              const st = statusOf(item.id, item.def)
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`btn-press focus-ring flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left ${pill(st)}`}
                    data-testid={`thick-qc-${item.id}`}
                    data-qc={st}
                    onClick={() => cycleQc(item.id, item.def)}
                  >
                    <span className="text-[12px] font-medium">{item.label}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wide">
                      {st === 'green' ? '绿' : st === 'yellow' ? '黄' : '红'}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          {qcItems.some((item) => statusOf(item.id, item.def) === 'green') ? (
            <details className="mt-2" data-testid="thick-qc-green-fold">
              <summary className="cursor-pointer select-none text-[10px] font-medium text-slate-500">
                已绿 {qcItems.filter((item) => statusOf(item.id, item.def) === 'green').length}（默折）
              </summary>
              <ul className="mt-1.5 space-y-1.5">
                {qcItems
                  .filter((item) => statusOf(item.id, item.def) === 'green')
                  .map((item) => {
                    const st = statusOf(item.id, item.def)
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          className={`btn-press focus-ring flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left ${pill(st)}`}
                          data-testid={`thick-qc-${item.id}`}
                          data-qc={st}
                          onClick={() => cycleQc(item.id, item.def)}
                        >
                          <span className="text-[12px] font-medium">{item.label}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wide">绿</span>
                        </button>
                      </li>
                    )
                  })}
              </ul>
            </details>
          ) : null}
          <p className="mt-2 text-[10px] text-slate-400">
            质检全绿 ≠ 已交下一站；未在右栏拍板不得开工单，也不得装已递交。
          </p>
        </div>
      ) : null}

      {kind === 'd4' && step.id === 'hand' ? (
        <div
          className="rounded-lg border border-emerald-200/80 bg-emerald-50/50 px-3 py-2"
          data-testid="thick-d4-hand"
          data-end-gate="thin"
        >
          <p className="text-[11px] font-semibold text-emerald-900">结束本站 · 可交申请部（薄卡）</p>
          <p className="mt-1 text-[11px] leading-snug text-slate-700">
            质检线过了 ≠ 已交申请部。拍「可交申请部」请看右栏对话。
          </p>
          <button
            type="button"
            className="btn-press focus-ring mt-2 rounded-full border border-emerald-300 bg-white px-2.5 py-0.5 text-[10px] font-medium text-emerald-900"
            data-testid="thick-d4-hand-ready"
            onClick={() => mark('hand-ready', '本站材料已齐 · 请在右栏拍板')}
          >
            记下：材料已齐
          </button>
        </div>
      ) : null}

      {kind === 'd5' && step.id === 'a' ? (
        <div className="rounded-xl border border-slate-200 bg-white p-3" data-testid="thick-d5-a">
          <p className="text-[11px] font-semibold text-slate-800">开案理解对照</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
              <p className="text-[10px] font-medium text-slate-500">交底主张</p>
              <p className="text-[12px] text-slate-900">水道+鳍片+双密封组合散热</p>
            </div>
            <div className="rounded-lg border border-violet-100 bg-violet-50/60 px-3 py-2">
              <p className="text-[10px] font-medium text-violet-700">申请部复述</p>
              <p className="text-[12px] text-slate-900">独权拟覆盖壳体水道、端盖鳍片与双密封</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {['理解正确', '差一处', '退回交底部'].map((l) => (
              <button
                key={l}
                type="button"
                className={`btn-press focus-ring rounded-full px-3 py-1 text-[11px] font-medium ${
                  picked === l ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white text-slate-700'
                }`}
                data-testid={`thick-d5-a-${l}`}
                onClick={() => mark(l, l)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {kind === 'd5' && step.id === 'b' ? (
        <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-3" data-testid="thick-d5-b">
          <p className="text-[11px] font-semibold text-violet-950">查新摘要 · 申不申</p>
          <p className="mt-1 text-[12px] text-slate-800">
            D1 公开螺旋水道；未披露端盖鳍片与双密封组合。建议发明；可缩「双密封+错位进出口」。
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {['申请', '不申结案', '改范围'].map((l) => (
              <button
                key={l}
                type="button"
                className={`btn-press focus-ring rounded-full px-3 py-1 text-[11px] font-medium ${
                  picked === l ? 'bg-slate-900 text-white' : 'border border-violet-300 bg-white text-violet-950'
                }`}
                data-testid={`thick-d5-b-${l}`}
                data-branch={l === '不申结案' ? 'b5' : undefined}
                onClick={() => mark(l, l)}
              >
                {l}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-slate-500">
            正式拍板在右栏 · 「不申」不得出申请号。
          </p>
        </div>
      ) : null}

      {kind === 'd5' && step.id === 'c-submit' ? (
        <div
          className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-3 py-2"
          data-testid="thick-d5-submit"
          data-end-gate="thin"
        >
          <p className="text-[11px] font-semibold text-slate-800">申请包齐套（示意 · 在本步工具内）</p>
          <ul className="mt-1.5 space-y-0.5 text-[11px] text-slate-600">
            <li>· 请求书</li>
            <li>· 说明书 / 权要 / 摘要</li>
            <li>· 附图图号核对</li>
          </ul>
          <p className="mt-2 text-[10px] text-slate-500">
            确认递交 / 暂缓请在右栏对话拍板 · 中栏不设交卷墙。
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {['记下：包已齐', '暂缓示意'].map((l) => (
              <button
                key={l}
                type="button"
                className={`btn-press focus-ring rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[10px] font-medium text-slate-700 ${
                  picked === l ? 'ring-1 ring-slate-400' : ''
                }`}
                data-testid={`thick-d5-submit-${l}`}
                onClick={() => mark(l, l)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {kind === 'd6' && step.id === 'a' ? (
        <div className="rounded-xl border border-slate-200 bg-white p-3" data-testid="thick-d6-a">
          <p className="text-[11px] font-semibold text-slate-800">争点中立卡</p>
          <div className="mt-2 space-y-2 text-[12px]">
            <div className="rounded-lg bg-rose-50/80 px-3 py-2 text-rose-950">
              审查：D1 公开水道；鳍片+水道组合显而易见
            </div>
            <div className="rounded-lg bg-sky-50/80 px-3 py-2 text-sky-950">
              本案拟主张：双密封+错位进出口 → 非显而易见效果
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {['争点准确', '差一处', '重拆'].map((l) => (
              <button
                key={l}
                type="button"
                className={`btn-press focus-ring rounded-full px-3 py-1 text-[11px] font-medium ${
                  picked === l ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white text-slate-700'
                }`}
                data-testid={`thick-d6-a-${l}`}
                onClick={() => mark(l, l)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {kind === 'd6' && step.id === 'b' ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3" data-testid="thick-d6-b">
          <p className="text-[11px] font-semibold text-amber-950">策略选项 · 重大缩限须你拍</p>
          <ul className="mt-2 space-y-2">
            {[
              { id: 'A', title: 'A · 争辩创造性', body: '少改权要' },
              { id: 'B', title: 'B · 补入双密封+错位', body: '重大缩限' },
            ].map((opt) => (
              <li key={opt.id}>
                <button
                  type="button"
                  className={`btn-press focus-ring w-full rounded-xl border px-3 py-2 text-left ${
                    picked === opt.id
                      ? 'border-amber-500 bg-white'
                      : 'border-amber-200 bg-white/80 hover:border-amber-300'
                  }`}
                  data-testid={`thick-d6-strat-${opt.id}`}
                  onClick={() => mark(opt.id, opt.title)}
                >
                  <p className="text-[12px] font-semibold text-slate-900">{opt.title}</p>
                  <p className="text-[11px] text-slate-600">{opt.body}</p>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[10px] text-amber-900/70">选后请到右栏完成硬请示。</p>
        </div>
      ) : null}

      {kind === 'd6' && step.id === 'c' ? (
        <div className="rounded-xl border border-slate-200 bg-white p-3" data-testid="thick-d6-c">
          <p className="text-[11px] font-semibold text-slate-800">答复稿块</p>
          <div className="mt-2 space-y-2">
            {['意见陈述', '修改说明', '权要对照'].map((l) => (
              <button
                key={l}
                type="button"
                className={`btn-press focus-ring w-full rounded-lg border px-3 py-2 text-left text-[12px] ${
                  picked === l ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50'
                }`}
                data-testid={`thick-d6-doc-${l}`}
                onClick={() => mark(l, l)}
              >
                {l}（演示可展开）
              </button>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-slate-400">本轮过线后，右栏再拍本轮递交 · 禁静默逾期见答复超期升级支路。</p>
        </div>
      ) : null}

      {picked ? (
        <p className="text-[11px] text-emerald-800" data-testid="thick-step-picked">
          已点选：{picked} · 示意留痕；硬请示以右栏为准。
        </p>
      ) : null}
    </div>
  )
}
