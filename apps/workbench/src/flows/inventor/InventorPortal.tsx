import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AppLink } from '@shared/components/AppLink'
import {
  Send,
  Paperclip,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react'
import { useApp } from '@shared/context/AppContext'
import {
  evaluateGuardrails,
  firstGuardrailMessage,
  DISCLOSURE_PACK_CHECK_ITEMS,
  disclosurePackComplete,
} from '@ip/domain'
import { getAgent } from '@shared/data/agents'
import { useAgents } from '@shared/context/AgentContext'
import type { DisclosureStatus } from '@ip/domain/types'
import { PageHeader } from '@shared/components/PageHeader'
import { HandoffChip } from '@shared/components/HandoffChip'
import { HandoffActionBar } from '../../components/flow/HandoffActionBar'
import { HANDOFF_ARTIFACT_LABELS } from '@ip/contracts'
import { navigateApp } from '../../lib/deepLinks'

const FLOW: DisclosureStatus[] = [
  '草稿',
  '已提交',
  '部门审核',
  'IP受理',
  '已立案',
]

const STATUS_STYLE: Record<DisclosureStatus, string> = {
  草稿: 'bg-slate-100 text-slate-600',
  已提交: 'bg-sky-50 text-sky-700',
  部门审核: 'bg-amber-50 text-amber-800',
  IP受理: 'bg-slate-100 text-slate-800',
  已立案: 'bg-emerald-50 text-emerald-800',
  退回: 'bg-rose-50 text-rose-700',
}

export function InventorPortal() {
  const {
    disclosures,
    submitDisclosure,
    advanceDisclosure,
    workspace,
    role,
    persona,
    visibleCases,
    getCase,
    getDisclosurePackCheck,
    toggleDisclosurePackCheck,
  } = useApp()
  const { visibleSessions } = useAgents()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [toast, setToast] = useState<string | null>(null)
  const [toastLink, setToastLink] = useState<string | null>(null)
  const [toastActions, setToastActions] = useState<{ label: string; to?: string; onClick?: () => void }[] | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  /** Same login, explicit role chip for step actions */
  const [actingAs, setActingAs] = useState<'dept' | 'ip'>('dept')
  const [form, setForm] = useState({
    title: '',
    inventor: '',
    dept: '材料研究院',
    techTheme: '',
    patentType: '发明' as '发明' | '实用新型' | '外观',
    contact: '待填写',
    tech: '',
    riskDate: '',
    target: 'pre_research' as 'pre_research' | 'decision',
  })

  const depts = useMemo(
    () => ['材料研究院', '动力电池事业部', '智能驾驶中心', '电子工程部', '其他'],
    [],
  )

  const isEnterprise = workspace.kind === 'enterprise' || role === 'enterprise'

  const highlightKey = params.get('case') || params.get('pack')
  const [highlightPack, setHighlightPack] = useState<string | null>(null)

  const disclosurePacks = useMemo(() => {
    return visibleCases
      .map((c) => {
        const h = c.handoffs.disclosure_pack
        if (!h) return null
        const sess = visibleSessions.find(
          (s) => s.caseId === c.id && s.agentId === 'agent-disclosure',
        )
        const art = c.artifacts.filter(
          (a) =>
            a.type.includes('交底') ||
            a.type.includes('披露') ||
            a.name.includes('交底'),
        )
        const linkedDisclosure = disclosures.find((d) => d.caseId === c.id)
        return { case: c, handoff: h, sess, art, linkedDisclosure }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
  }, [visibleCases, visibleSessions, disclosures])

  useEffect(() => {
    if (!highlightKey) return
    setHighlightPack(highlightKey)
    if (disclosures.some((d) => d.id === highlightKey || d.caseId === highlightKey)) {
      setExpanded(highlightKey)
    }
    requestAnimationFrame(() => {
      document
        .getElementById(`disclosure-pack-${highlightKey}`)
        ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    })
  }, [highlightKey, disclosures])

  const flash = (
    msg: string,
    link?: string,
    actions?: { label: string; to?: string; onClick?: () => void }[],
  ) => {
    setToast(msg)
    setToastLink(link ?? null)
    setToastActions(actions ?? null)
    window.setTimeout(() => {
      setToast(null)
      setToastLink(null)
      setToastActions(null)
    }, 6000)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.inventor.trim()) {
      flash('请填写发明名称与发明人')
      return
    }
    const d = submitDisclosure({
      title: form.title.trim(),
      inventor: form.inventor.trim(),
      dept: form.dept,
      tech: form.tech,
      techTheme: form.techTheme.trim() || form.title.trim(),
      patentType: form.patentType,
      contact: form.contact.trim() || '待填写',
      riskDate: form.riskDate,
      targetStage: form.target,
    })
    setExpanded(d.id)
    setForm({
      title: '',
      inventor: '',
      dept: form.dept,
      techTheme: '',
      patentType: '发明',
      contact: '待填写',
      tech: '',
      riskDate: '',
      target: 'pre_research',
    })
    flash(
      `交底「${d.title}」已提交（${d.patentType ?? '发明'}）· 待结构化交底包，进入部门审核`,
      undefined,
      [
        { label: '查看状态', onClick: () => setExpanded(d.id) },
        { label: '去交底 Agent', to: '/agent/agents?agent=agent-disclosure' },
        { label: '回案件库', to: '/cases' },
      ],
    )
  }

  const onDeptApprove = (id: string) => {
    if (actingAs !== 'dept') {
      flash('请切换到「部门审核人」角色芯片后再操作')
      return
    }
    const res = advanceDisclosure(id, 'IP受理', '部门审核人通过，转 IP 受理')
    flash(res.message)
    if (res.ok) setActingAs('ip')
  }

  const onDeptReject = (id: string) => {
    if (actingAs !== 'dept') {
      flash('请切换到「部门审核人」角色芯片后再操作')
      return
    }
    const res = advanceDisclosure(id, '退回', '部门审核人退回，请补充材料')
    flash(res.message)
  }

  const onIpAccept = (id: string) => {
    if (actingAs !== 'ip') {
      flash('请切换到「IP受理人」角色芯片；不可跳过 IP 受理直接立案')
      return
    }
    const res = advanceDisclosure(id, '已立案', 'IP受理人通过并立案')
    if (res.ok && res.caseId) {
      flash(
        `${res.message} · 已挂「待结构化交底包」`,
        `/cases/${res.caseId}`,
        [
          { label: '打开案件', to: `/cases/${res.caseId}` },
          {
            label: '交底 Agent',
            to: `/agent/agents?agent=agent-disclosure&case=${res.caseId}`,
          },
          { label: '交底包区', to: `/inventor?case=${res.caseId}` },
        ],
      )
    } else {
      flash(res.message)
    }
  }

  const onIpReject = (id: string) => {
    if (actingAs !== 'ip') {
      flash('请切换到「IP受理人」角色芯片后再操作')
      return
    }
    const res = advanceDisclosure(id, '退回', 'IP受理人退回')
    flash(res.message)
  }

  const scrollToForm = () => {
    document.getElementById('disclosure-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    const titleInput = document.querySelector<HTMLInputElement>('#disclosure-form input[aria-label="发明名称"]')
    titleInput?.focus()
  }

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="研发交底"
        context="两层勿混：①发明人提报状态机 · ②交底包 disclosure_pack 办理交接"
        primary={{
          label: '提交交底',
          onClick: scrollToForm,
          icon: <Send className="h-4 w-4" aria-hidden />,
          ariaLabel: '跳转到提交交底表单',
        }}
        secondary={[
          { label: '创新激发', to: '/insight/innovate' },
          { label: '案件库', to: '/cases' },
        ]}
      />

      <div role="status" aria-live="polite" className="mb-4">
        {toast && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            <div>{toast}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {toastLink && (
                <button
                  type="button"
                  className="btn-press rounded-lg border border-emerald-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800"
                  onClick={() => navigateApp(navigate, toastLink)}
                >
                  查看案件
                </button>
              )}
              {toastActions?.map((a) =>
                a.to ? (
                  <AppLink
                    key={a.label}
                    to={a.to}
                    className="btn-press rounded-lg border border-emerald-300 bg-white px-2.5 py-1 text-xs font-medium text-emerald-900"
                  >
                    {a.label}
                  </AppLink>
                ) : (
                  <button
                    key={a.label}
                    type="button"
                    className="btn-press rounded-lg border border-emerald-300 bg-white px-2.5 py-1 text-xs font-medium text-emerald-900"
                    onClick={a.onClick}
                  >
                    {a.label}
                  </button>
                ),
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-sky-200 bg-sky-50/50 px-3 py-2.5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-sky-800">
            ① 发明人提报
          </div>
          <p className="mt-0.5 text-[11px] text-sky-900/80">
            门户表单推进 · 与办理交接无关
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {FLOW.map((s, i) => (
              <div key={s} className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                <span className={`rounded-full px-2 py-0.5 font-medium ${STATUS_STYLE[s]}`}>{s}</span>
                {i < FLOW.length - 1 && <span className="text-slate-300">→</span>}
              </div>
            ))}
            <span className="text-[11px] text-slate-400">（或 退回）</span>
          </div>
        </div>
        <div className="rounded-xl border border-violet-200 bg-violet-50/50 px-3 py-2.5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-violet-800">
            ② 交底包交接
          </div>
          <p className="mt-0.5 text-[11px] text-violet-900/80">
            disclosure_pack · Agent 写入 / 企业批准 · 六项齐套硬闸
          </p>
          <p className="mt-2 text-[11px] text-slate-600">
            下方「结构化交底包」卡片 = 本层；勿与上方提报状态混读。
          </p>
        </div>
      </div>

      <section className="mb-6 rounded-xl border border-violet-200 bg-white p-5" aria-labelledby="disclosure-pack-heading">
        <h2 id="disclosure-pack-heading" className="text-sm font-medium text-slate-800">
          ② 结构化交底包 · {HANDOFF_ARTIFACT_LABELS.disclosure_pack}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          本层 = 办理交接（非提报）。由知产 Agent 交底整理写入；批准须勾齐 REQUIRED 六项。
        </p>
        {disclosurePacks.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-xs text-slate-600">
            尚无 <code className="rounded bg-slate-100 px-1">disclosure_pack</code> 交接。请在知产 Agent 用交底整理 Agent 批准后回写，或打开{' '}
            <AppLink to="/agent/sessions/sess-disclosure-1" className="text-slate-800 underline">
              交底整理会话
            </AppLink>
            。
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {disclosurePacks.map(({ case: c, handoff: h, sess, art, linkedDisclosure }) => {
              const lit = highlightPack === c.id || highlightKey === c.id
              return (
                <li
                  key={c.id}
                  id={`disclosure-pack-${c.id}`}
                  className={`rounded-lg border px-3 py-2.5 ${
                    lit ? 'border-amber-300 bg-amber-50/60 ring-1 ring-amber-200' : 'border-slate-100 bg-slate-50'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-800">{c.title}</div>
                      <div className="mt-0.5 text-[11px] text-slate-500">
                        {c.inventor} · {c.caseNo}
                        {h.note ? ` · ${h.note}` : ''}
                      </div>
                    </div>
                    <HandoffChip status={h.status} />
                  </div>
                  {art.length > 0 && (
                    <div className="mt-1.5 text-[11px] text-slate-600">
                      最近产物：{art.slice(0, 3).map((a) => a.name).join(' · ')}
                    </div>
                  )}
                  {isEnterprise && (
                    <div className="mt-2 rounded-md border border-slate-200 bg-white p-2">
                      {(() => {
                        const packCheck = getDisclosurePackCheck(c.id)
                        const checkedRequired = DISCLOSURE_PACK_CHECK_ITEMS.filter(
                          (i) => packCheck[i.id],
                        ).map((i) => i.id)
                        const packOk = disclosurePackComplete(packCheck)
                        return (
                          <>
                            <div className="mb-2 rounded border border-slate-100 bg-slate-50 px-2 py-1.5">
                              <div className="mb-1 text-[11px] font-medium text-slate-600">
                                交底包齐套（REQUIRED 六项）· {checkedRequired.length}/6
                              </div>
                              <ul className="space-y-1">
                                {DISCLOSURE_PACK_CHECK_ITEMS.map((item) => (
                                  <li key={item.id}>
                                    <label className="flex cursor-pointer items-start gap-1.5 text-[11px] text-slate-700">
                                      <input
                                        type="checkbox"
                                        className="mt-0.5 accent-slate-700"
                                        checked={!!packCheck[item.id]}
                                        onChange={() =>
                                          toggleDisclosurePackCheck(c.id, item.id)
                                        }
                                      />
                                      <span>{item.label}</span>
                                    </label>
                                  </li>
                                ))}
                              </ul>
                              {!packOk && (
                                <p className="mt-1 text-[11px] text-rose-700">
                                  空壳不可批准：请勾齐六项后再批准
                                </p>
                              )}
                            </div>
                            <HandoffActionBar
                              caseId={c.id}
                              handoffKey="disclosure_pack"
                              checkedRequired={checkedRequired}
                              blockPrimary={!packOk}
                              inlineError={
                                !packOk
                                  ? `交底包未齐套（${checkedRequired.length}/6）· 禁用批准`
                                  : null
                              }
                              validateBefore={(a) => {
                                if (
                                  (a === 'submit' || a === 'approve') &&
                                  !packOk
                                ) {
                                  return '交底包 REQUIRED 六项未齐，不可提交/批准'
                                }
                                // 门户批 pack · 与 Session 同源护栏（以更严为准）
                                if (a === 'approve' || a === 'authorize' || a === 'file') {
                                  const gr = evaluateGuardrails({
                                    agent: getAgent('agent-disclosure'),
                                    case: getCase(c.id) ?? null,
                                    action: a,
                                    persona,
                                    role,
                                    isEnterprise:
                                      workspace.kind === 'enterprise' ||
                                      role === 'enterprise',
                                    handoffKey: 'disclosure_pack',
                                    disclosureCheck: getDisclosurePackCheck(c.id),
                                  })
                                  const msg = firstGuardrailMessage(gr)
                                  if (msg) return msg
                                }
                                return null
                              }}
                              onResult={(msg, err) =>
                                flash(err ? `交接失败：${msg}` : msg)
                              }
                            />
                          </>
                        )
                      })()}
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                    {sess ? (
                      <AppLink
                        to={`/agent/sessions/${sess.id}`}
                        className="underline decoration-slate-300 hover:text-slate-800"
                      >
                        打开会话
                      </AppLink>
                    ) : (
                      <AppLink
                        to={`/agent/agents?agent=agent-disclosure&case=${c.id}`}
                        className="underline decoration-slate-300 hover:text-slate-800"
                      >
                        用 Agent 续办
                      </AppLink>
                    )}
                    <AppLink
                      to={`/cases/${c.id}`}
                      className="underline decoration-slate-300 hover:text-slate-700"
                    >
                      打开案件
                    </AppLink>
                    {linkedDisclosure && (
                      <button
                        type="button"
                        className="underline decoration-slate-300 hover:text-slate-700"
                        onClick={() => setExpanded(linkedDisclosure.id)}
                      >
                        对应提报 {linkedDisclosure.status}
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {!isEnterprise && (
        <div className="mb-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
          代理所工作区仅可查看协作交底状态（只读）。部门审核 / IP 受理请切换企业租户。
        </div>
      )}

      {isEnterprise && (
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
          <span className="text-xs text-slate-500">当前操作身份（同登录）：</span>
          <button
            type="button"
            onClick={() => setActingAs('dept')}
            className={`btn-press rounded-full px-3 py-1 text-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 ${
              actingAs === 'dept'
                ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-300'
                : 'bg-slate-100 text-slate-600'
            }`}
            aria-label="切换为部门审核人"
            aria-pressed={actingAs === 'dept'}
          >
            部门审核人
          </button>
          <button
            type="button"
            onClick={() => setActingAs('ip')}
            className={`btn-press rounded-full px-3 py-1 text-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 ${
              actingAs === 'ip'
                ? 'bg-slate-100 text-slate-900 ring-1 ring-slate-300'
                : 'bg-slate-100 text-slate-600'
            }`}
            aria-label="切换为IP受理人"
            aria-pressed={actingAs === 'ip'}
          >
            IP受理人
          </button>
          <span className="text-[11px] text-slate-400">
            须先部门审核 → 再 IP 受理立案，不可跳过
          </span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <form
          id="disclosure-form"
          onSubmit={submit}
          className={`flat-card scroll-mt-6 p-5 lg:col-span-3 ${!isEnterprise ? 'pointer-events-none opacity-60' : ''}`}
          aria-disabled={!isEnterprise}
        >
          <h2 className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-800">
            <FileText className="h-4 w-4 text-slate-700" />
            提交发明交底（示意）
          </h2>
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs text-slate-600">发明名称 *</span>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                placeholder="简明描述发明主题"
                aria-label="发明名称"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs text-slate-600">技术主题</span>
                <input
                  value={form.techTheme}
                  onChange={(e) => setForm((f) => ({ ...f, techTheme: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  placeholder="可与发明名称相同；对齐立项 intake"
                  aria-label="技术主题"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-slate-600">专利类型</span>
                <select
                  value={form.patentType}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      patentType: e.target.value as '发明' | '实用新型' | '外观',
                    }))
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  aria-label="专利类型"
                >
                  <option value="发明">发明（默认）</option>
                  <option value="实用新型">实用新型</option>
                  <option value="外观">外观</option>
                </select>
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs text-slate-600">发明人 *</span>
                <input
                  value={form.inventor}
                  onChange={(e) => setForm((f) => ({ ...f, inventor: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  placeholder="姓名"
                  aria-label="发明人"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-slate-600">部门</span>
                <select
                  value={form.dept}
                  onChange={(e) => setForm((f) => ({ ...f, dept: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  aria-label="部门"
                >
                  {depts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-xs text-slate-600">联系人</span>
              <input
                value={form.contact}
                onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                placeholder="待填写"
                aria-label="联系人"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs text-slate-600">技术方案</span>
              <textarea
                value={form.tech}
                onChange={(e) => setForm((f) => ({ ...f, tech: e.target.value }))}
                rows={4}
                className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                placeholder="问题、方案要点、与现有技术差异（示意）"
                aria-label="技术方案"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs text-slate-600">公开风险日</span>
                <input
                  type="date"
                  value={form.riskDate}
                  onChange={(e) => setForm((f) => ({ ...f, riskDate: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  aria-label="公开风险日"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-slate-600">提交去向</span>
                <select
                  value={form.target}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      target: e.target.value as 'pre_research' | 'decision',
                    }))
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  aria-label="提交去向"
                >
                  <option value="pre_research">立项前调研</option>
                  <option value="decision">直接进立项决策</option>
                </select>
              </label>
            </div>
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
              <Paperclip className="mx-auto h-5 w-5 text-slate-400" />
              <div className="mt-2 text-xs text-slate-500">附件上传占位（示意）</div>
            </div>
            <button
              type="submit"
              className="btn-press cta-work focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium sm:w-auto"
              aria-label="提交交底"
            >
              <Send className="h-4 w-4" />
              提交交底
            </button>
          </div>
        </form>

        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-medium text-slate-800">我的交底 · 状态时间线</h2>
          <ul className="space-y-3">
            {disclosures.map((d) => (
              <li
                key={d.id}
                className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-3"
              >
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-2 text-left"
                  onClick={() => setExpanded((e) => (e === d.id ? null : d.id))}
                  aria-expanded={expanded === d.id}
                  aria-label={`展开交底 ${d.title}`}
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-slate-800">{d.title}</div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      {d.inventor} · {d.dept} · {d.submittedAt}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[d.status]}`}
                  >
                    {d.status}
                  </span>
                </button>

                {expanded === d.id && (
                  <div className="mt-3 border-t border-slate-200 pt-3">
                    <div className="mb-2 flex items-center gap-1 text-[11px] font-medium text-slate-600">
                      <Clock className="h-3 w-3" /> 状态时间线
                    </div>
                    <ol className="mb-3 space-y-2">
                      {d.timeline.map((t) => (
                        <li key={t.id} className="flex gap-2 text-[11px]">
                          <span className="tabular-nums text-slate-400">{t.time}</span>
                          <span className={`rounded px-1.5 font-medium ${STATUS_STYLE[t.status]}`}>
                            {t.status}
                          </span>
                          <span className="text-slate-500">{t.note}</span>
                        </li>
                      ))}
                    </ol>

                    {isEnterprise && d.status === '部门审核' && (
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-amber-800">
                          操作角色：部门审核人
                          {actingAs !== 'dept' && '（请先切换芯片）'}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => onDeptApprove(d.id)}
                            disabled={actingAs !== 'dept'}
                            className="btn-press inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                            aria-label={`部门审核人通过 ${d.title}`}
                          >
                            <CheckCircle2 className="h-3 w-3" /> 部门审核人 · 通过 → IP受理
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeptReject(d.id)}
                            disabled={actingAs !== 'dept'}
                            className="btn-press inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-medium text-rose-700 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                            aria-label={`部门审核人退回 ${d.title}`}
                          >
                            <XCircle className="h-3 w-3" /> 部门审核人 · 退回
                          </button>
                        </div>
                      </div>
                    )}

                    {isEnterprise && d.status === 'IP受理' && (
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-slate-800">
                          操作角色：IP受理人（不可跳过此步直接立案）
                          {actingAs !== 'ip' && '（请先切换芯片）'}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => onIpAccept(d.id)}
                            disabled={actingAs !== 'ip'}
                            className="btn-press inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                            aria-label={`IP受理人立案 ${d.title}`}
                          >
                            <CheckCircle2 className="h-3 w-3" /> IP受理人 · 受理立案
                          </button>
                          <button
                            type="button"
                            onClick={() => onIpReject(d.id)}
                            disabled={actingAs !== 'ip'}
                            className="btn-press inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-medium text-rose-700 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                            aria-label={`IP受理人退回 ${d.title}`}
                          >
                            <XCircle className="h-3 w-3" /> IP受理人 · 退回
                          </button>
                        </div>
                      </div>
                    )}

                    {d.caseId && (
                      <button
                        type="button"
                        onClick={() => navigateApp(navigate, `/cases/${d.caseId}`)}
                        className="mt-2 text-[11px] text-slate-700 hover:text-slate-900"
                      >
                        查看关联案件 →
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
