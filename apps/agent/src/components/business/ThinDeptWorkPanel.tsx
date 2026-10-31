import { useMemo, useState } from 'react'
import type { OrgDeptId } from '../../departments/orgDepts'
import { THIN_LINE_BY_DEPT } from '../../business/workbenchSteps'

type Props = {
  deptId: OrgDeptId
  caseId: string
  onRecordNote?: (note: string) => void
}

type StepId = 'entry' | 'work' | 'done'

const ENTRY_BY_DEPT: Partial<Record<OrgDeptId, string[]>> = {
  'dept-intake': ['方向一句话非空', '发明人/联系人可联系', '密级已标'],
  'dept-inspire': ['问题卡点已写', '技术领域粗分', '不要求已有交底'],
  'dept-mining': ['研发资料可挂', '创新方向一句话', '不假装已交④'],
  'dept-annuity': ['已有申请号/授权号（演示可旁路）', '期限日历非空', '缴费主体明确'],
  'dept-monetize': ['复盘时段已定', '可引用①～⑦摘要', '不代替情报官专报'],
}

/**
 * ①②③⑦⑧ 厚作业主栏 · 分步（进入检查→主作业→合格线）+ 可点零件
 * 对齐交互大纲 4.4.7 / 各部 §0 薄合格线；非真检索/官报。
 */
export function ThinDeptWorkPanel({ deptId, caseId, onRecordNote }: Props) {
  const meta = THIN_LINE_BY_DEPT[deptId]
  const [step, setStep] = useState<StepId>('entry')
  const [picked, setPicked] = useState<string | null>(null)
  const [detail, setDetail] = useState<string | null>(null)
  const entryItems = ENTRY_BY_DEPT[deptId] || ['材料可挂', '目标一句话', '不装已过线']
  const [checked, setChecked] = useState<Record<number, boolean>>({})

  const entryOk = useMemo(
    () => entryItems.every((_, i) => checked[i]),
    [checked, entryItems],
  )

  if (!meta) {
    return (
      <pre
        className="mt-3 max-h-[min(70vh,36rem)] overflow-auto rounded-md bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-700 whitespace-pre-wrap"
        data-testid="dept-thin-work-body"
      >
        薄部可进；主交付示意未挂时不堆假进度。硬请示仍在右栏。
      </pre>
    )
  }

  const mark = (id: string, label: string) => {
    setPicked(id)
    setDetail(label)
    onRecordNote?.(`${meta.workTitle} · 选了「${label}」（示意留痕，非硬请示）`)
  }

  const toggleCheck = (i: number) => {
    setChecked((prev) => ({ ...prev, [i]: !prev[i] }))
  }

  return (
    <div className="mt-3 space-y-3" data-testid="dept-thin-work-panel" data-dept={deptId} data-step={step}>
      <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          合格线
        </p>
        <p className="mt-0.5 text-[12px] text-slate-800">{meta.line}</p>
        <p className="mt-1 text-[11px] text-slate-500">{meta.ban}</p>
      </div>

      {/* 分步 pill · 对齐④⑤⑥ 按步减负 */}
      <div className="flex flex-wrap items-center gap-1.5" data-testid="thin-work-steps">
        {(
          [
            ['entry', '① 进入检查'],
            ['work', '② 主作业'],
            ['done', '③ 结束线'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setStep(id)}
            className={`btn-press focus-ring rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${
              step === id
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-600'
            }`}
            data-testid={`thin-step-${id}`}
          >
            {label}
          </button>
        ))}
      </div>

      <h3 className="text-[13px] font-semibold text-slate-900" data-testid="dept-thin-work-title">
        {meta.workTitle}
      </h3>

      {step === 'entry' ? (
        <div
          className="rounded-xl border border-sky-200 bg-sky-50/50 p-3"
          data-testid="thin-entry-checklist"
        >
          <p className="text-[11px] font-semibold text-sky-900">进入检查表（开干前）</p>
          <ul className="mt-2 space-y-1.5">
            {entryItems.map((label, i) => (
              <li key={label}>
                <label className="flex cursor-pointer items-start gap-2 text-[12px] text-slate-800">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={Boolean(checked[i])}
                    onChange={() => toggleCheck(i)}
                    data-testid={`thin-entry-check-${i}`}
                  />
                  <span>{label}</span>
                </label>
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={!entryOk}
            className="btn-press focus-ring mt-3 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white disabled:opacity-40"
            data-testid="thin-entry-go-work"
            onClick={() => {
              setStep('work')
              onRecordNote?.(`${meta.workTitle} · 进入检查已过（示意）`)
            }}
          >
            {entryOk ? '检查通过 · 开主作业' : '勾齐后再开干'}
          </button>
          <p className="mt-2 text-[10px] text-slate-400">
            大厅可点进 ≠ 已过进入检查 · 演示勾选，非真鉴权。
          </p>
        </div>
      ) : null}

      {step === 'work' ? (
        <>
          {deptId === 'dept-intake' ? (
            <div className="rounded-xl border border-slate-200 bg-white p-3" data-testid="thin-intake-card">
              <dl className="grid grid-cols-[5rem_1fr] gap-x-2 gap-y-1.5 text-[12px]">
                <dt className="text-slate-500">名称</dt>
                <dd className="font-medium text-slate-900">边缘散热结构改型</dd>
                <dt className="text-slate-500">方向</dt>
                <dd>螺旋水道+端盖鳍片+双密封，降高功率密度温升</dd>
                <dt className="text-slate-500">状态</dt>
                <dd>草案 · 待立项确认</dd>
                <dt className="text-slate-500">可引用</dt>
                <dd className="font-mono text-[11px]">PRJ-DEMO-{caseId.slice(-4) || '1042'}</dd>
              </dl>
              <div className="mt-3 flex flex-wrap gap-2">
                {['确认建项', '改方向', '搁置'].map((l) => (
                  <button
                    key={l}
                    type="button"
                    className={`btn-press focus-ring rounded-full px-3 py-1 text-[11px] font-medium ${
                      picked === l ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white text-slate-700'
                    }`}
                    data-testid={`thin-intake-act-${l}`}
                    onClick={() => mark(l, l)}
                  >
                    {l}
                  </button>
                ))}
              </div>
              {detail ? (
                <div
                  className="mt-3 rounded-lg border border-violet-100 bg-violet-50/60 px-3 py-2 text-[11px] text-slate-800"
                  data-testid="thin-work-detail"
                >
                  <p className="font-semibold text-violet-900">零件明细 · {detail}</p>
                  <p className="mt-0.5">
                    {detail === '确认建项'
                      ? '将写入项目卡状态=已立项；正式硬请示仍在右栏。'
                      : detail === '改方向'
                        ? '打开方向编辑（示意）· 改完须再确认。'
                        : '搁置：本案停在草案，不挡其他案。'}
                  </p>
                </div>
              ) : null}
              <p className="mt-2 text-[10px] text-slate-400">
                示意零件 · 正式立项硬请示仍在右栏；≠完整论证报告。
              </p>
            </div>
          ) : null}

          {deptId === 'dept-inspire' ? (
            <ul className="space-y-2" data-testid="thin-inspire-paths">
              {[
                { id: 'A', title: '路径 A · 改水道几何', body: '螺距/截面优化，结构改动中等', rec: false },
                { id: 'B', title: '路径 B · 端盖强化散热', body: '鳍片阵列，与密封干涉需核', rec: true },
                { id: 'C', title: '路径 C · 密封与流阻折中', body: '双密封+错位进出口', rec: false },
              ].map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => mark(p.id, p.title)}
                    className={`btn-press focus-ring w-full rounded-xl border px-3 py-2.5 text-left ${
                      picked === p.id
                        ? 'border-violet-400 bg-violet-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                    data-testid={`thin-inspire-path-${p.id}`}
                  >
                    <p className="flex items-center gap-2 text-[12px] font-semibold text-slate-900">
                      {p.title}
                      {p.rec ? (
                        <span className="rounded-full bg-violet-600/15 px-1.5 py-0.5 text-[9px] font-bold text-violet-800">
                          推荐
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-600">{p.body}</p>
                  </button>
                </li>
              ))}
              {detail ? (
                <li
                  className="rounded-lg border border-violet-100 bg-violet-50/60 px-3 py-2 text-[11px]"
                  data-testid="thin-work-detail"
                >
                  已选 {detail} · 可「选题收藏」或「跳过并留痕」闭环合格线。
                </li>
              ) : null}
              <li className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  className="btn-press focus-ring rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white"
                  data-testid="thin-inspire-save"
                  onClick={() => {
                    mark('save', '选题收藏')
                    setStep('done')
                  }}
                >
                  选题收藏
                </button>
                <button
                  type="button"
                  className="btn-press focus-ring rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] font-medium text-slate-700"
                  data-testid="thin-inspire-skip"
                  onClick={() => {
                    mark('skip', '跳过并留痕')
                    setStep('done')
                  }}
                >
                  跳过并留痕
                </button>
              </li>
            </ul>
          ) : null}

          {deptId === 'dept-mining' ? (
            <div data-testid="thin-mining-table">
              <table className="w-full border-collapse text-left text-[11px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-1.5 pr-2 font-medium">创新点</th>
                    <th className="py-1.5 pr-2 font-medium">可专利性</th>
                    <th className="py-1.5 font-medium">拆案</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['螺旋水道螺距与截面', '中', '可并案'],
                    ['端盖鳍片阵列', '中高', '主案'],
                    ['双密封+错位进出口', '高', '主案'],
                  ].map(([a, b, c]) => (
                    <tr
                      key={a}
                      className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                      onClick={() => mark(a, a)}
                      data-testid={`thin-mining-row-${a.slice(0, 4)}`}
                    >
                      <td className="py-2 pr-2 text-slate-800">{a}</td>
                      <td className="py-2 pr-2">{b}</td>
                      <td className="py-2">{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {detail ? (
                <div
                  className="mt-2 rounded-lg border border-violet-100 bg-violet-50/60 px-3 py-2 text-[11px]"
                  data-testid="thin-work-detail"
                >
                  点选「{detail}」· 可并入交④点包或仅留分析报告路径。
                </div>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {['确认点包交④', '只要分析报告', '改拆案'].map((l) => (
                  <button
                    key={l}
                    type="button"
                    className={`btn-press focus-ring rounded-full px-3 py-1 text-[11px] font-medium ${
                      picked === l ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white text-slate-700'
                    }`}
                    data-testid={`thin-mining-act-${l}`}
                    onClick={() => {
                      mark(l, l)
                      if (l !== '改拆案') setStep('done')
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-slate-400">不代替交底 / 申不申；不承诺可授权。</p>
            </div>
          ) : null}

          {deptId === 'dept-annuity' ? (
            <div data-testid="thin-annuity-ledger">
              <table className="w-full border-collapse text-left text-[11px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-1.5 font-medium">项</th>
                    <th className="py-1.5 font-medium">值</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['申请号', 'CN2026XXXXXX.X（演示）'],
                    ['下一年费', '2027-03-15 · ¥900'],
                    ['明白账', '官费 + 代理费分列（样机）'],
                  ].map(([k, v]) => (
                    <tr key={k} className="border-b border-slate-100">
                      <td className="py-2 text-slate-500">{k}</td>
                      <td className="py-2 font-medium text-slate-900">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 flex flex-wrap gap-2">
                {['确认缴费', '暂缓', '转⑧评估'].map((l) => (
                  <button
                    key={l}
                    type="button"
                    className={`btn-press focus-ring rounded-full px-3 py-1 text-[11px] font-medium ${
                      picked === l ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white text-slate-700'
                    }`}
                    data-testid={`thin-annuity-act-${l}`}
                    onClick={() => {
                      mark(l, l)
                      setStep('done')
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-slate-400">系统内提醒 ≠ 短信邮件已通 · 非官报。</p>
            </div>
          ) : null}

          {deptId === 'dept-monetize' ? (
            <div className="space-y-2" data-testid="thin-monetize-report">
              {[
                ['1 研发', '散热改型样机温升 -12℃'],
                ['2 专利', '交底全绿 1；申请在途 1'],
                ['3 系统', '部门工单④→⑤已跑通（演示）'],
                ['4 上下游', '供应商密封圈交期风险'],
                ['5 市场', '竞对到期窗口'],
              ].map(([k, v]) => (
                <button
                  key={k}
                  type="button"
                  className="btn-press focus-ring w-full rounded-lg border border-slate-100 bg-white px-3 py-2 text-left hover:border-slate-300"
                  onClick={() => mark(k, k)}
                  data-testid={`thin-monetize-block-${k.slice(0, 1)}`}
                >
                  <p className="text-[11px] font-semibold text-slate-700">{k}</p>
                  <p className="text-[12px] text-slate-800">{v}</p>
                </button>
              ))}
              {detail ? (
                <div
                  className="rounded-lg border border-violet-100 bg-violet-50/60 px-3 py-2 text-[11px]"
                  data-testid="thin-work-detail"
                >
                  展开「{detail}」明细（示意）· 正式专报走情报官 B8。
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2 pt-1">
                {['维持', '放弃', '只读不拍'].map((l) => (
                  <button
                    key={l}
                    type="button"
                    className={`btn-press focus-ring rounded-full px-3 py-1 text-[11px] font-medium ${
                      picked === l ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white text-slate-700'
                    }`}
                    data-testid={`thin-monetize-act-${l}`}
                    data-branch={l === '只读不拍' ? 'b7' : undefined}
                    onClick={() => {
                      mark(l, l)
                      setStep('done')
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400">
                B7：只读不拍不得回写⑦台账 · 复盘 ≠ 情报官专报。
              </p>
            </div>
          ) : null}

          {!['dept-intake', 'dept-inspire', 'dept-mining', 'dept-annuity', 'dept-monetize'].includes(
            deptId,
          ) ? (
            <pre
              className="max-h-[min(50vh,28rem)] overflow-auto rounded-md bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-700 whitespace-pre-wrap"
              data-testid="dept-thin-work-body"
            >
              {meta.workBody}
            </pre>
          ) : (
            <pre className="sr-only" data-testid="dept-thin-work-body">
              {meta.workBody}
            </pre>
          )}
        </>
      ) : null}

      {step === 'done' ? (
        <div
          className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-3"
          data-testid="thin-done-panel"
        >
          <p className="text-[11px] font-semibold text-emerald-900">结束合格线（示意）</p>
          <p className="mt-1 text-[12px] text-slate-800">{meta.line}</p>
          <p className="mt-1 text-[11px] text-slate-600">
            {picked ? `本轮点选：${picked}` : '尚未点选主作业零件；可回主作业补选。'}
          </p>
          <p className="mt-2 text-[10px] text-slate-500">
            开「现在做下一部」仍须本部门合格线 + 硬请示（右栏）；此处不装已交工单。
          </p>
          <button
            type="button"
            className="btn-press focus-ring mt-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] font-medium text-slate-700"
            data-testid="thin-back-work"
            onClick={() => setStep('work')}
          >
            回主作业
          </button>
        </div>
      ) : null}

      {picked && step === 'work' ? (
        <p className="text-[11px] text-emerald-800" data-testid="thin-work-picked">
          已点选：{picked} · 示意留痕；硬请示仍以右栏为准。
        </p>
      ) : null}
    </div>
  )
}
