import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

type Phase = 'profile' | 'home' | 'upload' | 'analyze' | 'report' | 'project' | 'execute'

type Profile = {
  role: string
  domain: string
  ask: string
  hasProject: string
  skipped: boolean
}

type Gap = { id: string; title: string; why: string; blocking: boolean; skipped: boolean }

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

const EXPERTS = DEPARTMENTS.flatMap((d) =>
  d.experts.map((name) => ({
    id: `${d.id}:${name}`,
    name,
    deptId: d.id,
    deptName: d.name,
    ability:
      name === '材料分析专家'
        ? '分析、分类、归档全部上传材料，输出二次画像与缺口'
        : name.includes('访谈')
          ? '追问技术事实，补齐交底输入'
          : name.includes('撰写')
            ? '把研发语言整理成可接力交底书'
            : name.includes('权利要求')
              ? '设计独立与从属权利要求层次'
              : `支撑「${d.name}」完成 ${d.flow.split('→').slice(-1)[0].trim()}`,
  })),
)

const FAKE_PROJECTS = [
  { id: 'RD-2026-017', name: '磁驱泵智能控制', hint: '交底形成中 · 缺权属声明' },
  { id: 'RD-2025-088', name: '储能热管理模块', hint: '已递交实审 · 等待 OA' },
  { id: 'RD-2026-003', name: '视觉分拣夹具', hint: '布局完成 · 未开交底' },
]

const PHASES: { id: Phase; label: string }[] = [
  { id: 'profile', label: 'A 画像' },
  { id: 'home', label: 'B 能力地图' },
  { id: 'upload', label: 'C 上传' },
  { id: 'analyze', label: 'D 分析' },
  { id: 'report', label: 'E 汇报' },
  { id: 'project', label: 'F 项目' },
  { id: 'execute', label: 'G 执行' },
]

function phaseIndex(p: Phase) {
  return PHASES.findIndex((x) => x.id === p)
}

export default function App() {
  const [phase, setPhase] = useState<Phase>('profile')
  const [profile, setProfile] = useState<Profile>({
    role: '发明人',
    domain: '机电控制',
    ask: '',
    hasProject: '不确定',
    skipped: false,
  })
  const [intentDept, setIntentDept] = useState<string | null>(null)
  const [intentExpert, setIntentExpert] = useState<string | null>(null)
  const [files, setFiles] = useState<{ name: string; size: number }[]>([])
  const [analyzePct, setAnalyzePct] = useState(0)
  const [analyzeDone, setAnalyzeDone] = useState(false)
  const [gaps, setGaps] = useState<Gap[]>([])
  const [goalOverride, setGoalOverride] = useState('')
  const [projectChoice, setProjectChoice] = useState<'new' | 'merge' | null>(null)
  const [mergeId, setMergeId] = useState<string | null>(null)
  const [confirmedProject, setConfirmedProject] = useState<{ code: string; name: string } | null>(null)
  const [peer, setPeer] = useState('交底书部负责人')
  const [chat, setChat] = useState<{ who: 'sys' | 'me'; text: string }[]>([
    { who: 'sys', text: '我是本部门负责人。材料分析已归档，缺项在 chip 里；要点开专家可 1:1。' },
  ])
  const [draft, setDraft] = useState('')
  const [gapOpen, setGapOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const intentLabel = useMemo(() => {
    const d = DEPARTMENTS.find((x) => x.id === intentDept)
    const e = EXPERTS.find((x) => x.id === intentExpert)
    if (!d && !e) return '未选部门/专家（可直接上传）'
    return [d ? `部门：${d.name}` : null, e ? `专家：${e.name}` : null].filter(Boolean).join(' · ')
  }, [intentDept, intentExpert])

  const inferredGoal = goalOverride || '写技术交底书（推断置信中等）'
  const support =
    gaps.filter((g) => !g.skipped && g.blocking).length > 0
      ? '不够'
      : gaps.filter((g) => !g.skipped).length > 0
        ? '勉强'
        : '够'

  useEffect(() => {
    if (phase !== 'analyze' || analyzeDone) return
    setAnalyzePct(0)
    let n = 0
    const t = window.setInterval(() => {
      n += 12 + Math.floor(Math.random() * 10)
      if (n >= 100) {
        n = 100
        window.clearInterval(t)
        setAnalyzePct(100)
        setAnalyzeDone(true)
        setGaps([
          {
            id: 'g1',
            title: '权属声明 / 发明人信息',
            why: '交底接力与申请文件需要确认权利主体',
            blocking: false,
            skipped: false,
          },
          {
            id: 'g2',
            title: '稳态工况测试数据原文',
            why: '技术效果段落目前只有摘要，缺原始记录',
            blocking: false,
            skipped: false,
          },
          {
            id: 'g3',
            title: '替代实施方式草图',
            why: '说明书充分公开更稳；可不补先开写',
            blocking: false,
            skipped: false,
          },
        ])
        window.setTimeout(() => setPhase('report'), 450)
      } else setAnalyzePct(n)
    }, 280)
    return () => window.clearInterval(t)
  }, [phase, analyzeDone])

  function toggleDept(id: string) {
    setIntentDept((cur) => (cur === id ? null : id))
  }
  function toggleExpert(id: string) {
    setIntentExpert((cur) => {
      if (cur === id) return null
      const e = EXPERTS.find((x) => x.id === id)
      if (e) setIntentDept(e.deptId)
      return id
    })
  }

  function onFiles(list: FileList | null) {
    if (!list?.length) return
    setFiles((prev) => {
      const next = [...prev]
      Array.from(list).forEach((f) => {
        if (!next.some((x) => x.name === f.name && x.size === f.size)) next.push({ name: f.name, size: f.size })
      })
      return next
    })
  }

  function startAnalyze() {
    if (!files.length) return
    setAnalyzeDone(false)
    setAnalyzePct(0)
    setPhase('analyze')
  }

  function confirmProject() {
    if (projectChoice === 'new') {
      setConfirmedProject({ code: 'RD-2026-NEW', name: files[0]?.name.replace(/\.[^.]+$/, '') || '新开项目' })
      setPhase('execute')
      return
    }
    if (projectChoice === 'merge' && mergeId) {
      const p = FAKE_PROJECTS.find((x) => x.id === mergeId)!
      setConfirmedProject({ code: p.id, name: p.name })
      setPhase('execute')
    }
  }

  function sendChat() {
    const t = draft.trim()
    if (!t) return
    setChat((c) => [...c, { who: 'me', text: t }, { who: 'sys', text: `已收到。${peer}侧记下：${t}` }])
    setDraft('')
  }

  return (
    <div className="v4-shell">
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
            return (
              <span key={s.id} className={cls}>
                {s.label}
              </span>
            )
          })}
        </nav>
      </header>

      {phase !== 'execute' && (
        <main className="v4-main">
          {phase === 'profile' && (
            <div className="v4-card">
              <p className="v4-section-kicker">A · 进应用</p>
              <h1>先初步了解你</h1>
              <p className="lead">第一次画像。可跳过；跳过的话后面汇报会标明「了解不足」。</p>
              <div className="v4-field">
                <label>身份倾向</label>
                <select value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value, skipped: false })}>
                  {['发明人', '代理人', '企业对接', '其他'].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </div>
              <div className="v4-field">
                <label>领域 / 技术方向</label>
                <input value={profile.domain} onChange={(e) => setProfile({ ...profile, domain: e.target.value, skipped: false })} placeholder="如：机电控制、生物医药…" />
              </div>
              <div className="v4-field">
                <label>当前诉求（可空）</label>
                <textarea value={profile.ask} onChange={(e) => setProfile({ ...profile, ask: e.target.value, skipped: false })} placeholder="一句话即可，后面材料还会补" />
              </div>
              <div className="v4-field">
                <label>是否已有在办项目</label>
                <select value={profile.hasProject} onChange={(e) => setProfile({ ...profile, hasProject: e.target.value, skipped: false })}>
                  {['是', '否', '不确定'].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </div>
              <div className="v4-actions">
                <button className="btn btn-primary" type="button" onClick={() => setPhase('home')}>
                  进入首页
                </button>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => {
                    setProfile((p) => ({ ...p, skipped: true }))
                    setPhase('home')
                  }}
                >
                  跳过，稍后再说
                </button>
              </div>
            </div>
          )}

          {phase === 'home' && (
            <div className="v4-card">
              <p className="v4-section-kicker">B · 首页 · 能力地图</p>
              <h1>全部部门与专家</h1>
              <p className="lead">
                部门有预设专家与流程；专家有预设能力。可点选（单选可取消），也可不选直接上传材料。
                {profile.skipped ? ' （画像已跳过，推荐会偏弱）' : ` · 当前画像：${profile.role} / ${profile.domain}`}
              </p>
              <div className="v4-intent">当前意向：{intentLabel}</div>

              <h2>部门</h2>
              <div className="v4-grid" style={{ marginBottom: 22 }}>
                {DEPARTMENTS.map((d) => (
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

              <h2>专家</h2>
              <div className="v4-grid">
                {EXPERTS.map((e) => (
                  <button key={e.id} type="button" className={`v4-tile ${intentExpert === e.id ? 'is-on' : ''}`} onClick={() => toggleExpert(e.id)} aria-pressed={intentExpert === e.id}>
                    <strong>{e.name}</strong>
                    <small>{e.deptName}</small>
                    <small style={{ marginTop: 6 }}>{e.ability}</small>
                  </button>
                ))}
              </div>

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
              <p className="lead">不强制先选部门/专家。至少 1 个文件后进入材料分析。</p>
              <div className="v4-intent">当前意向：{intentLabel}</div>
              <div className="v4-drop">
                <strong>拖入或选择文件</strong>
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
                </div>
                <input ref={fileRef} type="file" multiple hidden onChange={(e) => onFiles(e.target.files)} />
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
              </div>
            </div>
          )}

          {phase === 'analyze' && (
            <div className="v4-card">
              <p className="v4-section-kicker">D · 材料分析 · 二次了解</p>
              <h1>材料分析专家在办</h1>
              <p className="lead">分析 → 分类 → 归档。此步必跑，与是否点选专家无关。归属：综合服务 / 材料组。</p>
              <div className="v4-progress" aria-label="分析进度">
                <i style={{ width: `${analyzePct}%` }} />
              </div>
              <ul className="v4-filelist">
                <li>
                  <span>分析材料语义与专利相关线索</span>
                  <span className="v4-badge">{analyzePct < 35 ? '进行中' : '完成'}</span>
                </li>
                <li>
                  <span>分类：交底 / 证据 / 法律文件 / 杂项</span>
                  <span className="v4-badge">{analyzePct < 65 ? analyzePct >= 35 ? '进行中' : '排队' : '完成'}</span>
                </li>
                <li>
                  <span>归档至待归案材料池</span>
                  <span className="v4-badge">{analyzePct < 100 ? analyzePct >= 65 ? '进行中' : '排队' : '完成'}</span>
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
                  {goalOverride ? '' : ' · 低置信时可纠正'}
                </p>
                <div className="v4-field" style={{ marginTop: 10 }}>
                  <label>纠正目标（可选）</label>
                  <input value={goalOverride} onChange={(e) => setGoalOverride(e.target.value)} placeholder="例如：准备新申请 / 补正 / FTO…" />
                </div>
              </div>

              <div className="v4-report-block">
                <h3>2. 相关部门与专家</h3>
                <p>建议主责：交底书部 · 技术访谈专家 / 交底书撰写专家</p>
                <p style={{ color: '#78716c', fontSize: 13 }}>协作：材料分析专家（已完成归档）· 后续可接申请文件部</p>
                {intentExpert && <p style={{ fontSize: 13 }}>你的意向已记下：{intentLabel}</p>}
              </div>

              <div className="v4-report-block">
                <h3>3. 正常流程</h3>
                <p style={{ fontSize: 14, lineHeight: 1.55 }}>访谈补事实 → 事实齐套 → 形成技术交底书 → 你确认可接力 → 申请文件部继承</p>
              </div>

              <div className="v4-report-block">
                <h3>4. 现有材料支不支持</h3>
                <span className={`v4-badge ${support === '够' ? 'ok' : support === '勉强' ? 'warn' : 'bad'}`}>{support}</span>
                <span style={{ marginLeft: 8, fontSize: 13, color: '#57534e' }}>已分类归档 {files.length} 份 · 可支撑开写交底，效果数据仍偏薄</span>
              </div>

              <div className="v4-report-block">
                <h3>5. 缺什么材料</h3>
                {gaps.map((g) => (
                  <div className="v4-gap" key={g.id}>
                    <p>
                      <strong>{g.title}</strong>
                      <br />
                      <span style={{ color: '#78716c' }}>{g.why}</span>
                      {g.skipped && <span className="v4-badge" style={{ marginLeft: 6 }}>暂不补充</span>}
                    </p>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      style={{ flexShrink: 0 }}
                      onClick={() =>
                        setGaps((arr) => arr.map((x) => (x.id === g.id ? { ...x, skipped: !x.skipped } : x)))
                      }
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

              <div className="v4-grid">
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
                  <p className="v4-section-kicker">可选旧案（假数据）</p>
                  <div className="v4-grid">
                    {FAKE_PROJECTS.map((p) => (
                      <button key={p.id} type="button" className={`v4-tile ${mergeId === p.id ? 'is-on' : ''}`} onClick={() => setMergeId(p.id)} aria-pressed={mergeId === p.id}>
                        <strong>
                          {p.name} <small style={{ display: 'inline' }}>{p.id}</small>
                        </strong>
                        <small>{p.hint}</small>
                      </button>
                    ))}
                  </div>
                  {!mergeId && <p style={{ color: '#9a3412', fontSize: 13, marginTop: 10 }}>请选出要并入的项目，或改选新建。</p>}
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
              </div>
            </div>
          )}
        </main>
      )}

      {phase === 'execute' && confirmedProject && (
        <div>
          <div style={{ padding: '10px 16px', background: '#fafaf9', borderBottom: '1px solid rgba(28,25,23,.08)', fontSize: 13 }}>
            G 执行 · <strong>{confirmedProject.name}</strong> · {confirmedProject.code} · 沿用工作台逻辑（卷宗 / 文书 / 右栏）
            <button className="btn btn-ghost" type="button" style={{ marginLeft: 12 }} onClick={() => setPhase('home')}>
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
            <aside>
              <div className="v4-rail-experts" aria-label="专家">
                {['交底书部负责人', '技术访谈专家', '交底书撰写专家'].map((n) => (
                  <button key={n} type="button" className={peer === n ? 'on' : ''} onClick={() => setPeer(n)}>
                    {n}
                  </button>
                ))}
              </div>
              <button type="button" className="v4-gap-chip" aria-expanded={gapOpen} onClick={() => setGapOpen((v) => !v)}>
                缺项 · {gaps.filter((g) => !g.skipped).length} 项可拍板（点开）
              </button>
              {gapOpen && (
                <div className="v4-triad">
                  {gaps
                    .filter((g) => !g.skipped)
                    .map((g) => (
                      <p key={g.id}>
                        <strong>{g.title}</strong> — {g.why}
                      </p>
                    ))}
                  <button className="btn btn-primary" type="button" style={{ marginTop: 8 }} onClick={() => setGapOpen(false)}>
                    已知晓 / 拍板
                  </button>
                </div>
              )}
              <div className="v4-triad">
                <div>
                  <strong>卡点</strong> · 技术效果数据待确认
                </div>
                <div>
                  <strong>下一步</strong> · 访谈专家补工况样本
                </div>
                <div>
                  <strong>谁在干</strong> · 交底书撰写专家在办
                </div>
              </div>
              <div className="v4-chat" aria-label="对话">
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
                <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`跟${peer}说一句…`} aria-label="对话输入" />
                <button type="submit">发送</button>
              </form>
            </aside>
          </div>
        </div>
      )}
    </div>
  )
}
