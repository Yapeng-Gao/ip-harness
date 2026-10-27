import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react'
import './App.css'

type Phase = 'home' | 'upload' | 'analyze' | 'report' | 'project' | 'execute' | 'returning'

type Profile = {
  role: string
  domain: string
  ask: string
  hasProject: string
  skipped: boolean
}

type Gap = { id: string; title: string; why: string; blocking: boolean; skipped: boolean; decided: boolean }

type ChatMsg = { who: 'sys' | 'me'; text: string }

const DEPARTMENTS = [
  { id: 'materials', name: '综合服务 / 材料组', stage: '了解', desc: '材料分析、分类与归档，形成二次画像。', flow: '收料 → 分析 → 分类 → 归档 → 汇报输入', experts: ['材料分析专家', '归档助理'] },
  { id: 'innovation', name: '创新启发部', stage: '发现', desc: '从技术问题和行业空白出发，激发可实现的创新方向。', flow: '问题澄清 → 机会扫描 → 机会清单', experts: ['技术情报专家', 'TRIZ 创新专家'] },
  { id: 'mining', name: '专利挖掘部', stage: '发现', desc: '跟随研发过程拆解技术方案，识别值得保护的专利点。', flow: '方案拆解 → 专利点识别 → 专利点清单', experts: ['机械挖掘专家', '电学挖掘专家'] },
  { id: 'strategy', name: '布局策略部', stage: '规划', desc: '结合产品、市场和竞争对手，设计核心与外围专利组合。', flow: '产品地图 → 组合设计 → 布局图', experts: ['布局策略专家', '竞品分析专家'] },
  { id: 'risk', name: '风险排查部', stage: '规划', desc: '分别开展可专利性检索与 FTO 分析，支持规避设计。', flow: '检索 → 比对 → 风险报告', experts: ['检索分析专家', 'FTO 法律专家'] },
  { id: 'disclosure', name: '交底书部', stage: '形成', desc: '通过追问补齐技术事实，把研发语言整理成完整交底材料。', flow: '访谈 → 事实齐套 → 交底书 → 确认接力', experts: ['技术访谈专家', '交底书撰写专家'] },
  { id: 'drafting', name: '申请文件部', stage: '申请', desc: '设计权利要求层次，完成说明书、摘要与附图说明。', flow: '继承事实 → 权要设计 → 说明书 → 申请包', experts: ['权利要求专家', '说明书撰写专家'] },
  { id: 'quality', name: '质量审查部', stage: '申请', desc: '核查支持、清楚、充分公开、一致性与修改超范围风险。', flow: '质检 → 问题单 → 修订闭环', experts: ['质检专家', '前审查员顾问'] },
  { id: 'oa', name: 'OA 答复部', stage: '审查', desc: '拆解审查意见，比对证据，形成修改和意见陈述策略。', flow: '拆解意见 → 策略 → 答复包', experts: ['OA 策略专家', '创造性争辩专家'] },
  { id: 'procedure', name: '流程事务部', stage: '审查', desc: '管理递交、公布、实审、登记、期限与官方文件。', flow: '期限监控 → 官方事务 → 台账', experts: ['流程管理专家', '期限监控专家'] },
  { id: 'asset', name: '资产运营部', stage: '运营', desc: '评估维持、许可、转让、维权和竞品监控机会。', flow: '评估 → 运营建议 → 执行跟进', experts: ['资产运营专家', '许可谈判顾问'] },
]

const ABILITY: Record<string, string> = {
  '材料分析专家': '分析、分类、归档全部上传材料，输出二次画像与缺口',
  '归档助理': '把材料归入卷宗结构，标类型与来源',
  '技术情报专家': '扫行业空白与竞品技术路线',
  'TRIZ 创新专家': '用创新方法激发可实现方向',
  '机械挖掘专家': '从机械结构拆可专利点',
  '电学挖掘专家': '从电路/控制拆可专利点',
  '布局策略专家': '设计核心与外围组合',
  '竞品分析专家': '对照竞品专利墙找空隙',
  '检索分析专家': '可专利性检索与比对',
  'FTO 法律专家': '自由实施风险判断',
  '技术访谈专家': '追问技术事实，补齐交底输入',
  '交底书撰写专家': '把研发语言整理成可接力交底书',
  '权利要求专家': '设计独立与从属权利要求层次',
  '说明书撰写专家': '写说明书、摘要与附图说明',
  '质检专家': '查支持、清楚、充分公开与一致性',
  '前审查员顾问': '按审查视角挑硬伤',
  'OA 策略专家': '拆审查意见并定修改策略',
  '创造性争辩专家': '组织创造性争辩与证据',
  '流程管理专家': '管递交与官方文件流转',
  '期限监控专家': '盯期限与官方节点',
  '资产运营专家': '评估维持/许可/转让机会',
  '许可谈判顾问': '许可与谈判条款建议',
}

const EXPERTS = DEPARTMENTS.flatMap((d) =>
  d.experts.map((name) => ({
    id: `${d.id}:${name}`,
    name,
    deptId: d.id,
    deptName: d.name,
    ability: ABILITY[name] || `${d.name}编制专家`,
  })),
)

const FAKE_PROJECTS = [
  { id: 'RD-2026-017', name: '磁驱泵智能控制', hint: '交底形成中 · 缺权属声明', match: '材料含磁驱泵/控制，与本案技术点接近' },
  { id: 'RD-2025-088', name: '储能热管理模块', hint: '已递交实审 · 等待 OA', match: '领域偏热管理，匹配度低' },
  { id: 'RD-2026-003', name: '视觉分拣夹具', hint: '布局完成 · 未开交底', match: '机械结构相关，弱相关' },
]

const PHASES: { id: Phase; label: string }[] = [
  { id: 'home', label: 'B 能力地图' },
  { id: 'upload', label: 'C 上传' },
  { id: 'analyze', label: 'D 分析' },
  { id: 'report', label: 'E 汇报' },
  { id: 'project', label: 'F 项目' },
  { id: 'execute', label: 'G 执行' },
]

const EXEC_PEERS = ['交底书部负责人', '技术访谈专家', '交底书撰写专家'] as const

function phaseIndex(p: Phase) {
  if (p === 'returning') return -1
  return PHASES.findIndex((x) => x.id === p)
}

function markSeen() {
  try { window.localStorage.setItem('mpv4_seen', '1') } catch {}
}

function inferBundle(goal: string) {
  const g = goal.toLowerCase()
  if (g.includes('fto') || g.includes('风险')) {
    return {
      lead: '风险排查部 · 检索分析专家 / FTO 法律专家',
      flow: '检索 → 比对 → 风险报告 → 你确认规避或继续',
      deptId: 'risk',
    }
  }
  if (g.includes('申请') || g.includes('权要') || g.includes('说明书')) {
    return {
      lead: '申请文件部 · 权利要求专家 / 说明书撰写专家',
      flow: '继承事实 → 权要设计 → 说明书 → 申请包 → 你确认策略',
      deptId: 'drafting',
    }
  }
  if (g.includes('oa') || g.includes('答复') || g.includes('审查')) {
    return {
      lead: 'OA 答复部 · OA 策略专家 / 创造性争辩专家',
      flow: '拆解意见 → 策略 → 答复包 → 你确认修改范围',
      deptId: 'oa',
    }
  }
  return {
    lead: '交底书部 · 技术访谈专家 / 交底书撰写专家',
    flow: '访谈补事实 → 事实齐套 → 形成技术交底书 → 你确认可接力 → 申请文件部继承',
    deptId: 'disclosure',
  }
}

export default function App() {
  const [phase, setPhase] = useState<Phase>(() => {
    try {
      const q = new URLSearchParams(window.location.search).get('phase') as Phase | null
      const allowed: Phase[] = ['home', 'upload', 'analyze', 'report', 'project', 'execute', 'returning']
      if (q && allowed.includes(q)) return q
      return window.localStorage.getItem('mpv4_seen') === '1' ? 'returning' : 'home'
    } catch {
      return 'home'
    }
  })
  const [profileOpen, setProfileOpen] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const sheetCloseRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    try {
      const url = new URL(window.location.href)
      if (phase === 'home' || phase === 'returning') url.searchParams.delete('phase')
      else url.searchParams.set('phase', phase)
      window.history.replaceState(null, '', url.pathname + url.search + url.hash)
    } catch {}
  }, [phase])

  useEffect(() => {
    if (!profileOpen) return
    const prev = document.activeElement as HTMLElement | null
    sheetCloseRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setProfileOpen(false)
        return
      }
      if (e.key !== 'Tab' || !sheetRef.current) return
      const focusables = sheetRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusables.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      prev?.focus?.()
    }
  }, [profileOpen])

  const [profile, setProfile] = useState<Profile>({
    role: '发明人',
    domain: '机电控制',
    ask: '',
    hasProject: '不确定',
    skipped: true,
  })
  const [intentDept, setIntentDept] = useState<string | null>(null)
  const [intentExpert, setIntentExpert] = useState<string | null>(null)
  const [homeQuery, setHomeQuery] = useState('')
  const [showAllExperts, setShowAllExperts] = useState(false)
  const [stageFilter, setStageFilter] = useState<string | 'all'>('all')
  const [files, setFiles] = useState<{ name: string; size: number }[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [analyzePct, setAnalyzePct] = useState(0)
  const [analyzeDone, setAnalyzeDone] = useState(false)
  const [analyzeNote, setAnalyzeNote] = useState('')
  const [gaps, setGaps] = useState<Gap[]>([])
  const [goalOverride, setGoalOverride] = useState('')
  const [projectChoice, setProjectChoice] = useState<'new' | 'merge' | null>(null)
  const [mergeId, setMergeId] = useState<string | null>(null)
  const [confirmedProject, setConfirmedProject] = useState<{ code: string; name: string } | null>(null)
  const [peer, setPeer] = useState<string>(EXEC_PEERS[0])
  const [threads, setThreads] = useState<Record<string, ChatMsg[]>>(() =>
    Object.fromEntries(
      EXEC_PEERS.map((p) => [
        p,
        [
          {
            who: 'sys' as const,
            text:
              p === '交底书部负责人'
                ? '我是本部门负责人。材料分析已归档，缺项在 chip 里；点其他专家可进 1:1。'
                : `我是${p}。这是 1:1，只谈我负责的部分。`,
          },
        ],
      ]),
    ),
  )
  const [draft, setDraft] = useState('')
  const [gapOpen, setGapOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const intentLabel = useMemo(() => {
    const d = DEPARTMENTS.find((x) => x.id === intentDept)
    const e = EXPERTS.find((x) => x.id === intentExpert)
    if (!d && !e) return '未选部门/专家（可直接上传）'
    return [d ? `部门：${d.name}` : null, e ? `专家：${e.name}` : null].filter(Boolean).join(' · ')
  }, [intentDept, intentExpert])

  const inferredGoal = goalOverride.trim() || '写技术交底书（推断置信中等）'
  const bundle = inferBundle(inferredGoal)
  const openGaps = gaps.filter((g) => !g.skipped && !g.decided)
  const support =
    openGaps.some((g) => g.blocking) ? '不够' : openGaps.length > 0 ? '勉强' : '够'

  const q = homeQuery.trim().toLowerCase()
  const stages = ['了解', '发现', '规划', '形成', '申请', '审查', '运营']
  const filteredDepts = useMemo(
    () =>
      DEPARTMENTS.filter((d) => {
        if (stageFilter !== 'all' && d.stage !== stageFilter) return false
        if (!q) return true
        return (
          d.name.toLowerCase().includes(q) ||
          d.desc.toLowerCase().includes(q) ||
          d.experts.some((e) => e.toLowerCase().includes(q))
        )
      }),
    [q, stageFilter],
  )
  const filteredExperts = useMemo(() => {
    let list = EXPERTS
    if (intentDept && !showAllExperts) list = list.filter((e) => e.deptId === intentDept)
    if (q) {
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.ability.toLowerCase().includes(q) ||
          e.deptName.toLowerCase().includes(q),
      )
    }
    return list
  }, [intentDept, showAllExperts, q])

  useEffect(() => {
    if (phase !== 'analyze' || analyzeDone) return
    setAnalyzePct(0)
    setAnalyzeNote('材料分析专家开始读取…')
    let n = 0
    const t = window.setInterval(() => {
      n += 12 + Math.floor(Math.random() * 10)
      if (n >= 35 && n < 65) setAnalyzeNote('正在分类：交底 / 证据 / 法律文件 / 杂项…')
      if (n >= 65 && n < 100) setAnalyzeNote('正在归档至待归案材料池…')
      if (n >= 100) {
        n = 100
        window.clearInterval(t)
        setAnalyzePct(100)
        setAnalyzeNote('分析完成，正在打开汇报…')
        setAnalyzeDone(true)
        setGaps([
          { id: 'g1', title: '权属声明 / 发明人信息', why: '交底接力与申请文件需要确认权利主体', blocking: false, skipped: false, decided: false },
          { id: 'g2', title: '稳态工况测试数据原文', why: '技术效果段落目前只有摘要，缺原始记录', blocking: false, skipped: false, decided: false },
          { id: 'g3', title: '替代实施方式草图', why: '说明书充分公开更稳；可不补先开写', blocking: false, skipped: false, decided: false },
        ])
        window.setTimeout(() => setPhase('report'), 450)
      } else setAnalyzePct(n)
    }, 280)
    return () => window.clearInterval(t)
  }, [phase, analyzeDone])


  function toggleDept(id: string) {
    setIntentDept((cur) => {
      const next = cur === id ? null : id
      if (next) setShowAllExperts(false)
      return next
    })
  }
  function toggleExpert(id: string) {
    setIntentExpert((cur) => {
      if (cur === id) return null
      const e = EXPERTS.find((x) => x.id === id)
      if (e) {
        setIntentDept(e.deptId)
        setShowAllExperts(false)
      }
      return id
    })
  }

  function addFiles(list: FileList | File[] | null) {
    if (!list || (list as FileList).length === 0) return
    const arr = Array.from(list as FileList)
    setFiles((prev) => {
      const next = [...prev]
      arr.forEach((f) => {
        if (!next.some((x) => x.name === f.name && x.size === f.size)) next.push({ name: f.name, size: f.size })
      })
      return next
    })
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragOver(false)
    addFiles(e.dataTransfer.files)
  }

  function startAnalyze() {
    if (!files.length) return
    markSeen()
    setAnalyzeDone(false)
    setAnalyzePct(0)
    setPhase('analyze')
  }

  function confirmProject() {
    if (projectChoice === 'new') {
      setConfirmedProject({ code: 'RD-2026-NEW', name: files[0]?.name.replace(/\.[^.]+$/, '') || '新开项目' })
      markSeen()
      setPhase('execute')
      return
    }
    if (projectChoice === 'merge' && mergeId) {
      const p = FAKE_PROJECTS.find((x) => x.id === mergeId)!
      setConfirmedProject({ code: p.id, name: p.name })
      markSeen()
      setPhase('execute')
    }
  }

  function sendChat() {
    const t = draft.trim()
    if (!t) return
    setThreads((all) => ({
      ...all,
      [peer]: [...(all[peer] || []), { who: 'me', text: t }, { who: 'sys', text: `已收到（${peer}）：${t}` }],
    }))
    setDraft('')
  }

  function decideGaps() {
    setGaps((arr) => arr.map((g) => (g.skipped ? g : { ...g, decided: true })))
    setGapOpen(false)
    setThreads((all) => ({
      ...all,
      [peer]: [...(all[peer] || []), { who: 'sys', text: '缺项已拍板入卷，撰写专家按已确认范围继续。' }],
    }))
  }

  const chat = threads[peer] || []

  return (
    <div className="v4-shell">
      <a className="skip-link" href="#v4-main">
        跳到主内容
      </a>
      <header className="v4-top">
        <div>
          <strong>虚拟知产公司 · 主路径 V4</strong>
          <small> · 了解 → 汇报 → 执行 · :8768</small>
        </div>
        <nav className="v4-steps" aria-label="主路径阶段">
          {PHASES.map((s) => {
            const i = phaseIndex(s.id)
            const cur = phaseIndex(phase)
            const cls = i === cur ? 'on' : i < cur ? 'done' : ''
            const jumpable = i <= cur
            return (
              <button
                key={s.id}
                type="button"
                className={cls}
                disabled={!jumpable}
                onClick={() => jumpable && setPhase(s.id)}
                aria-current={i === cur ? 'step' : undefined}
              >
                {s.label}
              </button>
            )
          })}
        </nav>
      </header>

      {phase !== 'execute' && (
        <main id="v4-main" className="v4-main" tabIndex={-1}>
          
          {phase === 'returning' && (
            <div className="v4-card">
              <p className="v4-section-kicker">再次进入</p>
              <h1>继续你的在办</h1>
              <p className="lead">有缺项要拍板，或从能力地图重新丢材料开案。</p>
              <div className="v4-grid">
                <button type="button" className="v4-tile is-on" onClick={() => {
                  setConfirmedProject({ code: 'RD-2026-017', name: '磁驱泵智能控制' })
                  setFiles([
                    { name: '磁驱泵控制方案-研发纪要.pdf', size: 420_000 },
                    { name: '传感器布置草图.png', size: 180_000 },
                  ])
                  setGaps([
                    { id: 'g1', title: '权属声明 / 发明人信息', why: '交底接力需要确认权利主体', blocking: false, skipped: false, decided: false },
                    { id: 'g2', title: '稳态工况测试数据原文', why: '技术效果仍缺原始记录', blocking: false, skipped: false, decided: false },
                  ])
                  markSeen()
                  setPhase('execute')
                }}>
                  <strong>磁驱泵智能控制 · RD-2026-017</strong>
                  <small>交底形成中 · 2 项缺项待拍板</small>
                </button>
                <button type="button" className="v4-tile" onClick={() => setPhase('home')}>
                  <strong>看能力地图 / 新丢材料</strong>
                  <small>不进旧案，从了解再走一遍</small>
                </button>
              </div>
              <div className="v4-actions">
                <button className="btn btn-ghost" type="button" onClick={() => { try { localStorage.removeItem('mpv4_seen') } catch {}; setPhase('home'); setProfile({ role: '发明人', domain: '机电控制', ask: '', hasProject: '不确定', skipped: true }) }}>
                  模拟「第一次进入」
                </button>
              </div>
            </div>
          )}

          {phase === 'home' && (
            <div className="v4-card">
              <p className="v4-section-kicker">进公司 · 能力地图</p>
              <h1>虚拟知产公司，帮你尽快申专利</h1>
              <p className="lead">
                先看清有哪些部门、专家能做什么；可点选，也可不选，直接丢材料。
                {profile.skipped
                  ? ' · 尚未了解你（推荐会偏弱）'
                  : ` · 已了解：${profile.role} / ${profile.domain}`}
              </p>
              <div className="v4-actions" style={{ marginTop: 0, marginBottom: 12 }}>
                <button className="btn btn-ghost" type="button" onClick={() => setProfileOpen(true)}>
                  {profile.skipped ? '补充一点关于你' : '改一下关于你'}
                </button>
              </div>
              <div className="v4-intent">当前意向：{intentLabel}</div>
              <div className="v4-field">
                <label htmlFor="home-q">搜索部门或专家</label>
                <input id="home-q" name="homeQuery" autoComplete="off" value={homeQuery} onChange={(e) => setHomeQuery(e.target.value)} placeholder="例如：交底、FTO、材料分析…" />
              </div>

              <h2>部门</h2>
              <div className="v4-actions" style={{ marginTop: 0, marginBottom: 10 }} role="group" aria-label="按阶段筛选部门">
                <button type="button" className={`btn ${stageFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setStageFilter('all')}>全部</button>
                {stages.map((s) => (
                  <button key={s} type="button" className={`btn ${stageFilter === s ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setStageFilter(s)}>{s}</button>
                ))}
              </div>
              <div className="v4-grid" style={{ marginBottom: 18 }}>
                {filteredDepts.map((d) => (
                  <button key={d.id} type="button" className={`v4-tile ${intentDept === d.id ? 'is-on' : ''}`} onClick={() => toggleDept(d.id)} aria-pressed={intentDept === d.id}>
                    <strong>
                      {d.name} <small style={{ display: 'inline', color: '#a8a29e' }}>· {d.stage}</small>
                    </strong>
                    <small>{d.desc}</small>
                    <small style={{ marginTop: 6 }}>流程：{d.flow}</small>
                    <div className="tags">
                      {d.experts.map((e) => (
                        <em key={e}>{e}</em>
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0 }}>
                  专家
                  <small style={{ marginLeft: 8, color: '#78716c', fontWeight: 400 }}>
                    {intentDept && !showAllExperts
                      ? `仅「${DEPARTMENTS.find((d) => d.id === intentDept)?.name}」· ${filteredExperts.length} 人`
                      : `全部 · ${filteredExperts.length} 人`}
                  </small>
                </h2>
                <div className="v4-actions" style={{ marginTop: 0 }}>
                  {intentDept && (
                    <button className="btn btn-ghost" type="button" onClick={() => setShowAllExperts((v) => !v)}>
                      {showAllExperts ? '只看本部门' : '显示全部专家'}
                    </button>
                  )}
                </div>
              </div>
              {!intentDept && !q && (
                <p className="lead" style={{ marginTop: 8 }}>
                  先点一个部门看编制，或搜索专家名；也可以不选，直接上传。
                </p>
              )}
              {(intentDept || q || showAllExperts) && (
                <div className="v4-grid" style={{ marginTop: 12 }}>
                  {filteredExperts.map((e) => (
                    <button key={e.id} type="button" className={`v4-tile ${intentExpert === e.id ? 'is-on' : ''}`} onClick={() => toggleExpert(e.id)} aria-pressed={intentExpert === e.id}>
                      <strong>{e.name}</strong>
                      <small>{e.deptName}</small>
                      <small style={{ marginTop: 6 }}>{e.ability}</small>
                    </button>
                  ))}
                  {!filteredExperts.length && <p style={{ color: '#78716c' }}>没有匹配的专家。</p>}
                </div>
              )}

              <div className="v4-actions">
                <button className="btn btn-primary" type="button" onClick={() => setPhase('upload')}>
                  上传材料，开始了解
                </button>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => {
                    setIntentDept(null)
                    setIntentExpert(null)
                    setPhase('upload')
                  }}
                >
                  不选人，直接上传
                </button>
              </div>
            </div>
          )}

          {phase === 'upload' && (
            <div className="v4-card">
              <p className="v4-section-kicker">C · 上传材料</p>
              <h1>把材料丢进来</h1>
              <p className="lead">支持拖入或选择文件。至少 1 个文件后进入材料分析。</p>
              <div className="v4-intent">当前意向：{intentLabel}</div>
              <div
                className={`v4-drop ${dragOver ? 'is-drag' : ''}`}
                onDragEnter={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
              >
                <strong>{dragOver ? '松开即可添加' : '拖入文件到此处，或选择文件'}</strong>
                <small style={{ color: '#78716c' }}>交底草稿、图纸、聊天记录、已有申请文件等</small>
                <div className="v4-actions" style={{ justifyContent: 'center' }}>
                  <button className="btn btn-secondary" type="button" onClick={() => fileRef.current?.click()}>
                    选择文件
                  </button>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() =>
                      setFiles([
                        { name: '磁驱泵控制方案-研发纪要.pdf', size: 420_000 },
                        { name: '传感器布置草图.png', size: 180_000 },
                        { name: '微信讨论导出.txt', size: 24_000 },
                      ])
                    }
                  >
                    放入演示样例
                  </button>
                  {!!files.length && (
                    <button className="btn btn-ghost" type="button" onClick={() => setFiles([])}>
                      清空列表
                    </button>
                  )}
                </div>
                <input ref={fileRef} type="file" multiple hidden onChange={(e) => addFiles(e.target.files)} />
              </div>
              {!!files.length && (
                <ul className="v4-filelist">
                  {files.map((f) => (
                    <li key={f.name + f.size}>
                      <span>{f.name}</span>
                      <small>{Math.max(1, Math.round(f.size / 1024))} KB</small>
                    </li>
                  ))}
                </ul>
              )}
              <div className="v4-actions">
                <button className="btn btn-secondary" type="button" onClick={() => setPhase('home')}>
                  返回首页
                </button>
                <button className="btn btn-primary" type="button" disabled={!files.length} onClick={startAnalyze}>
                  交给材料分析专家
                </button>
                {!files.length && <span className="v4-hint">先添加至少 1 个文件</span>}
              </div>
            </div>
          )}

          {phase === 'analyze' && (
            <div className="v4-card">
              <p className="v4-section-kicker">D · 材料分析 · 二次了解</p>
              <h1>材料分析专家在办</h1>
              <p className="lead">分析 → 分类 → 归档。此步必跑，与是否点选专家无关。归属：综合服务 / 材料组。</p>
              <div
                className="v4-progress"
                role="progressbar"
                aria-label="分析进度"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={analyzePct}
              >
                <i style={{ width: `${analyzePct}%` }} />
              </div>
              <p className="v4-hint tabular" aria-live="polite">
                {analyzeNote || `${analyzePct}%`}
              </p>
              <ul className="v4-filelist">
                <li>
                  <span>分析材料语义与专利相关线索</span>
                  <span className="v4-badge">{analyzePct < 35 ? '进行中' : '完成'}</span>
                </li>
                <li>
                  <span>分类：交底 / 证据 / 法律文件 / 杂项</span>
                  <span className="v4-badge">{analyzePct < 65 ? (analyzePct >= 35 ? '进行中' : '排队') : '完成'}</span>
                </li>
                <li>
                  <span>归档至待归案材料池</span>
                  <span className="v4-badge">{analyzePct < 100 ? (analyzePct >= 65 ? '进行中' : '排队') : '完成'}</span>
                </li>
              </ul>
            </div>
          )}

          {phase === 'report' && (
            <div className="v4-card">
              <p className="v4-section-kicker">E · 汇报</p>
              <h1>先看清，再动手</h1>
              <p className="lead">
                {profile.skipped ? '画像了解不足，下列推断偏保守。' : `基于画像（${profile.role} / ${profile.domain}）与 ${files.length} 份材料。`}
                缺口可补可不补。
              </p>

              <div className="v4-report-block">
                <h3>1. 你大概要做什么</h3>
                <p>
                  <strong>{inferredGoal}</strong>
                  {!goalOverride && ' · 低置信时可纠正'}
                </p>
                <div className="v4-field" style={{ marginTop: 10 }}>
                  <label htmlFor="goal-fix">纠正目标（可选）</label>
                  <input id="goal-fix" name="goal" autoComplete="off" value={goalOverride} onChange={(e) => setGoalOverride(e.target.value)} placeholder="例如：准备新申请 / 补正 / FTO…" />
                </div>
              </div>

              <div className="v4-report-block">
                <h3>2. 相关部门与专家</h3>
                <p>建议主责：{bundle.lead}</p>
                <p style={{ color: '#78716c', fontSize: 13 }}>协作：材料分析专家（已完成归档）</p>
                {intentExpert && <p style={{ fontSize: 13 }}>你的意向已记下：{intentLabel}</p>}
              </div>

              <div className="v4-report-block">
                <h3>3. 正常流程</h3>
                <p style={{ fontSize: 14, lineHeight: 1.55 }}>{bundle.flow}</p>
              </div>

              <div className="v4-report-block">
                <h3>4. 现有材料支不支持</h3>
                <span className={`v4-badge ${support === '够' ? 'ok' : support === '勉强' ? 'warn' : 'bad'}`}>{support}</span>
                <span style={{ marginLeft: 8, fontSize: 13, color: '#57534e' }}>
                  够=可直接开干 · 勉强=能开写但效果偏薄 · 不够=缺阻塞项
                </span>
                <div style={{ marginTop: 8, fontSize: 13, color: '#57534e' }}>已分类归档 {files.length} 份</div>
              </div>

              <div className="v4-report-block">
                <h3>5. 缺什么材料</h3>
                {gaps.map((g) => (
                  <div className="v4-gap" key={g.id}>
                    <p>
                      <strong>{g.title}</strong>
                      <br />
                      <span style={{ color: '#78716c' }}>{g.why}</span>
                      {g.skipped && (
                        <span className="v4-badge" style={{ marginLeft: 6 }}>
                          暂不补充
                        </span>
                      )}
                    </p>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      style={{ flexShrink: 0 }}
                      onClick={() => setGaps((arr) => arr.map((x) => (x.id === g.id ? { ...x, skipped: !x.skipped } : x)))}
                    >
                      {g.skipped ? '改为要补' : '暂不补充'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="v4-actions">
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => {
                    setAnalyzeDone(false)
                    setPhase('upload')
                  }}
                >
                  去补充材料
                </button>
                <button className="btn btn-primary" type="button" onClick={() => setPhase('project')}>
                  下一步：定项目
                </button>
              </div>
            </div>
          )}

          {phase === 'project' && (
            <div className="v4-card">
              <p className="v4-section-kicker">F · 项目归属</p>
              <h1>新建，还是并入旧案？</h1>
              <p className="lead">
                {profile.hasProject === '不确定' || profile.skipped
                  ? '系统确认不了，请你拍板。禁止静默合并。'
                  : profile.hasProject === '是'
                    ? '你提到可能已有在办项目，请核对是否并入。'
                    : '按「无在办项目」倾向，默认建议新建；仍可改并入。'}
              </p>
              {(profile.hasProject === '不确定' || profile.skipped) && (
                <ul className="v4-filelist" style={{ marginBottom: 14 }}>
                  <li>
                    <span>歧义：材料未写案号，无法唯一对应旧案</span>
                    <span className="v4-badge warn">待你定</span>
                  </li>
                  <li>
                    <span>歧义：画像未确认是否已有在办项目</span>
                    <span className="v4-badge warn">待你定</span>
                  </li>
                </ul>
              )}

              <div className="v4-grid" role="radiogroup" aria-label="项目归属">
                <button type="button" className={`v4-tile ${projectChoice === 'new' ? 'is-on' : ''}`} onClick={() => { setProjectChoice('new'); setMergeId(null) }} aria-pressed={projectChoice === 'new'}>
                  <strong>新建项目</strong>
                  <small>材料池归入新案，从交底形成开干</small>
                </button>
                <button type="button" className={`v4-tile ${projectChoice === 'merge' ? 'is-on' : ''}`} onClick={() => setProjectChoice('merge')} aria-pressed={projectChoice === 'merge'}>
                  <strong>并入已有项目</strong>
                  <small>需选出目标案；吃不准就别并</small>
                </button>
              </div>

              {projectChoice === 'merge' && (
                <div style={{ marginTop: 16 }}>
                  <p className="v4-section-kicker">可选旧案（假数据 · 含匹配理由）</p>
                  <div className="v4-grid">
                    {FAKE_PROJECTS.map((p) => (
                      <button key={p.id} type="button" className={`v4-tile ${mergeId === p.id ? 'is-on' : ''}`} onClick={() => setMergeId(p.id)} aria-pressed={mergeId === p.id}>
                        <strong>
                          {p.name} <small style={{ display: 'inline' }}>{p.id}</small>
                        </strong>
                        <small>{p.hint}</small>
                        <small style={{ marginTop: 6 }}>匹配：{p.match}</small>
                      </button>
                    ))}
                  </div>
                  {!mergeId && <p className="v4-hint" style={{ color: '#9a3412' }}>请选出要并入的项目，或改选新建。</p>}
                </div>
              )}

              <div className="v4-actions">
                <button className="btn btn-secondary" type="button" onClick={() => setPhase('report')}>
                  返回汇报
                </button>
                <button
                  className="btn btn-primary"
                  type="button"
                  disabled={!(projectChoice === 'new' || (projectChoice === 'merge' && mergeId))}
                  onClick={confirmProject}
                >
                  确认并进入执行
                </button>
                {!(projectChoice === 'new' || (projectChoice === 'merge' && mergeId)) && (
                  <span className="v4-hint">先选新建，或并入并指定旧案</span>
                )}
              </div>
            </div>
          )}
        </main>
      )}

      {phase === 'execute' && confirmedProject && (
        <div id="v4-main">
          <div style={{ padding: '10px 16px', background: '#fafaf9', borderBottom: '1px solid rgba(28,25,23,.08)', fontSize: 13, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span>
              G 执行 · <strong>{confirmedProject.name}</strong> · {confirmedProject.code} · 卷宗 / 文书 / 右栏
            </span>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => {
                if (window.confirm('返回能力地图？当前执行页仍可通过顶栏 G 回来（本原型会话内保留）。')) setPhase('home')
              }}
            >
              回能力地图
            </button>
          </div>
          <div className="v4-wb">
            <aside>
              <h3>卷宗</h3>
              <ul>
                {files.map((f) => (
                  <li key={f.name}>
                    <strong style={{ fontSize: 12 }}>{f.name}</strong>
                    <div style={{ color: '#78716c', fontSize: 11 }}>输入 · 已归档</div>
                  </li>
                ))}
                <li>
                  <strong style={{ fontSize: 12 }}>缺口清单.md</strong>
                  <div style={{ color: '#78716c', fontSize: 11 }}>过程 · 材料分析专家</div>
                </li>
                <li>
                  <strong style={{ fontSize: 12 }}>技术交底书（起草中）</strong>
                  <div style={{ color: '#78716c', fontSize: 11 }}>产物</div>
                </li>
              </ul>
            </aside>
            <section>
              <h3>文书 · 技术交底书</h3>
              <article className="document" style={{ fontSize: 14, lineHeight: 1.65 }}>
                <p className="doc-lead" style={{ color: '#78716c' }}>
                  由交底书部继承材料分析归档结果起草。黄标处待你确认。
                </p>
                <h2 style={{ fontSize: 16 }}>一、要解决的技术问题</h2>
                <p>现有磁驱泵在负载突变时超调明显，固定阈值易误报。</p>
                <h2 style={{ fontSize: 16 }}>二、核心技术方案</h2>
                <p>按工况修正异常评分，再调整转速或触发保护。</p>
                <p style={{ background: '#fef3c7', padding: '8px 10px', borderRadius: 8 }}>
                  稳态测试异常识别时间与误报率数据 · 待确认样本与工况
                </p>
              </article>
            </section>
            <aside className="v4-rail">
              <div className="v4-rail-experts" aria-label="专家 1:1">
                {EXEC_PEERS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={peer === n ? 'on' : ''}
                    aria-pressed={peer === n}
                    onClick={() => setPeer(n)}
                  >
                    {n}
                    {n !== '交底书部负责人' ? ' ·1:1' : ''}
                  </button>
                ))}
              </div>
              <button type="button" className="v4-gap-chip" aria-expanded={gapOpen} onClick={() => setGapOpen((v) => !v)}>
                缺项 · {openGaps.length} 项待拍板
                {openGaps.length === 0 ? '（已清）' : '（点开）'}
              </button>
              {gapOpen && (
                <div className="v4-triad">
                  {openGaps.length === 0 ? (
                    <p>没有待拍板缺项。</p>
                  ) : (
                    openGaps.map((g) => (
                      <p key={g.id}>
                        <strong>{g.title}</strong> — {g.why}
                      </p>
                    ))
                  )}
                  {openGaps.length > 0 && (
                    <button className="btn btn-primary" type="button" style={{ marginTop: 8 }} onClick={decideGaps}>
                      拍板确认
                    </button>
                  )}
                </div>
              )}
              <div className="v4-triad">
                <div>
                  <strong>卡点</strong> · {openGaps.length ? '技术效果数据待确认' : '缺项已拍板'}
                </div>
                <div>
                  <strong>下一步</strong> · {openGaps.length ? '访谈专家补工况样本' : '撰写专家继续成稿'}
                </div>
                <div>
                  <strong>谁在干</strong> · {peer}
                </div>
              </div>
              <div className="v4-chat" aria-label={`${peer} 对话`} aria-live="polite">
                <p className="v4-hint" style={{ margin: '0 0 6px' }}>
                  当前：{peer}
                </p>
                {chat.map((m, i) => (
                  <div key={i} className={`bubble ${m.who === 'me' ? 'me' : ''}`}>
                    {m.text}
                  </div>
                ))}
              </div>
              <form
                className="v4-compose"
                onSubmit={(e) => {
                  e.preventDefault()
                  sendChat()
                }}
              >
                <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`跟${peer}说一句…`} aria-label="对话输入" name="chat" autoComplete="off" />
                <button type="submit">发送</button>
              </form>
            </aside>
          </div>
        </div>
      )}

      {profileOpen && (
        <div className="v4-sheet-scrim" role="presentation" onClick={() => setProfileOpen(false)}>
          <div
            className="v4-sheet"
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pf-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <h2 id="pf-title">关于你（可随时补）</h2>
              <button ref={sheetCloseRef} type="button" className="btn btn-ghost" aria-label="关闭" onClick={() => setProfileOpen(false)}>
                关闭
              </button>
            </div>
            <p className="lead">不挡门。补了汇报更准；不补也能上传。</p>
            <div className="v4-field">
              <label htmlFor="pf-role">身份倾向</label>
              <select id="pf-role" name="role" autoComplete="organization-title" value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value, skipped: false })}>
                {['发明人', '代理人', '企业对接', '其他'].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </div>
            <div className="v4-field">
              <label htmlFor="pf-domain">领域 / 技术方向</label>
              <input id="pf-domain" name="domain" autoComplete="off" value={profile.domain} onChange={(e) => setProfile({ ...profile, domain: e.target.value, skipped: false })} placeholder="如：机电控制、生物医药…" />
            </div>
            <div className="v4-field">
              <label htmlFor="pf-ask">当前诉求（可空）</label>
              <textarea id="pf-ask" name="ask" autoComplete="off" value={profile.ask} onChange={(e) => setProfile({ ...profile, ask: e.target.value, skipped: false })} placeholder="一句话即可" />
            </div>
            <div className="v4-field">
              <label htmlFor="pf-has">是否已有在办项目</label>
              <select id="pf-has" name="hasProject" autoComplete="off" value={profile.hasProject} onChange={(e) => setProfile({ ...profile, hasProject: e.target.value, skipped: false })}>
                {['是', '否', '不确定'].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </div>
            <div className="v4-actions">
              <button className="btn btn-primary" type="button" onClick={() => { setProfile((p) => ({ ...p, skipped: false })); setProfileOpen(false) }}>保存</button>
              <button className="btn btn-ghost" type="button" onClick={() => { setProfile((p) => ({ ...p, skipped: true })); setProfileOpen(false) }}>先不填</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
