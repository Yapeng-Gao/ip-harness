import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Bell, BookOpen, BriefcaseBusiness,
  Building2, Cable, Check, CheckCircle2, ChevronDown, ChevronRight,
  CircleAlert, CircleHelp, Clock3, FileCheck2, FileClock,
  Files, FileText, FlaskConical, FolderKanban, GitBranch, Library,
  Download, Menu, MessageSquareText, MoreHorizontal, Network, Paperclip, PenLine, Plus,
  Rocket, Search, Send, Settings2, ShieldCheck, Sparkles, Stamp, Upload, X,
} from 'lucide-react'
import './App.css'

type Role = 'enterprise' | 'agency'
type Mode = 'assistant' | 'project' | 'studio'
type View = 'home' | 'projects' | 'workbench' | 'assets' | 'departments' | 'messages' | 'clients' | 'studio'
type StudioTab = 'department' | 'experts' | 'skills' | 'prompt' | 'mcp' | 'release'
type ModalType = 'new' | 'handoff' | 'expert' | 'guide' | 'task' | 'review' | null
type ObjectKind = '研发项目' | '申请案件' | '产品风险'
type WorkContext = 'magnetic' | 'storage'
type WorkView = 'collaboration' | 'document'

type DocketBucket = 'input' | 'process' | 'output'
type DocketItem = { id: string; name: string; bucket: DocketBucket; note: string; source: 'seed' | 'upload' }

const FILE_ACCEPT = '.pdf,.doc,.docx,.png,.jpg,.jpeg'
const FILE_ACCEPT_HINT = 'PDF / Word / 图片 / 常见图纸（png、jpg、pdf、docx）'
const FILE_EXT_OK = new Set(['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'])

const seedDocket: DocketItem[] = [
  { id: 'in-1', name: '研发交底草稿.pdf', bucket: 'input', note: '用户材料 · 开案附带', source: 'seed' },
  { id: 'in-2', name: '试验台照片.jpg', bucket: 'input', note: '用户材料 · 补事实', source: 'seed' },
  { id: 'pr-1', name: '访谈纪要 V2.docx', bucket: 'process', note: '交底书部 · 中间稿', source: 'seed' },
  { id: 'pr-2', name: '检索比对摘录.pdf', bucket: 'process', note: '风险排查部 · 中间稿', source: 'seed' },
  { id: 'out-1', name: '交底书 V3.pdf', bucket: 'output', note: '已确认交付 · 可下载', source: 'seed' },
  { id: 'out-2', name: '可专利性检索 R2.pdf', bucket: 'output', note: '已确认交付 · 可下载', source: 'seed' },
]


const departments = [
  { id: 'innovation', name: '创新启发部', stage: '发现', desc: '从技术问题和行业空白出发，激发可实现的创新方向。', experts: ['技术情报专家', 'TRIZ 创新专家'], output: '创新机会清单' },
  { id: 'mining', name: '专利挖掘部', stage: '发现', desc: '跟随研发过程拆解技术方案，识别值得保护的专利点。', experts: ['机械挖掘专家', '电学挖掘专家'], output: '专利点清单' },
  { id: 'strategy', name: '布局策略部', stage: '规划', desc: '结合产品、市场和竞争对手，设计核心与外围专利组合。', experts: ['布局策略专家', '竞品分析专家'], output: '专利布局图' },
  { id: 'risk', name: '风险排查部', stage: '规划', desc: '分别开展可专利性检索与 FTO 分析，支持规避设计。', experts: ['检索分析专家', 'FTO 法律专家'], output: '风险比对报告' },
  { id: 'disclosure', name: '交底书部', stage: '形成', desc: '通过追问补齐技术事实，把研发语言整理成完整交底材料。', experts: ['技术访谈专家', '交底书撰写专家'], output: '技术交底书' },
  { id: 'drafting', name: '申请文件部', stage: '申请', desc: '设计权利要求层次，完成说明书、摘要与附图说明。', experts: ['权利要求专家', '说明书撰写专家'], output: '申请文件包' },
  { id: 'quality', name: '质量审查部', stage: '申请', desc: '核查支持、清楚、充分公开、一致性与修改超范围风险。', experts: ['质检专家', '前审查员顾问'], output: '质量核查单' },
  { id: 'oa', name: 'OA 答复部', stage: '审查', desc: '拆解审查意见，比对证据，形成修改和意见陈述策略。', experts: ['OA 策略专家', '创造性争辩专家'], output: '审查意见答复包' },
  { id: 'procedure', name: '流程事务部', stage: '审查', desc: '管理递交、公布、实审、登记、期限与官方文件。', experts: ['流程管理专家', '期限监控专家'], output: '官方事务台账' },
  { id: 'asset', name: '资产运营部', stage: '运营', desc: '评估维持、许可、转让、维权和竞品监控机会。', experts: ['资产运营专家', '许可谈判顾问'], output: '资产运营建议' },
]

const projects: Array<{
  name: string; code: string; kind: ObjectKind; stage: string; dept: string;
  owner: string; date: string; progress: number; relation: string
}> = [
  { name: '磁驱泵智能控制系统', code: 'RD-2026-017', kind: '研发项目', stage: '交底书完善', dept: '交底书部', owner: '陈宇', date: '今天 14:30', progress: 42, relation: '2 个专利点 · 1 件申请' },
  { name: '低能耗膜分离清洗控制方法', code: 'CN202610483217.6', kind: '申请案件', stage: '第一次 OA 答复', dept: 'OA 答复部', owner: '周敏', date: '剩余 18 天', progress: 68, relation: 'RD-2026-011' },
  { name: '模块化储能热管理装置', code: 'CN202610512086.4', kind: '申请案件', stage: '申请文件质检', dept: '质量审查部', owner: '王工', date: '10 月 28 日', progress: 81, relation: 'RD-2026-006' },
  { name: '高速视觉检测设备', code: 'FTO-2026-009', kind: '产品风险', stage: '高风险待决策', dept: '风险排查部', owner: '许清', date: '11 月 03 日', progress: 55, relation: '产品 V2.3 · 中国上市' },
  { name: '模块化储能热管理', code: 'RD-2026-006', kind: '研发项目', stage: '布局已确认', dept: '布局策略部', owner: '王工', date: '11 月 08 日', progress: 76, relation: '2 件申请案件' },
]

const assets = [
  { id: 'CN118420091A', name: '一种磁驱泵的故障预测方法', type: '发明专利', status: '实质审查', product: 'MP-300', date: '2027-04-18', level: '核心' },
  { id: 'CN116820442B', name: '一种泵体密封结构', type: '发明专利', status: '已授权', product: 'MP-200', date: '2027-02-06', level: '核心' },
  { id: 'CN223109082U', name: '一种模块化散热组件', type: '实用新型', status: '已授权', product: 'ES-100', date: '2027-01-22', level: '外围' },
  { id: 'CN117912730A', name: '一种膜组件清洗控制方法', type: '发明专利', status: '公布', product: 'MS-20', date: '2027-03-11', level: '储备' },
]

const docTabs = ['交底书 V3', '检索报告', '权利要求草案', '审批记录']
const storageTabs = ['权利要求草案', '说明书质检', '检索报告', '审批记录']
const agencyTabs = ['意见陈述书', '权利要求修改对照', '审查意见原文', '证据比对表']

function BrandWordmark({ onClick, className = '', ariaLabel = 'Novada Team' }: { onClick?: () => void; className?: string; ariaLabel?: string }) {
  const cls = `brand brand-wordmark ${className}`.trim()
  const inner = <span className="brand-lockup" aria-hidden="true"><span className="brand-novada">Novada</span><span className="brand-team">Team</span></span>
  if (onClick) {
    return <button type="button" className={cls} onClick={onClick} aria-label={ariaLabel}>{inner}</button>
  }
  return <div className={cls} aria-label={ariaLabel}>{inner}</div>
}

function Avatar({ name, small = false, human = false }: { name: string; small?: boolean; human?: boolean }) {
  return <span className={`avatar ${small ? 'avatar-small' : ''} ${human ? 'avatar-human' : ''}`} aria-label={name}>{name.slice(0, 1)}</span>
}

function Status({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'orange' | 'green' | 'red' }) {
  return <span className={`status status-${tone}`}><span className="status-dot" />{children}</span>
}

function Modal({ title, subtitle, children, onClose, wide = false }: { title: string; subtitle?: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    ref.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
      <div className="modal-head"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button className="icon-btn" onClick={onClose} aria-label="关闭"><X size={19} /></button></div>
      {children}
    </div>
  </div>
}

function MarketingSite({ onEnter, onLogin }: { onEnter: () => void; onLogin: () => void }) {
  const [step, setStep] = useState(0)
  const steps = [
    { label: '提出目标', dept: '顾言 · 知产负责人', title: '“整理磁驱泵控制技术，形成申请方案。”', note: '识别研发项目、申请目标与关键约束', task: '建立项目并推荐交底、检索与申请路径', output: '工作计划 P1', confirm: '确认目标与推进路径' },
    { label: '交底完善', dept: '交底书部', title: '技术访谈专家补齐事实，撰写专家形成文本。', note: '主责与协作专家围绕同一交付物工作', task: '整理控制顺序、技术效果与替代实施方式', output: '技术交底书 V3', confirm: '确认测试数据与量产方案' },
    { label: '事实确认', dept: '企业研发 · 陈宇', title: '你只处理必须由自己判断的技术事实。', note: '确认绑定依据、文书位置、版本与影响', task: '核对 2.5 kW 稳态工况下的测试记录', output: '交底书 V4 · 已确认快照', confirm: '确认后允许下一部门接力' },
    { label: '申请起草', dept: '申请文件部', title: '权利要求与说明书专家继承已确认事实。', note: '只继承本节点所需事实、证据与决策', task: '设计独立权利要求与从属保护层次', output: '申请文件草案 V1', confirm: '确认保护范围与申请策略' },
    { label: '复核交付', dept: '林岚 · 专利代理师', title: '真实代理师复核，形成可追踪交付。', note: 'AI 起草，真人复核，对外动作由人确认', task: '核查支持关系、保护范围与全文一致性', output: '申请文件包 · 复核版', confirm: '确认交付，绝不自动递交' },
  ]
  const current = steps[step]
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  return <div className="marketing-site">
    <a className="skip-link" href="#site-main">跳到主内容</a>
    <header className="site-nav"><BrandWordmark className="site-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} /><nav><button onClick={() => scrollTo('how-it-works')}>如何工作</button><button onClick={() => scrollTo('business-lines')}>业务能力</button><button onClick={() => scrollTo('trust-system')}>可信机制</button></nav><div><button className="site-login" onClick={onLogin}>登录</button><button className="btn btn-ink" onClick={onEnter}>体验产品<ArrowRight size={15} /></button></div></header>
    <main id="site-main">
      <section className="site-hero"><div className="site-hero-copy"><span className="site-eyebrow"><span />Novada Team · 专业接力</span><h1>尽快把专利<br />申下来。</h1><p>告诉目标，顾言组织专业部门按节点接力——从交底到申请与审查。执行看得见，关键节点由你确认。虚拟知产公司只是组织方式，不是你要去运营的公司。</p><div className="site-hero-actions"><button className="btn btn-primary" onClick={onEnter}>进入产品体验<ArrowRight size={16} /></button><button className="btn site-text-button" onClick={() => scrollTo('how-it-works')}>看一次部门接力<ChevronRight size={16} /></button></div><small>中国发明专利为主，兼容实用新型 · 企业研发与代理所双端</small></div>
        <div className="hero-product" aria-label="Novada Team 产品界面示意"><div className="hero-product-bar"><span><i /><i /><i /></span><strong>Novada Team</strong><em>演示项目</em></div><div className="hero-product-body"><aside><span className="project-glyph">MP</span><strong>磁驱泵智能控制</strong><small>RD-2026-017</small><div><span className="active">首页</span><span>项目</span><span>部门</span></div></aside><section><div className="hero-lead"><Avatar name="顾" /><div><strong>顾言 · 知产负责人</strong><p>交底书部已完成文本，现有一项技术事实需要你确认。</p></div></div><div className="hero-flow"><span className="done"><Check size={12} />挖掘布局</span><i /><span className="active">交底形成</span><i /><span>申请文件</span><i /><span>质量审查</span></div><div className="hero-task"><span className="section-kicker">当前负责部门</span><h3>交底书部</h3><div><Avatar name="访" small /><span><strong>技术访谈专家</strong><small>6 项访谈整理已完成</small></span><Status tone="green">已完成</Status></div><div><Avatar name="写" small /><span><strong>交底书撰写专家</strong><small>V4 等待测试事实确认</small></span><Status tone="orange">进行中</Status></div></div></section><aside className="hero-confirm"><Status tone="orange">需要你确认</Status><h3>异常识别测试数据是否与记录一致？</h3><p>影响交底书 V4 的技术效果记载。</p><span><FileText size={14} />交底书 V3 · 三、技术效果</span><button onClick={onEnter}>查看依据并确认<ArrowRight size={13} /></button></aside></div></div>
      </section>

      <section className="site-problem"><span className="site-section-index">01 / 为什么需要专业接力</span><div><h2>你缺的不是又一个写作工具，<br />而是有人把整件事持续负责下去。</h2><div className="problem-lines"><p><span>研发人员</span>不必先懂专利流程，也不必学习如何搭建 Agent。</p><p><span>专业团队</span>不必在聊天、文件和邮件里反复寻找事实与版本。</p><p><span>企业负责人</span>不必盯着每个任务，只需处理关键事实、风险与决策。</p></div></div></section>

      <section className="site-workflow" id="how-it-works"><div className="site-section-head"><div><span className="site-section-index">02 / 一次真实接力</span><h2>从一句研发目标，<br />到一份可复核的申请文件。</h2></div><p>点击节点，看看顾言如何组织部门，<br />以及你在哪里参与。</p></div><div className="workflow-tabs" role="tablist" aria-label="部门接力演示" onKeyDown={e => { if (e.key === 'ArrowRight') { e.preventDefault(); setStep(s => (s + 1) % steps.length) } if (e.key === 'ArrowLeft') { e.preventDefault(); setStep(s => (s - 1 + steps.length) % steps.length) } }}>{steps.map((s, i) => <button role="tab" aria-selected={step === i} tabIndex={step === i ? 0 : -1} className={step === i ? 'active' : ''} key={s.label} onClick={() => setStep(i)}><span>{String(i + 1).padStart(2, '0')}</span><strong>{s.label}</strong><small>{s.dept}</small></button>)}</div><div className="workflow-stage"><div className="workflow-stage-top"><span className="live-dot" /><strong>磁驱泵智能控制系统</strong><span>节点 {step + 1} / 5</span></div><div className="workflow-stage-grid"><section><span className="section-kicker">当前工作现场</span><h3>{current.title}</h3><p>{current.note}</p><div className="stage-task"><Network size={18} /><span><small>正在执行</small><strong>{current.task}</strong></span></div><div className="stage-output"><FileCheck2 size={18} /><span><small>节点交付</small><strong>{current.output}</strong></span></div></section><aside><Avatar name={step === 2 ? '陈' : step === 4 ? '林' : '顾'} human={step === 2 || step === 4} /><span className="section-kicker">{current.dept}</span><h3>{current.confirm}</h3><p>所有动作都保留任务、依据、版本与确认记录。</p><button onClick={onEnter}>在原型中继续<ArrowRight size={14} /></button></aside></div></div></section>

      <section className="site-business" id="business-lines"><div className="site-section-head dark-text"><div><span className="site-section-index">03 / 两条业务主线</span><h2>既形成自己的权利，<br />也管理实施他人的风险。</h2></div></div><div className="business-track"><span>01</span><div><h3>权利形成</h3><p>创新启发 → 专利挖掘 → 布局策略 → 技术交底 → 可专利性检索 → 申请文件 → 质量审查 → OA 答复 → 授权运营</p></div><button onClick={onEnter}>从研发成果开始<ArrowUpRight size={16} /></button></div><div className="business-track"><span>02</span><div><h3>风险防控</h3><p>产品拆解 → FTO 检索 → 有效权利要求比对 → 风险分级 → 规避设计／无效评估／许可 → 变更复核</p></div><button onClick={onEnter}>从产品上市开始<ArrowUpRight size={16} /></button></div><p className="business-note"><CircleAlert size={17} />可专利性检索回答“能否获得专利”；FTO 回答“特定产品、地区和时间实施，是否可能落入他人权利要求”。两者不会混为一谈。</p></section>

      <section className="site-audience"><div className="audience-intro"><span className="site-section-index">04 / 双端与三种深度</span><h2>同一套专业接力，<br />适合不同的工作方式。</h2></div><div className="audience-columns"><section><Building2 size={25} /><h3>企业研发端</h3><p>只面对顾言和必须处理的事项。技术事实、保护范围和风险由你确认，专业过程按需展开。</p><span>事项 · 事实 · 决策 · 资产</span></section><section><BriefcaseBusiness size={25} /><h3>代理所端</h3><p>以期限、卷宗、证据和文书组织专业生产，保留内部质检与客户交付的权限边界。</p><span>案件 · 文书 · 复核 · 交付</span></section></div><div className="depth-line"><div><strong>首页</strong><span>委托与跨案待办</span></div><ArrowRight size={18} /><div><strong>项目</strong><span>对象列表与工作台</span></div><ArrowRight size={18} /><div><strong>部门</strong><span>花名册与工作室配置</span></div></div></section>

      <section className="site-trust" id="trust-system"><span className="site-section-index">05 / 可信交付</span><h2>专业，不来自角色数量。<br />来自每一步都能被核查。</h2><div className="trust-grid"><div><strong>01</strong><h3>执行可见</h3><p>展示任务、动作摘要和产出，不展示模型原始思维过程。</p></div><div><strong>02</strong><h3>依据可追</h3><p>结论关联事实、证据、文书位置和具体版本。</p></div><div><strong>03</strong><h3>权限受控</h3><p>三类空间隔离，跨组织只共享确认的交付快照。</p></div><div><strong>04</strong><h3>人来决策</h3><p>AI 起草与辅助判断，真实人员复核，关键节点由人确认。</p></div></div></section>

      <section className="site-final"><span>你的下一件专利工作</span><h2>不必先学会专利流程。<br />先告诉顾言，你想推进什么。</h2><div><button className="btn btn-primary" onClick={onEnter}>体验 Novada Team<ArrowRight size={16} /></button><button className="btn site-text-button" onClick={onLogin}>选择演示身份登录</button></div><p>原型使用虚构演示数据，不提供真实申请、授权承诺或官方递交。</p></section>
    </main><footer className="site-footer"><div className="brand-copy brand-footer"><span className="brand-lockup"><span className="brand-novada">Novada</span><span className="brand-team">Team</span></span><small>尽快申专利 · 专业接力 · 可信交付</small></div><span>产品高保真交互原型 · V0.5</span></footer>
  </div>
}

function LoginPage({ role, onRole, firstRun, onFirstRun, onEnter, onBack }: { role: Role; onRole: (r: Role) => void; firstRun: boolean; onFirstRun: (v: boolean) => void; onEnter: () => void; onBack: () => void }) {
  return <div className="login-page"><a className="skip-link" href="#login-main">跳到主内容</a><header><BrandWordmark className="site-brand" onClick={onBack} /><button className="text-btn" onClick={onBack}><ArrowLeft size={15} />返回官网</button></header><main id="login-main"><section className="login-context"><span className="site-eyebrow"><span />进入你的 Novada Team 工作空间</span><h1>继续推进工作，<br />而不是重新开始。</h1><p>项目、案件、文书、证据、版本与确认记录，都在同一个业务底座中延续。</p><div><ShieldCheck size={19} /><span><strong>身份决定空间，模式决定使用深度</strong><small>企业与代理所看到的是各自权限内的工作。</small></span></div></section><section className="login-panel"><div><span className="section-kicker">演示身份登录</span><h2>选择你的工作台</h2><p>首版原型以演示身份进入，不采集账户信息。</p></div><div className="login-role-options" role="group" aria-label="演示身份"><button className={role === 'enterprise' ? 'active' : ''} aria-pressed={role === 'enterprise'} onClick={() => onRole('enterprise')}><Building2 size={22} /><span><strong>企业研发</strong><small>澄明科技 · 陈宇</small></span>{role === 'enterprise' && <CheckCircle2 size={18} />}</button><button className={role === 'agency' ? 'active' : ''} aria-pressed={role === 'agency'} onClick={() => onRole('agency')}><BriefcaseBusiness size={22} /><span><strong>代理所</strong><small>衡知代理 · 林岚</small></span>{role === 'agency' && <CheckCircle2 size={18} />}</button></div><div className="login-state"><span>演示首页状态</span><div role="group" aria-label="演示首页状态"><button className={!firstRun ? 'active' : ''} aria-pressed={!firstRun} onClick={() => onFirstRun(false)}>已有工作</button><button className={firstRun ? 'active' : ''} aria-pressed={firstRun} onClick={() => onFirstRun(true)}>首次使用</button></div><p>{firstRun ? '从空白工作区开始，不展示虚构项目进度。' : '查看跨项目待办、进展与最近交付。'}</p></div><button className="btn btn-primary full-btn login-enter" onClick={onEnter}>进入{role === 'enterprise' ? '企业研发' : '代理所'}工作区<ArrowRight size={16} /></button><small className="login-disclaimer">静态原型 · 演示身份不代表真实登录、租户隔离或云端权限体系</small></section></main></div>
}

export default function App() {
  const [surface, setSurface] = useState<'site' | 'login' | 'app'>('site')
  const [firstRun, setFirstRun] = useState(false)
  const [role, setRole] = useState<Role>('enterprise')
  const [mode, setMode] = useState<Mode>('assistant')
  const [view, setView] = useState<View>('home')
  const [activeDoc, setActiveDoc] = useState('交底书 V3')
  const [activeDept, setActiveDept] = useState('disclosure')
  const [modal, setModal] = useState<ModalType>(null)
  const [toast, setToast] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [mobileNav, setMobileNav] = useState(false)
  const [handedOff, setHandedOff] = useState(false)
  const [customExperts, setCustomExperts] = useState<string[]>([])
  const [chat, setChat] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [saved, setSaved] = useState(true)
  const [projectFilter, setProjectFilter] = useState('')
  const [objectFilter, setObjectFilter] = useState<'全部对象' | ObjectKind>('全部对象')
  const [noticeOpen, setNoticeOpen] = useState(false)
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const [messagesOpen, setMessagesOpen] = useState(false)
  const [activeProjectCode, setActiveProjectCode] = useState<string | null>('RD-2026-017')
  const [projectPickerOpen, setProjectPickerOpen] = useState(false)
  const [showProcess, setShowProcess] = useState(false)
  const [workContext, setWorkContext] = useState<WorkContext>('magnetic')
  const [leadInput, setLeadInput] = useState('')
  const [leadRequest, setLeadRequest] = useState('')
  const [studioTab, setStudioTab] = useState<StudioTab>('department')
  const [mcpEnabled, setMcpEnabled] = useState(['专利文献检索', '案件与期限管理'])
  const [prompt, setPrompt] = useState('先核对输入事实与证据来源，再开始起草。不得补造技术效果；涉及保护范围、法律结论和对外递交时，必须提交真实人员确认。')
  const [testPassed, setTestPassed] = useState(false)
  const [published, setPublished] = useState(false)
  const [workView, setWorkView] = useState<WorkView>('collaboration')
  const [factConfirmed, setFactConfirmed] = useState(false)
  const [nodeConfirmed, setNodeConfirmed] = useState(false)
  const [docket, setDocket] = useState<DocketItem[]>(seedDocket)
  const [composeFiles, setComposeFiles] = useState<{ id: string; name: string }[]>([])
  const [newCaseFiles, setNewCaseFiles] = useState<{ id: string; name: string }[]>([])
  const [assetBucket, setAssetBucket] = useState<DocketBucket | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const newCaseInputRef = useRef<HTMLInputElement>(null)
  const uploadTargetRef = useRef<'compose' | 'docket' | 'newcase'>('compose')

  const notify = (text: string) => { setToast(text); window.setTimeout(() => setToast(''), 2800) }
  const navigate = (next: View) => {
    setProjectPickerOpen(false)
    if (next === 'messages') {
      setMode('assistant')
      setView('home')
      setMessagesOpen(true)
      setMobileNav(false); setNoticeOpen(false)
      return
    }
    if (next === 'departments' || next === 'studio') {
      setMode('studio')
      setView('studio')
      setMobileNav(false); setNoticeOpen(false)
      return
    }
    if (next === 'home') setMode('assistant')
    else if (!['home', 'studio'].includes(next)) setMode('project')
    setView(next); setMobileNav(false); setNoticeOpen(false); setMessagesOpen(false)
  }
  const switchMode = (next: Mode) => {
    if (firstRun && next !== 'assistant') { setFirstRun(false); notify('已切换至已有工作演示') }
    setMode(next)
    if (next === 'studio') setView('studio')
    else if (next === 'project') setView(role === 'enterprise' ? 'projects' : 'clients')
    else setView('home')
    setMobileNav(false); setNoticeOpen(false); setMessagesOpen(false); setProjectPickerOpen(false)
  }
  const openWorkbench = (oa = false, context: WorkContext = 'magnetic') => {
    setWorkContext(context)
    setActiveDoc(oa ? '意见陈述书' : context === 'storage' ? '权利要求草案' : handedOff ? '权利要求草案' : '交底书 V3')
    setActiveDept(oa ? 'oa' : context === 'storage' ? 'quality' : handedOff ? 'drafting' : 'disclosure')
    setActiveProjectCode(oa ? 'CN202610483217.6' : context === 'storage' ? 'CN202610512086.4' : 'RD-2026-017')
    setFactConfirmed(false)
    setNodeConfirmed(false)
    setWorkView('collaboration')
    setProjectPickerOpen(false)
    navigate('workbench')
  }
  const selectActiveProject = (project: (typeof projects)[number]) => {
    setActiveProjectCode(project.code)
    setProjectPickerOpen(false)
    if (project.kind === '产品风险') {
      setActiveDept('risk')
      notify(`已切换至 ${project.name}`)
      return
    }
    const oa = project.stage.includes('OA')
    const ctx: WorkContext = project.code === 'CN202610512086.4' || project.code === 'RD-2026-006' ? 'storage' : 'magnetic'
    setWorkContext(oa ? 'magnetic' : ctx)
    setActiveDoc(oa ? '意见陈述书' : ctx === 'storage' ? '权利要求草案' : handedOff ? '权利要求草案' : '交底书 V3')
    setActiveDept(oa ? 'oa' : ctx === 'storage' ? 'quality' : handedOff ? 'drafting' : 'disclosure')
    notify(`已切换至 ${project.name}`)
  }
  const openProject = (project: (typeof projects)[number]) => {
    setActiveProjectCode(project.code)
    if (project.kind === '产品风险') { setActiveDept('risk'); setModal('task'); return }
    openWorkbench(project.stage.includes('OA'), project.code === 'CN202610512086.4' || project.code === 'RD-2026-006' ? 'storage' : 'magnetic')
  }
  const openDocument = (doc?: string) => {
    if (doc) setActiveDoc(doc)
    setWorkView('document')
    navigate('workbench')
  }
  const switchRole = (next: Role) => { setRole(next); navigate(mode === 'studio' ? 'studio' : 'home'); setHandedOff(false); setChat([]); setShowProcess(false); setFactConfirmed(false); setNodeConfirmed(false) }
  const currentDept = departments.find(d => d.id === activeDept) ?? departments[4]
  const oaMode = agencyTabs.includes(activeDoc)
  const processVisible = role === 'agency' || showProcess
  const storageMode = workContext === 'storage' && !oaMode
  const workTabs = oaMode ? agencyTabs : storageMode ? storageTabs : docTabs
  const workMeta = oaMode
    ? { glyph: 'MS', name: '低能耗膜分离清洗控制方法', code: 'CN202610483217.6', status: '第一次 OA 答复', object: '申请案件状态' }
    : storageMode
      ? { glyph: 'ES', name: '模块化储能热管理装置', code: 'CN202610512086.4', status: '申请文件质检', object: '申请案件状态' }
      : { glyph: 'MP', name: '磁驱泵智能控制系统', code: 'RD-2026-017', status: handedOff ? '申请文件起草' : '交底书完善', object: '研发项目状态' }
  const activeProject = projects.find(p => p.code === activeProjectCode) ?? null
  // 跨案面（首页/部门）不挂顶栏当前项目；真切换器只在项目列表壳 / 工作台（及代理端客户与案件）
  const showProjectPicker = view === 'workbench' || view === 'projects' || view === 'clients'
  const contextLabel = view === 'workbench'
    ? (oaMode || storageMode ? '当前案件' : '当前项目')
    : role === 'enterprise' ? '当前项目' : '当前客户'
  const contextName = view === 'workbench'
    ? workMeta.name
    : activeProject
      ? (role === 'agency' ? `澄明科技 · ${activeProject.name}` : activeProject.name)
      : null
  const scopeText = oaMode && role === 'enterprise'
    ? '双方共享空间 · 代理所私有过程不可见'
    : role === 'agency'
      ? '代理所私有空间 · 客户仅见交付快照'
      : '企业私有空间 · 确认交付后方可共享'
  const leadPlan = /审查|OA|答复/i.test(leadRequest)
    ? { dept: 'OA 答复部', text: '先核对通知书、申请文本与答复期限，再形成修改和意见陈述策略。', kind: 'oa' }
    : /FTO|上市|风险|侵权/i.test(leadRequest)
      ? { dept: '风险排查部', text: '先明确产品方案、目标市场与上市时间，再开展有效权利要求比对。', kind: 'risk' }
      : { dept: '交底书部', text: '先由技术访谈专家补齐事实，再组织检索、布局与申请文件起草。', kind: 'new' }
  const submitLead = (e: React.FormEvent) => {
    e.preventDefault()
    if (leadInput.trim()) setLeadRequest(leadInput.trim())
  }
  const startLeadPlan = () => {
    setFirstRun(false)
    if (leadPlan.kind === 'risk') { setActiveDept('risk'); setModal('task') }
    else if (leadPlan.kind === 'oa') openWorkbench(true)
    else openWorkbench(false)
  }
  const filteredProjects = projects.filter(p =>
    (objectFilter === '全部对象' || p.kind === objectFilter) &&
    (p.name.includes(projectFilter) || p.code.toLowerCase().includes(projectFilter.toLowerCase()))
  )
  const collab = oaMode ? {
    node: 'OA 答复策略形成',
    department: 'OA 答复部',
    goal: '在剩余 18 天内形成可复核、可交付的第一次审查意见答复包',
    plan: ['核对通知书与期限', '比对 D1 / D2 证据', '形成修改与争辩策略', '代理师复核并交付'],
    tasks: [
      ['OA 策略专家', '主责专家', '已完成', '将审查争议拆解为 3 个特征组，形成有限修改方案。'],
      ['创造性争辩专家', '协作专家', '进行中', '补强温差与跨膜压差双参数联动的非显而易见性论证。'],
      ['林岚 · 专利代理师', '真实人员复核', '待复核', '核查修改依据、保护范围与对外答复口径。'],
    ],
    deliverable: '意见陈述书 V2', deliverableDoc: '意见陈述书', deliverableNote: '含修改说明与创造性争辩，等待事实确认和代理师复核',
    evidence: '证据比对表 E3', evidenceDoc: '证据比对表',
    factTitle: '确认量产方案采用双参数联动', factDetail: '实际清洗控制是否同时依据入口／出口温差与跨膜压差动态调整清洗时长？',
    source: '权利要求修改对照 V2 · 权利要求 1', sourceDoc: '权利要求修改对照',
    impact: '决定独立权利要求的修改范围；确认后进入答复策略复核，不会自动递交。',
    nextDept: '代理师复核与客户确认',
    nodes: [['申请文件', 'done'], ['审查意见', 'done'], ['OA 答复', 'active'], ['客户确认', 'next'], ['递交归档', 'next']],
  } : storageMode ? {
    node: '申请文件质量审查',
    department: '质量审查部',
    goal: '消除文本一致性问题，确认申请文件覆盖量产方案后进入递交复核',
    plan: ['读取申请文件 V4', '核查支持与一致性', '确认量产方案覆盖', '形成质检交付快照'],
    tasks: [
      ['质量审查专家', '主责专家', '已完成', '完成引用关系、支持、充分公开与一致性核查。'],
      ['权利要求专家', '协作专家', '进行中', '核对权利要求 6 的温度参数范围与实施例。'],
      ['林岚 · 专利代理师', '真实人员复核', '待复核', '复核两项遗留问题及最终申请策略。'],
    ],
    deliverable: '权利要求草案 V4', deliverableDoc: '权利要求草案', deliverableNote: '装置与方法双层保护，关联说明书质检 Q2',
    evidence: '说明书质检 Q2', evidenceDoc: '说明书质检',
    factTitle: '确认量产装置的分流控制方式', factDetail: '量产装置是否根据各模组温度分区之间的温差，自动调整对应分流道开度？',
    source: '权利要求草案 V4 · 权利要求 1 与 6', sourceDoc: '权利要求草案',
    impact: '影响装置独立权利要求能否覆盖量产方案；确认后完成质检复核，不会自动递交。',
    nextDept: '递交复核与客户确认',
    nodes: [['交底与检索', 'done'], ['申请文件', 'done'], ['质量审查', 'active'], ['递交复核', 'next'], ['审查答复', 'next']],
  } : {
    node: handedOff ? '申请文件起草' : '交底事实完善',
    department: handedOff ? '申请文件部' : '交底书部',
    goal: handedOff ? '基于已确认交底事实设计权利要求层次，形成申请文件草案' : '补齐技术事实与证据，形成可供申请文件部接手的交底书',
    plan: handedOff ? ['继承交底书 V4', '设计权利要求层次', '同步撰写说明书', '研发确认保护范围'] : ['读取研发资料', '访谈补齐技术事实', '检索对照与撰写', '研发确认并接力'],
    tasks: handedOff ? [
      ['权利要求专家', '主责专家', '进行中', '基于异常评分自适应修正设计独立权利要求。'],
      ['说明书撰写专家', '协作专家', '进行中', '同步实施例、替代方式与附图说明，保持全文一致。'],
      ['林岚 · 专利代理师', '真实人员复核', '待复核', '复核保护层次、支持关系与申请策略。'],
    ] : [
      ['技术访谈专家', '主责专家', '已完成', '把研发描述整理为处理顺序、技术效果和替代实施方式。'],
      ['交底书撰写专家', '协作专家', '进行中', '形成交底书 V4，等待测试样本与工况确认。'],
      ['林岚 · 专利代理师', '真实人员复核', '待复核', '核查申请价值与后续权利要求设计空间。'],
    ],
    deliverable: handedOff ? '权利要求草案 V1' : '交底书 V3', deliverableDoc: handedOff ? '权利要求草案' : '交底书 V3',
    deliverableNote: handedOff ? '3 项方法权利要求已形成，说明书同步撰写中' : '方案与效果已撰写，仍有 1 项技术事实待确认',
    evidence: handedOff ? '交底书 V4 · 已确认快照' : '可专利性检索 R2', evidenceDoc: handedOff ? '交底书 V3' : '检索报告',
    factTitle: handedOff ? '确认独权覆盖 MP-300 量产方案' : '确认异常识别测试事实',
    factDetail: handedOff ? '量产控制器是否均按运行工况修正初始异常评分，并在满足条件时调整运行参数？' : '2.5 kW 稳态工况下，识别时间由 18 秒降至 11.7 秒、误报率由 8.2% 降至 3.1%，样本与测试记录是否一致？',
    source: handedOff ? '权利要求草案 V1 · 权利要求 1' : '交底书 V3 · 三、达到的技术效果', sourceDoc: handedOff ? '权利要求草案' : '交底书 V3',
    impact: handedOff ? '决定独立权利要求是否覆盖实际产品；确认后提交代理师复核。' : '确认后写入交底书 V4，并作为后续权利要求设计依据；不会自动对外共享。',
    nextDept: handedOff ? '质量审查部' : '申请文件部',
    nodes: handedOff ? [['挖掘布局', 'done'], ['交底形成', 'done'], ['申请文件', 'active'], ['质量审查', 'next'], ['审查答复', 'next']] : [['挖掘布局', 'done'], ['交底形成', 'active'], ['申请文件', 'next'], ['质量审查', 'next'], ['审查答复', 'next']],
  }

  const openFilePicker = (target: 'compose' | 'docket' | 'newcase' = 'compose') => {
    uploadTargetRef.current = target
    if (target === 'newcase') newCaseInputRef.current?.click()
    else fileInputRef.current?.click()
  }
  const ingestFiles = (list: FileList | null, target: 'compose' | 'docket' | 'newcase') => {
    if (!list?.length) return
    const accepted: { id: string; name: string }[] = []
    const rejected: string[] = []
    Array.from(list).forEach((file, i) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      if (!FILE_EXT_OK.has(ext)) { rejected.push(file.name); return }
      accepted.push({ id: `${Date.now()}-${i}-${file.name}`, name: file.name })
    })
    if (rejected.length) notify(`未支持格式已跳过：${rejected.slice(0, 2).join('、')}${rejected.length > 2 ? '…' : ''}（${FILE_ACCEPT_HINT}）`)
    if (!accepted.length) return
    const nodeLabel = `${workMeta.code} · ${collab.node}`
    if (target === 'newcase') {
      setNewCaseFiles(v => [...v, ...accepted])
      notify(`已附首包 ${accepted.length} 个文件 · ${FILE_ACCEPT_HINT}`)
      return
    }
    setComposeFiles(v => [...v, ...accepted])
    setDocket(v => [
      ...accepted.map(f => ({
        id: f.id,
        name: f.name,
        bucket: 'input' as DocketBucket,
        note: `用户上传 · ${nodeLabel}`,
        source: 'upload' as const,
      })),
      ...v,
    ])
    notify(`已关联到当前项目与节点：${accepted.map(a => a.name).join('、')}（输入材料）`)
  }
  const downloadDemo = (filename: string) => {
    const outName = `${filename.replace(/\.(pdf|docx|doc|png|jpe?g)$/i, '') || 'deliverable'}.txt`
    const blob = new Blob([`Novada Team 演示导出\n文件：${filename}\n项目：${workMeta.name}（${workMeta.code}）\n节点：${collab.node}\n说明：原型演示文件，非真实官方文书。\n`], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = outName
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    notify(`已开始下载演示文件：${outName}`)
  }
  const openAssetBucket = (bucket: DocketBucket) => {
    const labels = { input: '输入', process: '过程', output: '产物' } as const
    const items = docket.filter(d => d.bucket === bucket)
    setAssetBucket(prev => {
      if (prev === bucket) {
        notify(`${labels[bucket]}已收起`)
        return null
      }
      notify(`${labels[bucket]} · ${items.length} 项已展开`)
      return bucket
    })
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(v => !v) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
  const enterpriseNav = [
    { id: 'projects' as View, label: '项目与对象', icon: FolderKanban, count: 5 },
    { id: 'assets' as View, label: '专利资产', icon: Library },
  ]
  const agencyNav = [
    { id: 'clients' as View, label: '客户与案件', icon: BriefcaseBusiness, count: 12 },
  ]
  const nav = role === 'enterprise' ? enterpriseNav : agencyNav

  const sendChat = () => {
    if (!message.trim()) return
    setChat(c => [...c, message.trim()]); setMessage('')
    window.setTimeout(() => notify('部门已收到，将在项目内回复'), 500)
  }

  const searchItems = useMemo(() => [
    ...projects.map(p => ({ title: p.name, meta: `${p.kind} · ${p.code} · ${p.stage}`, action: () => openProject(p) })),
    ...departments.map(d => ({ title: d.name, meta: `${d.stage} · ${d.output}`, action: () => { setActiveDept(d.id); navigate('departments') } })),
  ], [role, handedOff])
  const filteredSearch = searchItems.filter(i => `${i.title}${i.meta}`.toLowerCase().includes(search.toLowerCase()))

  if (surface === 'site') return <MarketingSite onEnter={() => setSurface('login')} onLogin={() => setSurface('login')} />
  if (surface === 'login') return <LoginPage role={role} onRole={setRole} firstRun={firstRun} onFirstRun={setFirstRun} onBack={() => setSurface('site')} onEnter={() => { setSurface('app'); setMode('assistant'); setView('home'); setLeadRequest(''); setLeadInput(''); setActiveProjectCode(firstRun ? null : 'RD-2026-017'); setProjectPickerOpen(false) }} />

  return <div className={`app-shell ${firstRun && view === 'home' ? 'first-run-shell' : ''}`}>
    <a className="skip-link" href="#main-content">跳到主内容</a>
    <header className="topbar">
      {mode === 'project' && <button className="mobile-menu icon-btn" onClick={() => setMobileNav(true)} aria-label="打开导航"><Menu size={20} /></button>}
      <BrandWordmark onClick={() => navigate('home')} ariaLabel="Novada Team · 返回首页" />
      {showProjectPicker && <div className="topbar-context">
        <span className="context-label">{contextLabel}</span>
        <div className="context-picker">
          <button
            type="button"
            className={`context-button ${!contextName ? 'context-empty' : ''}`}
            aria-expanded={projectPickerOpen}
            aria-haspopup="listbox"
            aria-label={contextName ? `${contextLabel}：${contextName}` : `${contextLabel}：暂无活跃`}
            onClick={() => { setNoticeOpen(false); setAvatarMenuOpen(false); setProjectPickerOpen(v => !v) }}
          >
            <span>{contextName ?? (firstRun ? '暂无活跃项目' : '选择项目')}</span>
            <ChevronDown size={14} />
          </button>
          {projectPickerOpen && <div className="context-menu" role="listbox" aria-label="最近项目">
            <div className="popover-title">{role === 'enterprise' ? '最近项目' : '最近案件'} <button type="button" onClick={() => setProjectPickerOpen(false)}>收起</button></div>
            {(firstRun || !activeProjectCode) && <p className="context-empty-note">还没有活跃{role === 'enterprise' ? '项目' : '案件'}。可从列表选择，或新建后进入。</p>}
            {projects.map(p => <button
              key={p.code}
              type="button"
              role="option"
              aria-selected={p.code === activeProjectCode}
              className={p.code === activeProjectCode ? 'active' : ''}
              onClick={() => selectActiveProject(p)}
            >
              <span><strong>{p.name}</strong><small>{p.kind} · {p.stage}</small></span>
              {p.code === activeProjectCode && <Check size={14} />}
            </button>)}
            <div className="context-menu-foot">
              <button type="button" onClick={() => { setProjectPickerOpen(false); switchMode('project') }}>打开{role === 'enterprise' ? '项目' : '案件'}列表</button>
              <button type="button" onClick={() => { setProjectPickerOpen(false); setModal('new') }}>新建</button>
            </div>
          </div>}
        </div>
      </div>}
      <div className="topbar-actions">
        <button className="search-trigger" onClick={() => setSearchOpen(true)}><Search size={16} /><span>搜索项目、文件或部门</span><kbd>⌘ K</kbd></button>
        <button className="icon-btn help-btn" onClick={() => setModal('guide')} aria-label="产品与原型导览"><CircleHelp size={19} /></button>
        <div className="notice-wrap">
          <button className="icon-btn notice-button" onClick={() => { setProjectPickerOpen(false); setAvatarMenuOpen(false); setNoticeOpen(v => !v) }} aria-label="通知"><Bell size={18} /><span /></button>
          {noticeOpen && <div className="notice-popover">
            <div className="popover-title">待办提醒 <button onClick={() => setNoticeOpen(false)}>收起</button></div>
            <button onClick={() => openWorkbench(role === 'agency')}><Clock3 size={16} /><span><strong>{role === 'enterprise' ? '交底书有 2 处待确认' : 'OA 答复期限剩余 18 天'}</strong><small>今天 14:30 前处理</small></span></button>
            <button onClick={() => navigate('messages')}><MessageSquareText size={16} /><span><strong>代理所有新留言</strong><small>请确认最接近现有技术</small></span></button>
          </div>}
        </div>
        <div className="mode-switch" role="group" aria-label="切换使用模式">
          {([['assistant', '首页'], ['project', '项目'], ['studio', '部门']] as const).map(([id, label]) => <button key={id} className={mode === id ? 'active' : ''} aria-pressed={mode === id} onClick={() => switchMode(id)}>{label}</button>)}
        </div>
        <div className="role-switch" role="group" aria-label="切换原型角色">
          <button className={role === 'enterprise' ? 'active' : ''} aria-pressed={role === 'enterprise'} onClick={() => switchRole('enterprise')}>企业研发</button>
          <button className={role === 'agency' ? 'active' : ''} aria-pressed={role === 'agency'} onClick={() => switchRole('agency')}>代理所</button>
        </div>
        <div className="avatar-menu-wrap">
          <button type="button" className="avatar-menu-trigger" aria-expanded={avatarMenuOpen} aria-haspopup="menu" aria-label={role === 'enterprise' ? '陈宇 · 账户菜单' : '林岚 · 账户菜单'} onClick={() => { setNoticeOpen(false); setProjectPickerOpen(false); setAvatarMenuOpen(v => !v) }}>
            <Avatar name={role === 'enterprise' ? '陈宇' : '林'} human small />
          </button>
          {avatarMenuOpen && <div className="avatar-menu" role="menu" aria-label="账户菜单">
            <button type="button" role="menuitem" onClick={() => { setAvatarMenuOpen(false); setSurface('site') }}>返回官网</button>
            <button type="button" role="menuitem" onClick={() => { setAvatarMenuOpen(false); setModal('guide') }}>产品与原型导览</button>
            <button type="button" role="menuitem" onClick={() => { setAvatarMenuOpen(false); setSurface('login') }}>切换演示身份</button>
          </div>}
        </div>
      </div>
    </header>

    <div className="app-main">
      {mobileNav && mode === 'project' && <div className="mobile-scrim" onClick={() => setMobileNav(false)} />}
      {mode === 'project' && <aside className={`sidebar ${mobileNav ? 'mobile-open' : ''}`}>
        <div className="mobile-sidebar-head"><strong>工作导航</strong><button className="icon-btn" onClick={() => setMobileNav(false)} aria-label="关闭导航"><X size={18} /></button></div>
        <div className="workspace-label">{role === 'enterprise' ? '澄明科技有限公司' : '衡知专利代理事务所'}<span>{role === 'enterprise' ? '研发负责人工作区' : '代理师工作区'}</span></div>
        <nav className="main-nav">
          {nav.map(item => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => navigate(item.id)}><item.icon size={17} /><span>{item.label}</span>{item.count && <em>{item.count}</em>}</button>)}
        </nav>
        <div className="sidebar-section">
          <div className="sidebar-heading"><span>进行中的项目</span><button className="sidebar-new-chip" onClick={() => setModal('new')} aria-label="新建项目"><Plus size={14} /><span>新建</span></button></div>
          <button className="side-project active" onClick={() => openWorkbench(role === 'agency')}><span className="project-glyph">MP</span><span><strong>{role === 'enterprise' ? '磁驱泵智能控制' : '低能耗膜分离工艺'}</strong><small>{role === 'enterprise' ? '交底书完善中' : '第一次 OA 答复'}</small></span></button>
          <button className="side-project" onClick={() => { notify('已切换至模块化储能热管理'); openWorkbench(false, 'storage') }}><span className="project-glyph muted">ES</span><span><strong>模块化储能热管理</strong><small>申请文件质检</small></span></button>
        </div>
        <div className="sidebar-bottom">
          <button onClick={() => setModal('guide')}><BookOpen size={16} />产品如何工作<ChevronRight size={14} /></button>
          <div className="human-guard"><ShieldCheck size={17} /><span><strong>关键节点，人来决策</strong><small>AI 起草 · 专家复核 · 你确认</small></span></div>
        </div>
      </aside>}

      <main id="main-content" className={`content ${view === 'workbench' ? 'content-workbench' : ''} ${mode === 'assistant' || mode === 'studio' ? 'content-assistant' : ''}`}>
        {view === 'home' && (role === 'enterprise' ? <>
          <section className="home-intro company-home-intro">
            <div><p className="date-line">{firstRun ? 'Novada Team · 从第一件事开始' : '首页 · 顾言统一组织，你只处理关键确认与消息'}</p><h1>{firstRun ? <>你好，陈宇。<br />我是顾言，你的知产负责人。</> : <>早上好，陈宇。<br />今天有 3 件事需要你处理。</>}</h1></div>
            {!firstRun && <button className="btn btn-secondary" onClick={() => setModal('new')}><Plus size={17} />启动新项目</button>}
          </section>
          <section className="lead-card" aria-label="知产负责人统一入口">
            <div className="lead-identity"><Avatar name="顾" /><div><span className="section-kicker">统一委托入口</span><h2>顾言</h2><p>{firstRun ? '不用先选部门或学习专利流程，直接告诉我你的业务目标。' : '新目标或工作区指令都从这里开始；项目内指令请进入具体项目。'}</p></div></div>
            <div className="lead-command">
              <form onSubmit={submitLead}><input name="lead_goal" autoComplete="off" value={leadInput} onChange={e => setLeadInput(e.target.value)} placeholder={firstRun ? '例如：我们有一项磁驱泵控制技术，想评估如何保护…' : '交办新目标，或告诉顾言调整工作区优先级…'} aria-label="告诉知产负责人你的目标" /><button className="btn btn-ink" type="submit" disabled={!leadInput.trim()}>交给顾言<Send size={14} /></button></form>
              <div className="lead-suggestions"><span>{firstRun ? '从常见目标开始' : '快速交办'}</span>{['整理一项研发成果', '新产品上市前排查风险', '收到审查意见'].map(text => <button key={text} onClick={() => setLeadInput(text)}>{text}</button>)}</div>
              {leadRequest && <div className="lead-response"><CheckCircle2 size={17} /><div><strong>已理解，建议由{leadPlan.dept}先接手</strong><p>{leadPlan.text} 我会汇总进展，只在需要技术事实或商业决策时找你。</p></div><button className="btn btn-secondary" onClick={startLeadPlan}>确认计划并开始<ArrowRight size={14} /></button></div>}
            </div>
          </section>

          {firstRun ? <section className="first-run-home" aria-label="首次使用空状态">
            <div className="first-run-main"><span className="section-kicker">工作区还没有进行中的工作</span><h2>第一件事，想推进什么？</h2><p>提交目标后，顾言会先给出工作计划、负责部门、首次交付和确认点。你确认路径后，编制才会开始执行。</p><div className="first-goals">{[
              ['整理研发成果', '把技术描述变成可评估、可接力的专利项目', FlaskConical],
              ['产品上市前排查风险', '明确产品、地区和时间，再开展 FTO 分析', ShieldCheck],
              ['处理审查意见', '读取通知书与期限，组织答复策略和代理师复核', FileClock],
            ].map(([title, desc, Icon]) => <button key={String(title)} onClick={() => setLeadInput(String(title))}><Icon size={20} /><span><strong>{String(title)}</strong><small>{String(desc)}</small></span><ArrowUpRight size={16} /></button>)}</div></div>
            <aside className="first-run-steps"><span className="section-kicker">开始之后</span>{[['01', '先看计划', '知道哪个部门负责、会交付什么'], ['02', '只补必要事实', '不需要一次性整理全部研发资料'], ['03', '确认再接力', '未经确认，不自动共享或对外递交']].map(s => <div key={s[0]}><span>{s[0]}</span><p><strong>{s[1]}</strong><small>{s[2]}</small></p></div>)}<button className="text-btn" onClick={() => { setFirstRun(false); setActiveProjectCode(v => v ?? 'RD-2026-017') }}>查看已有工作演示<ArrowRight size={14} /></button></aside>
          </section> : <>
          <section className="company-attention" aria-label="现在需要我处理">
            <div className="company-section-head"><div><span className="section-kicker">现在需要我处理</span><h2>按期限与流程影响排序</h2></div><button className="text-btn" onClick={() => navigate('messages')} aria-label="全部消息，3 条未读">全部消息 · 3<ArrowRight size={14} /></button></div>
            <div className="attention-list"><button onClick={() => openWorkbench(false)}><span className="attention-order">01</span><span><Status tone="orange">技术事实 · 阻塞接力</Status><strong>{handedOff ? '独权是否覆盖 MP-300 量产方案？' : '异常识别测试数据是否与记录一致？'}</strong><small>磁驱泵智能控制系统 · 今天 14:30</small></span><span className="attention-action">查看依据<ArrowRight size={14} /></span></button><button onClick={() => openWorkbench(false, 'storage')}><span className="attention-order">02</span><span><Status tone="orange">申请策略 · 等待确认</Status><strong>确认装置与方法双层保护是否覆盖量产方案</strong><small>模块化储能热管理装置 · 今天 17:00</small></span><span className="attention-action">进入复核<ArrowRight size={14} /></span></button><button onClick={() => { setActiveDept('risk'); setModal('task') }}><span className="attention-order">03</span><span><Status tone="red">风险决策 · 上市前</Status><strong>高速视觉检测设备发现 1 件高相关权利要求</strong><small>FTO-2026-009 · 11 月 03 日前</small></span><span className="attention-action">查看选项<ArrowRight size={14} /></span></button></div>
          </section>


          <section className="company-work" aria-label="正在推进">
            <div className="company-section-head"><div><span className="section-kicker">正在推进</span><h2>4 个业务对象，3 个部门正在执行</h2></div><button className="text-btn" onClick={() => navigate('projects')}>全部项目与对象<ArrowRight size={14} /></button></div>
            <div className="company-work-grid"><button onClick={() => openWorkbench(false)}><div><span className="project-glyph">MP</span><Status tone="orange">等待你确认</Status></div><h3>磁驱泵智能控制系统</h3><p>{handedOff ? '申请文件部 · 申请文件起草' : '交底书部 · 交底事实完善'}</p><dl><div><dt>下一交付</dt><dd>{handedOff ? '权利要求草案 V1' : '交底书 V4'}</dd></div><div><dt>当前阻塞</dt><dd>1 项技术事实</dd></div></dl><span className="work-enter">进入协同工作<ArrowRight size={14} /></span></button><button onClick={() => openWorkbench(true)}><div><span className="project-glyph muted">MS</span><Status tone="red">剩余 18 天</Status></div><h3>低能耗膜分离清洗控制方法</h3><p>OA 答复部 · 答复策略形成</p><dl><div><dt>下一交付</dt><dd>意见陈述书 V2</dd></div><div><dt>当前状态</dt><dd>代理师复核前</dd></div></dl><span className="work-enter">进入 OA 答复<ArrowRight size={14} /></span></button><button onClick={() => openWorkbench(false, 'storage')}><div><span className="project-glyph muted">ES</span><Status tone="green">质检进行中</Status></div><h3>模块化储能热管理装置</h3><p>质量审查部 · 申请文件质检</p><dl><div><dt>下一交付</dt><dd>质检快照 Q2</dd></div><div><dt>遗留问题</dt><dd>2 项文本一致性</dd></div></dl><span className="work-enter">进入质量审查<ArrowRight size={14} /></span></button></div>
          </section>

          <div className="company-bottom-grid">
            <section className="company-deliveries"><div className="company-section-head"><div><span className="section-kicker">最近形成的交付</span><h2>版本、复核与项目关系清楚可查</h2></div></div><button onClick={() => { openWorkbench(false); openDocument(handedOff ? '权利要求草案' : '交底书 V3') }}><FileCheck2 size={18} /><span><strong>{handedOff ? '权利要求草案 V1' : '交底书 V3'}</strong><small>磁驱泵智能控制系统 · {handedOff ? '申请文件部' : '交底书部'} · 今天 10:24</small></span><Status tone="orange">待确认</Status><ChevronRight size={15} /></button><button onClick={() => { openWorkbench(true); openDocument('证据比对表') }}><BookOpen size={18} /><span><strong>证据比对表 E3</strong><small>低能耗膜分离案件 · OA 答复部 · 昨天 16:40</small></span><Status tone="green">已复核</Status><ChevronRight size={15} /></button><button onClick={() => { openWorkbench(false, 'storage'); openDocument('说明书质检') }}><FileText size={18} /><span><strong>说明书质检 Q2</strong><small>模块化储能热管理 · 质量审查部 · 昨天 14:10</small></span><Status>可查看</Status><ChevronRight size={15} /></button></section>
            <section className="company-delegate"><div className="company-section-head"><div><span className="section-kicker">还可以交办</span><h2>从业务目标开始，而非从部门开始</h2></div></div><button onClick={() => setLeadInput('我们有一项新的研发成果，想评估如何保护')}><FlaskConical size={18} /><span><strong>整理一项研发成果</strong><small>挖掘、布局、交底与申请</small></span><Plus size={15} /></button><button onClick={() => setLeadInput('新产品准备上市，需要排查 FTO 风险')}><ShieldCheck size={18} /><span><strong>新产品上市前排查风险</strong><small>产品拆解、FTO 与风险决策</small></span><Plus size={15} /></button><button onClick={() => setLeadInput('我们收到审查意见，请组织答复')}><FileClock size={18} /><span><strong>收到审查意见</strong><small>期限、答复策略与代理师复核</small></span><Plus size={15} /></button></section>
          </div>
          </>}

          {!firstRun && <section className="company-strip">
            <div className="section-head"><div><span className="section-kicker">编制与能力</span><h2>10 个部门，围绕业务目标接力</h2></div><button className="text-btn" onClick={() => switchMode('studio')}>打开部门<ArrowRight size={15} /></button></div>
            <div className="department-row">{departments.slice(0, 6).map((d, i) => <button key={d.id} onClick={() => { setActiveDept(d.id); switchMode('studio') }}><span>{String(i + 1).padStart(2, '0')}</span><strong>{d.name}</strong><small>{d.output}</small></button>)}</div>
          </section>}
        </> : <>
          <section className="home-intro agency-intro">
            <div><p className="date-line">{'首页 · 顾言汇总期限、案件与客户确认'}</p><h1>上午好，林岚。<br />先处理期限，再推进交付。</h1></div>
            <button className="btn btn-secondary" onClick={() => setModal('new')}><Plus size={17} />新建案件</button>
          </section>
          <section className="lead-card" aria-label="代理所知产负责人统一入口">
            <div className="lead-identity"><Avatar name="顾" /><div><span className="section-kicker">你的知产负责人</span><h2>顾言</h2><p>我帮你安排案件优先级、组织专业团队，并汇总客户确认。</p></div></div>
            <div className="lead-command"><form onSubmit={submitLead}><input name="lead_goal" autoComplete="off" value={leadInput} onChange={e => setLeadInput(e.target.value)} placeholder="例如：先处理今天到期的质检，并汇总客户待确认事项…" aria-label="告诉知产负责人你的目标" /><button className="btn btn-ink" type="submit" disabled={!leadInput.trim()}>交给顾言<Send size={14} /></button></form><div className="lead-suggestions"><span>可以这样开始</span>{['整理今日 OA 期限', '查看客户待确认', '继续储能案件质检'].map(text => <button key={text} onClick={() => setLeadInput(text)}>{text}</button>)}</div>{leadRequest && <div className="lead-response"><CheckCircle2 size={17} /><div><strong>已按期限与交付风险重排工作</strong><p>优先处理储能案件质检，再推进 OA 答复；需要客户决策的事项会单独汇总。</p></div><button className="btn btn-secondary" onClick={() => openWorkbench(false, 'storage')}>进入最优先案件<ArrowRight size={14} /></button></div>}</div>
          </section>
          <section className="metric-strip">
            <div><small>今日待办</small><strong>8</strong><span>2 项临近内部期限</span></div><div><small>进行中案件</small><strong>26</strong><span>覆盖 7 家客户</span></div><div><small>待客户确认</small><strong>5</strong><span>平均等待 1.4 天</span></div><div><small>本月已交付</small><strong>17</strong><span>质检通过率 94%</span></div>
          </section>
          <div className="agency-grid">
            <section className="work-queue">
              <div className="section-head"><div><span className="section-kicker">优先级队列</span><h2>现在最该处理的案件</h2></div><button className="text-btn" onClick={() => navigate('clients')}>全部案件<ArrowRight size={15} /></button></div>
              <div className="queue-head"><span>案件 / 客户</span><span>当前任务</span><span>期限</span><span>负责人</span><span /></div>
              {[
                ['低能耗膜分离工艺', '澄明科技', '第一次 OA 答复', '剩余 18 天', '林岚', true],
                ['模块化储能热管理', '澄明科技', '申请文件质检', '今天 17:00', '林岚', false],
                ['高速视觉检测设备', '明锐智能', 'FTO 权利要求比对', '10 月 27 日', '顾研', false],
                ['一种泵体密封结构', '澄明科技', '授权登记核查', '10 月 29 日', '赵琪', false],
              ].map((r, i) => <button className="queue-row" key={String(r[0])} onClick={() => { if (i === 2) { setActiveDept('risk'); setModal('task') } else if (i === 3) notify('授权登记核查已加入今日待办'); else openWorkbench(i === 0, i === 1 ? 'storage' : 'magnetic') }}><span><strong>{r[0]}</strong><small>{r[1]}</small></span><span>{r[2]}</span><span className={i === 1 ? 'urgent' : ''}><Clock3 size={14} />{r[3]}</span><span><Avatar name={String(r[4])} small human />{r[4]}</span><ChevronRight size={16} /></button>)}
            </section>
            <aside className="client-pulse">
              <div className="section-head" id="home-messages"><div><span className="section-kicker">待你处理 · 消息</span><h2>客户协同</h2></div></div>
              <button type="button" className="pulse-item" onClick={() => openWorkbench(false)}><Avatar name="陈" human /><div><strong>陈宇补充了技术说明</strong><p>磁驱泵智能控制系统 · 25 分钟前</p><span className="pulse-action">查看并继续撰写<ArrowRight size={14} /></span></div></button>
              <button type="button" className="pulse-item" onClick={() => openWorkbench(true)}><Avatar name="周" human /><div><strong>周敏确认了答复策略</strong><p>低能耗膜分离工艺 · 昨天</p><span className="pulse-action">进入 OA 答复<ArrowRight size={14} /></span></div></button>
              <button type="button" className="pulse-item" onClick={() => notify('附件已加入 FTO 案件卷宗')}><Avatar name="许" human /><div><strong>许清上传了产品结构图</strong><p>高速视觉检测设备 · 昨天</p><span className="pulse-action">加入案件卷宗<Plus size={14} /></span></div></button>
            </aside>
          </div>
          <section className="delivery-board">
            <div className="section-head"><div><span className="section-kicker">交付质量</span><h2>每个交付物都有复核人与依据</h2></div></div>
            <div className="delivery-line"><span>部门起草</span><ArrowRight size={17} /><span>交叉质检</span><ArrowRight size={17} /><span>代理师复核</span><ArrowRight size={17} /><span>客户确认</span><ArrowRight size={17} /><span>签署递交</span></div>
          </section>
        </>)}

        {view === 'workbench' && <section className="workspace-frame">
          <header className="workspace-switchbar">
            <div className="workspace-title"><button className="icon-btn" onClick={() => navigate(role === 'enterprise' ? 'projects' : 'clients')} aria-label="返回列表"><ArrowLeft size={17} /></button><span className="project-glyph">{workMeta.glyph}</span><div><strong>{workMeta.name}</strong><small>{workMeta.code} · {collab.department}</small></div></div>
            <div className="work-view-switch" role="group" aria-label="切换工作视图"><button className={workView === 'collaboration' ? 'active' : ''} aria-pressed={workView === 'collaboration'} onClick={() => setWorkView('collaboration')}><Network size={15} />协同工作</button><button className={workView === 'document' ? 'active' : ''} aria-pressed={workView === 'document'} onClick={() => setWorkView('document')}><FileText size={15} />文书工作</button></div>
            <div className="workspace-live"><span className="live-dot" /><span><strong>{nodeConfirmed ? '本节点已确认' : collab.node}</strong><small>{nodeConfirmed ? `等待交给${collab.nextDept}` : '顾言持续协调中'}</small></span></div>
          </header>
          {workView === 'document' ? <section className={`workbench ${processVisible ? '' : 'workbench-simple'}`}>
          <aside className="file-pane">
            <div className="pane-top"><button className="back-link" onClick={() => navigate(role === 'enterprise' ? 'projects' : 'clients')}><ArrowLeft size={15} />{role === 'enterprise' ? '项目中心' : '案件列表'}</button><button className="icon-btn" onClick={() => notify('项目设置已打开')} aria-label="项目设置"><Settings2 size={16} /></button></div>
            <div className="file-project"><span className="project-glyph">{workMeta.glyph}</span><div><strong>{workMeta.name}</strong><small>{workMeta.code}</small></div></div>
            <div className="file-stage"><span>{workMeta.object}</span><Status tone={oaMode ? 'red' : 'orange'}>{workMeta.status}</Status></div>
            <div className="workspace-scope"><ShieldCheck size={15} /><span><strong>{scopeText.split(' · ')[0]}</strong><small>{scopeText.split(' · ')[1]}</small></span></div>
            <div className="file-tree">
              <p>{oaMode || storageMode ? '案件卷宗' : '项目资料'}</p>
              {workTabs.map((doc, i) => <button key={doc} className={activeDoc === doc ? 'active' : ''} onClick={() => { setActiveDoc(doc); setSaved(true) }}><FileText size={15} /><span>{doc}</span>{i === 0 && <span className="unsaved-dot" />}</button>)}
              <p>过程资产 · 输入 / 过程 / 产物</p>
              {([
                ['input', '输入', '用户上传的交底、图纸与证据', Files] as const,
                ['process', '过程', '部门中间稿与核查摘录', GitBranch] as const,
                ['output', '产物', '已确认交付，可下载', FileCheck2] as const,
              ]).map(([bucket, label, hint, Icon]) => {
                const count = docket.filter(d => d.bucket === bucket).length
                const open = assetBucket === bucket
                return <div key={bucket} className={`asset-bucket ${open ? 'open' : ''}`}>
                  <button type="button" className={open ? 'active' : ''} onClick={() => openAssetBucket(bucket as DocketBucket)} aria-expanded={open}>
                    <Icon size={15} /><span>{label}</span><small>{count}</small>
                  </button>
                  {open && <div className="asset-bucket-list" role="list">
                    <p className="asset-bucket-hint">{hint}</p>
                    {docket.filter(d => d.bucket === bucket).map(item => (
                      <button type="button" role="listitem" key={item.id} onClick={() => bucket === 'output' ? downloadDemo(item.name) : notify(`已打开${item.name}（${item.note}）`)}>
                        <span><strong>{item.name}</strong><small>{item.note}</small></span>
                        {bucket === 'output' ? <Download size={13} /> : <ChevronRight size={13} />}
                      </button>
                    ))}
                    {bucket === 'input' && <button type="button" className="asset-upload-link" onClick={() => openFilePicker('docket')}><Upload size={13} />补材料（{FILE_ACCEPT_HINT}）</button>}
                  </div>}
                </div>
              })}
            </div>
            <div className="file-history"><GitBranch size={15} /><span><strong>所有修改都有版本</strong><small>最近保存：刚刚</small></span></div>
          </aside>

          <div className="editor-pane">
            <div className="editor-tabs">{workTabs.map(doc => <button key={doc} className={activeDoc === doc ? 'active' : ''} onClick={() => setActiveDoc(doc)}>{doc}{activeDoc === doc && <span />}</button>)}<button className="icon-btn" onClick={() => setModal('new')} aria-label="新建文件"><Plus size={16} /></button></div>
            <div className="editor-toolbar"><div><button onClick={() => notify('已切换为编辑模式')}><PenLine size={15} />编辑</button><button onClick={() => notify('批注模式已开启')}><MessageSquareText size={15} />批注</button><button onClick={() => notify('版本对比已生成')}>对比版本</button><button type="button" onClick={() => downloadDemo(`${activeDoc}.pdf`)}><Download size={15} />下载</button></div><span className={saved ? '' : 'editing'}>{saved ? <><Check size={13} />已保存</> : '编辑中'}</span></div>
            {role === 'enterprise' && <div className="lead-workbench"><Avatar name="顾" small /><div><strong>顾言 · 知产负责人</strong><p>{oaMode ? 'OA 答复部已拆解争议并准备答复文本。你只需确认修改范围与实际生产方案。' : storageMode ? '申请文件部与质量审查部正在核查文本一致性。我会汇总问题，再请你确认申请策略。' : handedOff ? '申请文件部已接手。我会汇总权利要求与说明书进展，涉及保护范围时再请你决策。' : '交底书部正在完善文本。我已把专业任务留在后台，你只需处理 2 处技术事实。'}</p></div><button className={`process-toggle ${showProcess ? 'active' : ''}`} onClick={() => setShowProcess(v => !v)}><Network size={14} />{showProcess ? '收起专业过程' : '查看专业过程'}</button></div>}
            <div className="document-scroll">
              {oaMode ? <AgencyDocument doc={activeDoc} onEdit={() => setSaved(false)} /> : storageMode ? <StorageDocument doc={activeDoc} onEdit={() => setSaved(false)} /> : <EnterpriseDocument doc={activeDoc} onEdit={() => setSaved(false)} />}
            </div>
            <div className="editor-footer"><span>{saved ? `内容已同步至${oaMode || storageMode ? '案件卷宗' : '项目事实库'}` : '有未保存修改'}</span><div><button className="btn btn-secondary" onClick={() => { setSaved(true); notify('新版本已保存') }}>保存版本</button><button className="btn btn-ink" onClick={() => setModal('review')}><Stamp size={15} />{role === 'enterprise' ? '提交确认' : '提交质检'}</button></div></div>
          </div>

          {processVisible && <aside className="department-pane">
            <div className="department-head"><div><span className="section-kicker">{role === 'enterprise' ? '专业过程 · 顾言协调' : '当前负责部门'}</span><h3>{oaMode ? 'OA 答复部' : handedOff && !storageMode ? '申请文件部' : currentDept.name}</h3></div><button className="icon-btn" onClick={() => navigate('departments')} aria-label="查看部门与专家"><MoreHorizontal size={18} /></button></div>
            <div className="working-team">
              {(oaMode ? ['策', '辩', '林'] : handedOff || storageMode ? ['权', '说', '质'] : ['访', '检', '林']).map((n, i) => <div key={n}><Avatar name={n} human={i === 2} small /><span><strong>{oaMode ? ['OA 策略专家', '创造性争辩专家', '林岚 · 复核'][i] : handedOff || storageMode ? ['权利要求专家', '说明书撰写专家', '质量审查专家'][i] : ['技术访谈专家', '交底书撰写专家', '林岚 · 代理师'][i]}</strong><small>{i === 2 ? '等待最终复核' : '已完成本节点任务'}</small></span><CheckCircle2 size={15} /></div>)}
            </div>
            <div className="department-progress"><div><span>本节点任务</span><strong>{handedOff ? '2 / 5' : '4 / 6'}</strong></div><div className="progress-track"><span style={{ width: handedOff ? '40%' : '67%' }} /></div></div>
            <div className="department-feed">
              <div className="feed-item"><Avatar name={oaMode ? '策' : '访'} small /><div><p><strong>{oaMode ? 'OA 策略专家' : '技术访谈专家'}</strong><time>10:24</time></p><p>{oaMode ? '已将审查员争议拆解为 3 个特征组，D1 并未直接给出闭环清洗条件。' : '我把“响应更快”改写成了可验证的技术效果，还需要你确认测试条件。'}</p><button onClick={() => notify('已定位到文档对应段落')}>定位到文档<ArrowUpRight size={13} /></button></div></div>
              <div className="feed-item"><Avatar name="林" human small /><div><p><strong>林岚 · 代理师</strong><time>10:31</time></p><p>{oaMode ? '先保留方法权利要求的层次，不急于加入全部参数。请确认实际生产是否采用该范围。' : '从申请策略看，建议保留“异常评分自适应修正”这一层。它可能是后续答复创造性的关键。'}</p></div></div>
              {chat.map((c, i) => <div className="feed-item own" key={i}><Avatar name="我" human small /><div><p><strong>我</strong><time>刚刚</time></p><p>{c}</p></div></div>)}
            </div>
            <div className="department-compose"><div><textarea name="dept_compose" autoComplete="off" value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat() } }} placeholder="用自然语言交办或补充说明…" rows={2} aria-label="向部门交办" /><button type="button" onClick={() => openFilePicker('compose')} aria-label="添加附件，支持 PDF、Word、图片与常见图纸"><Paperclip size={16} /></button></div>{composeFiles.length > 0 && <ul className="attach-chip-list" aria-label="待发送附件">{composeFiles.map(f => <li key={f.id}><Files size={12} /><span>{f.name}</span><button type="button" aria-label={`移除 ${f.name}`} onClick={() => setComposeFiles(v => v.filter(x => x.id !== f.id))}><X size={12} /></button></li>)}</ul>}<div><span>Enter 发送 · {FILE_ACCEPT_HINT}</span><button className="icon-btn send-btn" onClick={sendChat} aria-label="发送"><Send size={16} /></button></div></div>
            <button className="handoff-button" onClick={() => setModal('handoff')}><GitBranch size={16} /><span><strong>{oaMode ? role === 'agency' ? '交付客户确认' : '确认答复策略' : storageMode ? role === 'agency' ? '交付客户确认' : '确认质检与申请文件' : role === 'agency' ? '交付客户确认' : handedOff ? '查看接力记录' : '让下一部门继续'}</strong><small>{oaMode ? role === 'agency' ? '生成带版本与权限的交付快照' : '确认后回传代理所并保留记录' : storageMode ? role === 'agency' ? '生成质检版本与申请策略交付快照' : '质检版本与申请策略一并确认' : role === 'agency' ? '仅共享指定交付物与确认事项' : handedOff ? '交底书部 → 申请文件部' : '按权限继承所需事实、证据与版本'}</small></span><ArrowRight size={16} /></button>
          </aside>}
          </section> : <section className="collaboration-workspace">
            <aside className="node-pane">
              <div className="node-pane-head"><span className="section-kicker">当前业务节点</span><h2>{collab.node}</h2><p>{collab.goal}</p></div>
              <div className="node-scope"><ShieldCheck size={15} /><span><strong>{scopeText.split(' · ')[0]}</strong><small>{scopeText.split(' · ')[1]}</small></span></div>
              <div className="node-path"><div className="pane-section-title"><span>节点路径</span><small>{collab.nodes.filter(n => n[1] === 'done').length} 已完成</small></div>{collab.nodes.map((node, i) => <div key={node[0]} className={`node-step ${node[1]}`}><span>{node[1] === 'done' ? <Check size={12} /> : i + 1}</span><div><strong>{node[0]}</strong><small>{node[1] === 'done' ? '交付已归档' : node[1] === 'active' ? `${collab.department}负责` : '等待接力条件满足'}</small></div>{node[1] === 'active' && <Status tone="orange">当前</Status>}</div>)}</div>
              <div className="node-contract"><div className="pane-section-title"><span>本节点工作契约</span></div><dl><div><dt>负责部门</dt><dd>{collab.department}</dd></div><div><dt>输入依据</dt><dd>{oaMode ? '通知书、申请文本、D1 / D2' : storageMode ? '申请文件 V4、检索 R1、量产事实' : handedOff ? '交底书 V4、检索 R2、确认决策' : '研发资料、访谈记录、检索 R2'}</dd></div><div><dt>节点交付</dt><dd>{collab.deliverable}</dd></div><div><dt>接力条件</dt><dd>事实确认、专业复核、版本归档</dd></div></dl></div>
              <button className="node-settings" onClick={() => setModal('task')}><Settings2 size={15} />调整本节点目标与参与部门<ChevronRight size={14} /></button>
            </aside>

            <div className="collab-main">
              <div className="collab-scroll">
                <section className="gu-plan-block"><div className="gu-plan-head"><Avatar name="顾" /><div><span className="section-kicker">知产负责人 · 持续协调</span><h2>顾言的工作计划</h2></div><button className="btn btn-secondary" onClick={() => setModal('task')}>调整计划</button></div><p>{oaMode ? '我会先把争议、证据和修改依据对齐，再让代理师复核。涉及实际生产方案和答复范围时，我会带着具体依据找你。' : storageMode ? '我会让质量审查部完成文本核查，再把影响量产覆盖和申请策略的事项交给你确认。' : handedOff ? '交底事实已按权限继承。我会组织申请文件部形成权利要求和说明书，只有保护范围与申请策略需要你决策。' : '我会组织交底书部补齐事实、完成检索对照和撰写。你不需要盯每个专家，只需确认我标出的技术事实。'}</p><div className="plan-sequence">{collab.plan.map((step, i) => <div key={step} className={i < 2 ? 'done' : i === 2 ? 'active' : ''}><span>{i < 2 ? <Check size={12} /> : i + 1}</span><strong>{step}</strong>{i < collab.plan.length - 1 && <ArrowRight size={13} />}</div>)}</div></section>

                <section className="expert-task-board"><div className="collab-section-head"><div><span className="section-kicker">部门执行</span><h2>{collab.department} · 谁正在做什么</h2></div><Status tone="orange">3 个角色</Status></div><div className="expert-task-list">{collab.tasks.map((task, i) => <article key={task[0]}><Avatar name={task[0]} human={i === 2} /><div><div><strong>{task[0]}</strong><span>{task[1]}</span></div><p>{task[3]}</p><footer><Status tone={task[2] === '已完成' ? 'green' : task[2] === '进行中' ? 'orange' : 'neutral'}>{task[2]}</Status><button onClick={() => setMessage(`请${task[0]}说明当前结论的依据，并列出还需要我补充的内容。`)}>追问依据</button>{i < 2 && <button onClick={() => openDocument(i === 0 ? collab.deliverableDoc : collab.evidenceDoc)}>查看产出<ArrowUpRight size={12} /></button>}</footer></div></article>)}</div></section>

                <section className="collab-feed"><div className="collab-section-head"><div><span className="section-kicker">动作与沟通</span><h2>项目内连续记录</h2></div><button className="text-btn" onClick={() => notify('已暂停当前节点的新任务，已有版本保留')}>暂停节点</button></div><div className="collab-event"><span className="event-time">10:24</span><div><p><strong>{collab.tasks[0][0]}</strong> {collab.tasks[0][3]}</p><button onClick={() => openDocument(collab.deliverableDoc)}>定位到交付物<ArrowUpRight size={12} /></button></div></div><div className="collab-event"><span className="event-time">10:31</span><div><p><strong>林岚 · 专利代理师</strong> {oaMode ? '建议保留修改层次，先确认实际生产控制逻辑，再确定最终答复口径。' : storageMode ? '两项遗留问题不影响继续核查，但保护范围需要企业研发与代理师共同确认。' : handedOff ? '独权暂不加入具体阈值，避免不必要缩小保护范围；仍需确认量产方案。' : '建议保留“异常评分自适应修正”这一层，可能是后续答复创造性的关键。'}</p></div></div>{chat.map((c, i) => <div className="collab-event own" key={`${c}-${i}`}><span className="event-time">刚刚</span><div><p><strong>我 → 顾言</strong> {c}</p><small>已纳入当前项目指令，部门会在本线程回复</small></div></div>)}</section>
              </div>
              <form className="collab-compose" onSubmit={e => { e.preventDefault(); sendChat() }}><div><Avatar name="顾" small /><textarea name="collab_compose" autoComplete="off" value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat() } }} placeholder="在当前项目中向顾言或部门交办：补充事实、调整目标、追问依据…" rows={2} aria-label="向顾言交办" /><button type="button" className="icon-btn" onClick={() => openFilePicker('compose')} aria-label="添加项目附件，支持 PDF、Word、图片与常见图纸"><Paperclip size={16} /></button></div>{composeFiles.length > 0 && <ul className="attach-chip-list" aria-label="已关联附件">{composeFiles.map(f => <li key={f.id}><Files size={12} /><span>{f.name}</span><button type="button" aria-label={`移除 ${f.name}`} onClick={() => setComposeFiles(v => v.filter(x => x.id !== f.id))}><X size={12} /></button></li>)}</ul>}<footer><div><button type="button" onClick={() => setMessage('请汇总当前节点还缺哪些事实和依据。')}>还缺什么</button><button type="button" onClick={() => setMessage('请调整工作计划，并说明对交付和期限的影响。')}>调整计划</button><button type="button" onClick={() => setMessage(`请让${collab.department}退回上一版本重新核查。`)}>退回核查</button><button type="button" onClick={() => openFilePicker('compose')}><Paperclip size={12} />补材料</button></div><button className="btn btn-ink" type="submit" disabled={!message.trim()}>发送给顾言<Send size={14} /></button></footer></form>
            </div>

            <aside className="delivery-confirm-pane">
              <section className="current-delivery"><div className="pane-section-title"><span>当前交付物</span><Status tone={nodeConfirmed ? 'green' : 'orange'}>{nodeConfirmed ? '已确认' : '待确认'}</Status></div><button className="delivery-file" onClick={() => openDocument(collab.deliverableDoc)}><FileText size={21} /><span><strong>{collab.deliverable}</strong><small>{collab.deliverableNote}</small></span><ArrowUpRight size={15} /></button><button type="button" className="btn btn-secondary full-btn delivery-download" onClick={() => downloadDemo(`${collab.deliverable}.pdf`)}><Download size={14} />下载当前交付物（演示）</button><button className="evidence-link" onClick={() => openDocument(collab.evidenceDoc)}><BookOpen size={14} /><span><strong>{collab.evidence}</strong><small>查看来源、段落和核查记录</small></span><ChevronRight size={14} /></button></section>
              <section className="confirmation-flow"><div className="pane-section-title"><span>确认控制点</span><small>2 步</small></div><div className={`confirm-step ${factConfirmed ? 'confirmed' : 'active'}`}><div className="confirm-step-head"><span>{factConfirmed ? <Check size={13} /> : '1'}</span><div><strong>技术事实确认</strong><small>{factConfirmed ? '已写入项目确认记录' : '由你确认，AI 不代替判断'}</small></div></div><h3>{collab.factTitle}</h3><p>{collab.factDetail}</p><button className="source-link" onClick={() => openDocument(collab.sourceDoc)}><FileText size={13} />{collab.source}<ArrowUpRight size={13} /></button><div className="impact-note"><CircleAlert size={14} /><p>{collab.impact}</p></div><div className="confirm-actions"><button type="button" className="btn btn-secondary full-btn" onClick={() => openFilePicker('docket')} disabled={factConfirmed}><Upload size={14} />补材料</button><button className="btn btn-secondary full-btn" disabled={factConfirmed} onClick={() => { setFactConfirmed(true); notify('技术事实已确认，并绑定当前文书版本') }}>{factConfirmed ? <><Check size={14} />事实已确认</> : '确认事实与当前版本一致'}</button></div><p className="attach-hint">{FILE_ACCEPT_HINT} · 关联当前项目与节点，归入输入材料</p></div><div className={`confirm-step ${nodeConfirmed ? 'confirmed' : factConfirmed ? 'active' : 'locked'}`}><div className="confirm-step-head"><span>{nodeConfirmed ? <Check size={13} /> : '2'}</span><div><strong>节点交付确认</strong><small>{nodeConfirmed ? '交付版本与确认记录已归档' : factConfirmed ? '可以确认本节点交付' : '先完成技术事实确认'}</small></div></div><p>确认对象：{collab.deliverable}。确认只推进当前节点，不代表同意对外递交。</p><button className="btn btn-primary full-btn" disabled={!factConfirmed || nodeConfirmed} onClick={() => { setNodeConfirmed(true); notify('本节点已确认，接力包已准备') }}>{nodeConfirmed ? <><Check size={14} />本节点已确认</> : '确认本节点交付'}</button></div></section>
              {nodeConfirmed ? <section className="next-action-panel"><GitBranch size={19} /><div><strong>接力条件已满足</strong><p>所需事实、证据、当前版本和确认记录将按权限继承；不共享无关草稿。</p></div><button className="btn btn-ink full-btn" onClick={() => { if (!oaMode && !storageMode && !handedOff) { setHandedOff(true); setActiveDept('drafting'); setActiveDoc('权利要求草案'); setFactConfirmed(false); setNodeConfirmed(false); notify('申请文件部已接手，已切换至新节点') } else setModal('handoff') }}>{oaMode || storageMode ? '进入交付与递交前确认' : handedOff ? '查看部门接力安排' : `交给${collab.nextDept}`}<ArrowRight size={14} /></button></section> : <section className="return-panel"><strong>结论不合适？</strong><p>退回报部门补充，当前版本、依据和意见都会保留。</p><button className="btn btn-secondary full-btn" onClick={() => { setNodeConfirmed(false); setMessage(`请${collab.department}根据我的反馈补充并重新提交：`) ; notify('已退回部门，等待你补充具体意见') }}>退回部门补充</button></section>}
            </aside>
          </section>}
        </section>}

        {view === 'projects' && <ListPage title="项目与业务对象" subtitle="研发项目、申请案件与产品风险分别管理状态，可以关联、并行、回退或重开；专利资产独立沉淀。" action="新建项目" onAction={() => setModal('new')}>
          <div className="object-filter" aria-label="按业务对象筛选">{(['全部对象', '研发项目', '申请案件', '产品风险'] as const).map(kind => <button key={kind} className={objectFilter === kind ? 'active' : ''} aria-pressed={objectFilter === kind} onClick={() => setObjectFilter(kind)}>{kind}<span>{kind === '全部对象' ? projects.length : projects.filter(p => p.kind === kind).length}</span></button>)}<button className="asset-link" onClick={() => navigate('assets')}>专利资产<ArrowUpRight size={14} /></button></div>
          <div className="list-toolbar"><div className="inline-search"><Search size={16} /><input name="project_filter" autoComplete="off" value={projectFilter} onChange={e => setProjectFilter(e.target.value)} placeholder="搜索对象名称或编号…" aria-label="搜索对象名称或编号" /></div><span className="state-note"><GitBranch size={14} />每类对象使用独立状态机</span></div>
          <div className="data-table project-table"><div className="data-head"><span>业务对象</span><span>独立状态</span><span>关联对象</span><span>负责部门</span><span>下一期限</span><span /></div>{filteredProjects.map(p => <button className="data-row" key={p.code} onClick={() => openProject(p)}><span><strong>{p.name}</strong><small>{p.kind} · {p.code}</small></span><span><Status tone={p.kind === '产品风险' || p.stage.includes('OA') ? 'red' : 'orange'}>{p.stage}</Status><span className="mini-progress"><i style={{ width: `${p.progress}%` }} /></span></span><span>{p.relation}</span><span>{p.dept}</span><span>{p.date}</span><ChevronRight size={16} /></button>)}</div>
        </ListPage>}

        {view === 'clients' && <ListPage title="客户与案件" subtitle="以客户项目组织卷宗、专业任务、交付和确认，不再分散于聊天记录。" action="新建案件" onAction={() => setModal('new')}>
          <div className="client-banner"><Building2 size={24} /><div><strong>澄明科技有限公司</strong><p>6 个进行中案件 · 主要领域：流体机械、储能、膜分离</p></div><button className="btn btn-secondary" onClick={() => notify('客户档案已打开')}>查看客户档案</button></div>
          <div className="data-table project-table"><div className="data-head"><span>案件</span><span>当前任务</span><span>负责团队</span><span>代理师</span><span>下一期限</span><span /></div>{projects.map((p, i) => <button className="data-row" key={p.code} onClick={() => openProject(p)}><span><strong>{p.name}</strong><small>{p.kind} · {p.code}</small></span><span><Status tone={p.kind === '产品风险' || p.stage.includes('OA') ? 'red' : 'orange'}>{p.stage}</Status></span><span>{p.dept}</span><span>{i % 2 ? '林岚' : '顾研'}</span><span>{p.date}</span><ChevronRight size={16} /></button>) }</div>
        </ListPage>}

        {view === 'assets' && <ListPage title="专利资产" subtitle="把法律状态与产品、技术、市场价值放在一起，支持维持和运营决策。" action="导入资产" onAction={() => setModal('new')}>
          <div className="metric-strip asset-metrics"><div><small>专利资产</small><strong>38</strong><span>发明 24 · 实用新型 14</span></div><div><small>已授权</small><strong>19</strong><span>核心专利 7 件</span></div><div><small>90 天内待办</small><strong>4</strong><span>年费与登记手续</span></div><div><small>产品覆盖率</small><strong>82%</strong><span>3 条核心产品线</span></div></div>
          <div className="data-table asset-table"><div className="data-head"><span>专利 / 申请号</span><span>类型与状态</span><span>关联产品</span><span>价值等级</span><span>下一期限</span><span /></div>{assets.map(a => <button className="data-row" key={a.id} onClick={() => setModal('review')}><span><strong>{a.name}</strong><small>{a.id}</small></span><span>{a.type}<small>{a.status}</small></span><span>{a.product}</span><span><Status tone={a.level === '核心' ? 'orange' : 'neutral'}>{a.level}</Status></span><span>{a.date}</span><ChevronRight size={16} /></button>)}</div>
        </ListPage>}

        {view === 'departments' && <ListPage title={role === 'enterprise' ? '部门与专家' : '专业团队'} subtitle="部门是预设好的专家工作流；你可以调整成员，但不需要学习如何搭建 Agent。" action="添加专家" onAction={() => setModal('expert')}>
          <div className="department-layout">
            <div className="department-list">{departments.map(d => <button key={d.id} className={activeDept === d.id ? 'active' : ''} onClick={() => setActiveDept(d.id)}><span className="dept-stage">{d.stage}</span><div><strong>{d.name}</strong><p>{d.desc}</p><small>{d.experts.length + (activeDept === d.id ? customExperts.length : 0)} 位专家 · 交付{d.output}</small></div><ChevronRight size={17} /></button>)}</div>
            <aside className="department-detail"><span className="section-kicker">{currentDept.stage}节点</span><h2>{currentDept.name}</h2><p>{currentDept.desc}</p><div className="dept-io"><div><small>接收</small><strong>项目事实、上一节点交付物</strong></div><ArrowRight size={17} /><div><small>交付</small><strong>{currentDept.output}</strong></div></div><h3>部门成员</h3>{currentDept.experts.map((e, i) => <div className="expert-row" key={e}><Avatar name={e} /><div><strong>{e}</strong><small>{i === 0 ? '主责 · 自动接收本节点任务' : '协作 · 按需参与交叉核查'}</small></div><button className="icon-btn" onClick={() => notify(`${e}的工作说明已打开`)} aria-label={`配置专家：${e}`}><Settings2 size={16} /></button></div>)}{activeDept === currentDept.id && customExperts.map(e => <div className="expert-row" key={e}><Avatar name={e} human /><div><strong>{e}</strong><small>自定义专家 · 按需参与</small></div><Status tone="green">已加入</Status></div>)}<button className="add-expert" onClick={() => setModal('expert')}><Plus size={16} />添加或自定义专家</button><div className="department-rule"><ShieldCheck size={18} /><p><strong>按需继承，不越权共享</strong><br />下一部门只继承本任务所需的事实、证据、版本与决策。跨企业或代理所边界时，仅共享确认的交付快照。</p></div><button className="btn btn-ink full-btn" onClick={() => setModal('task')}>给{currentDept.name}交办任务<ArrowRight size={15} /></button></aside>
          </div>
        </ListPage>}

        {view === 'studio' && <ListPage title="部门" subtitle="花名册管编制；工作室配置 Skill、提示词与 MCP。同一页完成，不再分两个入口。" action="添加专家" onAction={() => setModal('expert')}>
          <section className="dept-roster-section" aria-label="部门花名册">
            <div className="company-section-head"><div><span className="section-kicker">花名册</span><h2>{role === 'enterprise' ? '部门与专家' : '专业团队'}</h2></div><Status tone="green">10 个部门</Status></div>
            <div className="department-layout roster-compact">
              <div className="department-list">{departments.map(d => <button key={d.id} className={activeDept === d.id ? 'active' : ''} onClick={() => { setActiveDept(d.id); setStudioTab('department') }}><span className="dept-stage">{d.stage}</span><div><strong>{d.name}</strong><p>{d.desc}</p><small>{d.experts.length + (activeDept === d.id ? customExperts.length : 0)} 位专家 · 交付{d.output}</small></div><ChevronRight size={17} /></button>)}</div>
              <aside className="department-detail"><span className="section-kicker">{currentDept.stage}节点</span><h2>{currentDept.name}</h2><p>{currentDept.desc}</p><div className="dept-io"><div><small>接收</small><strong>项目事实、上一节点交付物</strong></div><ArrowRight size={17} /><div><small>交付</small><strong>{currentDept.output}</strong></div></div><h3>部门成员</h3>{currentDept.experts.map((e, i) => <div className="expert-row" key={e}><Avatar name={e} /><div><strong>{e}</strong><small>{i === 0 ? '主责 · 自动接收本节点任务' : '协作 · 按需参与交叉核查'}</small></div><button className="icon-btn" onClick={() => notify(`${e}的工作说明已打开`)} aria-label={`配置专家：${e}`}><Settings2 size={16} /></button></div>)}{customExperts.map(e => <div className="expert-row" key={e}><Avatar name={e} human /><div><strong>{e}</strong><small>自定义专家 · 按需参与</small></div><Status tone="green">已加入</Status></div>)}<button className="add-expert" onClick={() => setModal('expert')}><Plus size={16} />添加或自定义专家</button><div className="department-rule"><ShieldCheck size={18} /><p><strong>按需继承，不越权共享</strong><br />下一部门只继承本任务所需的事实、证据、版本与决策。</p></div><button className="btn btn-ink full-btn" onClick={() => setModal('task')}>给{currentDept.name}交办任务<ArrowRight size={15} /></button></aside>
            </div>
          </section>
          <section className="dept-studio-section" aria-label="工作室配置">
            <div className="company-section-head" style={{ marginTop: 28, marginBottom: 14 }}><div><span className="section-kicker">工作室配置</span><h2>Skill · 提示词 · MCP · 发布</h2></div></div>
          <div className="studio-layout">
            <aside className="studio-departments"><div className="studio-side-head"><span>部门模板</span><button className="sidebar-new-chip" onClick={() => notify('已创建部门草稿')} aria-label="新建部门"><Plus size={14} /><span>新建</span></button></div>{departments.map(d => <button key={d.id} className={activeDept === d.id ? 'active' : ''} onClick={() => { setActiveDept(d.id); setTestPassed(false); setPublished(false) }}><span><strong>{d.name}</strong><small>{d.id === 'disclosure' ? '团队模板 · V1.3' : '组织模板 · V1.0'}</small></span><ChevronRight size={15} /></button>)}</aside>
            <section className="studio-main">
              <header className="studio-head"><div><span className="section-kicker">正在配置</span><h2>{currentDept.name}</h2><p>{currentDept.desc}</p></div><div><Status tone="green">已发布 V1.3</Status><button className="btn btn-secondary" onClick={() => setStudioTab('release')}><Rocket size={15} />测试与发布</button></div></header>
              <nav className="studio-tabs" aria-label="专业配置">{([['department', '部门组成'], ['experts', '专家定义'], ['skills', 'Skill'], ['prompt', '提示词'], ['mcp', 'MCP'], ['release', '测试与发布']] as const).map(([id, label]) => <button key={id} className={studioTab === id ? 'active' : ''} aria-pressed={studioTab === id} onClick={() => setStudioTab(id)}>{label}</button>)}</nav>
              <div className="studio-body">
                {studioTab === 'department' && <div className="config-section"><div className="config-title"><div><h3>部门如何完成一次交付</h3><p>部门负责分工、接力、复核与验收，不是专家名单的简单集合。</p></div><button className="btn btn-secondary" onClick={() => setModal('expert')}><Plus size={14} />添加专家</button></div><div className="department-flow"><div><span>01</span><strong>主责专家起草</strong><small>读取本任务所需事实与证据</small></div><ArrowRight size={18} /><div><span>02</span><strong>协作专家核查</strong><small>按 Skill 执行检查与补充</small></div><ArrowRight size={18} /><div><span>03</span><strong>真实人员复核</strong><small>确认后形成{currentDept.output}</small></div></div>{currentDept.experts.map((e, i) => <div className="expert-row" key={e}><Avatar name={e} /><div><strong>{e}</strong><small>{i === 0 ? '主责 · 组织输入、起草与自检' : '协作 · 交叉核查与例外处理'}</small></div><button className="btn btn-secondary" onClick={() => setStudioTab('experts')}>配置职责</button></div>)}<div className="department-rule"><ShieldCheck size={18} /><p><strong>验收与权限</strong><br />交付必须绑定来源、版本和复核记录；跨组织仅共享确认快照。</p></div></div>}
                {studioTab === 'experts' && <div className="config-section"><div className="config-title"><div><h3>专家定义</h3><p>专家定义“负责什么、不能做什么”，具体方法由 Skill 提供。</p></div><Status>个人草稿</Status></div><div className="config-form"><label>专家名称<input name="studio_expert_name" autoComplete="off" defaultValue={currentDept.experts[0]} /></label><label>职责与责任边界<textarea name="studio_expert_duty" autoComplete="off" rows={4} defaultValue={`负责${currentDept.name}的主责任务；核验输入完整性，组织起草与自检。不得替代真实代理师作最终法律判断，不得补造技术事实。`} /></label><div className="form-two"><label>参与方式<select name="studio_expert_mode" autoComplete="off" defaultValue="每个本部门任务均参与"><option>每个本部门任务均参与</option><option>按需参与</option><option>仅指定时参与</option></select></label><label>异常时升级给<select name="studio_expert_escalate" autoComplete="off" defaultValue="真实代理师"><option>真实代理师</option><option>知产负责人</option><option>企业研发负责人</option></select></label></div><div className="config-actions"><span>保存为草稿，不影响进行中的项目</span><button className="btn btn-ink" onClick={() => notify('专家定义已保存为个人草稿')}>保存专家草稿</button></div></div></div>}
                {studioTab === 'skills' && <div className="config-section"><div className="config-title"><div><h3>绑定 Skill</h3><p>Skill 提供方法、流程、模板、规则和示例，可跨专家复用。</p></div><button className="btn btn-secondary" onClick={() => notify('Skill 模板库已打开')}><Library size={14} />从模板库添加</button></div><div className="skill-grid">{[['技术事实完整性核查', '检查问题、方案、效果与替代实施方式是否闭环', '团队模板 · V2.1'], ['交底书结构化撰写', '按中国发明专利交底结构组织内容与追问', '组织模板 · V3.4'], ['证据来源与引用检查', '确保结论能够回到文献、段落和检索日期', '组织模板 · V1.8']].map((s, i) => <article key={s[0]}><div><FileCheck2 size={18} /><Status tone={i === 0 ? 'orange' : 'green'}>{i === 0 ? '待更新' : '已绑定'}</Status></div><h4>{s[0]}</h4><p>{s[1]}</p><footer><span>{s[2]}</span><button onClick={() => notify(`${s[0]}配置已打开`)}>查看规则<ArrowUpRight size={13} /></button></footer></article>)}</div></div>}
                {studioTab === 'prompt' && <div className="config-section"><div className="config-title"><div><h3>提示词与行为约束</h3><p>约束判断原则、表达方式和禁止事项，不把密钥或可变业务数据写进提示词。</p></div><Status>部门统一规则</Status></div><div className="prompt-editor"><div><span>system_prompt.md</span><small>草稿自动保存于本地演示</small></div><textarea name="studio_prompt" autoComplete="off" value={prompt} onChange={e => { setPrompt(e.target.value); setTestPassed(false); setPublished(false) }} rows={9} aria-label="部门提示词" /><footer><span>{prompt.length} 字 · 继承组织安全规则</span><button className="btn btn-ink" onClick={() => notify('提示词草稿已保存')}>保存草稿</button></footer></div><div className="department-rule"><CircleAlert size={18} /><p><strong>优先级</strong><br />组织安全与权限规则 ＞ 部门规则 ＞ 专家个性约束 ＞ 单次任务说明。</p></div></div>}
                {studioTab === 'mcp' && <div className="config-section"><div className="config-title"><div><h3>MCP 数据与工具连接</h3><p>连接只提供必要能力；凭据由管理员保管，专家按任务获得最小权限。</p></div><button className="btn btn-secondary" onClick={() => notify('连接申请已提交管理员')}><Cable size={14} />申请新连接</button></div><div className="mcp-list">{[['专利文献检索', '只读 · 检索与文献正文', '组织已连接'], ['企业研发文档库', '只读 · 当前项目授权目录', '项目授权'], ['案件与期限管理', '读写 · 仅本部门负责案件', '组织已连接']].map(m => <div key={m[0]}><span className="mcp-icon"><Cable size={17} /></span><div><strong>{m[0]}</strong><small>{m[1]} · {m[2]}</small></div><button className={`toggle ${mcpEnabled.includes(m[0]) ? 'on' : ''}`} role="switch" aria-checked={mcpEnabled.includes(m[0])} aria-label={`${m[0]}连接`} onClick={() => { setMcpEnabled(v => v.includes(m[0]) ? v.filter(x => x !== m[0]) : [...v, m[0]]); setTestPassed(false); setPublished(false) }}><span /></button></div>)}</div><div className="department-rule"><ShieldCheck size={18} /><p><strong>最小权限与审计</strong><br />禁止把访问密钥写入提示词；所有外部读取、写入与交付动作保留调用记录。</p></div></div>}
                {studioTab === 'release' && <div className="config-section"><div className="config-title"><div><h3>试运行、发布与回滚</h3><p>配置只有通过样例测试和权限检查，才能成为团队或组织模板。</p></div><Status tone={testPassed ? 'green' : 'orange'}>{testPassed ? '测试通过' : '待测试'}</Status></div><div className="release-grid"><div><FlaskConical size={20} /><h4>01 · 样例试运行</h4><p>使用“磁驱泵交底书 V3”验证输入读取、专家接力、输出结构和人工升级。</p><button className="btn btn-secondary" onClick={() => { setTestPassed(true); notify('3 个样例测试通过，权限检查通过') }}><FlaskConical size={14} />{testPassed ? '重新运行测试' : '运行 3 个样例'}</button></div><div><Rocket size={20} /><h4>02 · 发布新版本</h4><p>发布范围：团队模板。进行中的项目继续使用原版本，新项目可选择 V1.4。</p><button className="btn btn-ink" disabled={!testPassed || published} onClick={() => { setPublished(true); notify('V1.4 已发布；进行中项目仍使用原版本') }}><Rocket size={14} />{published ? '已发布 V1.4' : '发布 V1.4'}</button></div></div><div className="version-table"><div><strong>版本</strong><strong>范围</strong><strong>状态</strong><strong>项目策略</strong></div><div><span>V1.3</span><span>团队模板</span><Status tone="green">当前正式版</Status><span>进行中项目继续使用</span></div><div><span>V1.4</span><span>个人草稿</span><Status tone={published ? 'green' : 'neutral'}>{published ? '已发布' : testPassed ? '可发布' : '草稿'}</Status><span>不追溯修改旧项目</span></div></div><button className="text-btn" onClick={() => notify('已打开 V1.2 回滚预览，尚未执行回滚')}><GitBranch size={14} />查看历史版本与回滚预览</button></div>}
              </div>
            </section>
          </div>
          </section>
        </ListPage>}

      </main>
    </div>

    <input ref={fileInputRef} type="file" multiple accept={FILE_ACCEPT} className="sr-file-input" aria-hidden="true" tabIndex={-1} onChange={e => { ingestFiles(e.target.files, uploadTargetRef.current === 'compose' ? 'compose' : 'docket'); e.target.value = '' }} />
    <input ref={newCaseInputRef} type="file" multiple accept={FILE_ACCEPT} className="sr-file-input" aria-hidden="true" tabIndex={-1} onChange={e => { ingestFiles(e.target.files, 'newcase'); e.target.value = '' }} />
    {toast && <div className="toast" role="status" aria-live="polite"><CheckCircle2 size={17} />{toast}</div>}

    {searchOpen && <Modal title="搜索 Novada Team" subtitle="项目、案件、文件和部门，都可以从这里直达。" onClose={() => { setSearchOpen(false); setSearch('') }}>
      <div className="command-search"><Search size={19} /><input name="global_search" autoComplete="off" autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="输入名称、编号或工作内容…" aria-label="搜索项目、文件或部门" /><kbd>ESC</kbd></div><div className="search-results">{filteredSearch.slice(0, 8).map(item => <button key={item.title} onClick={() => { item.action(); setSearchOpen(false); setSearch('') }}><Search size={15} /><span><strong>{item.title}</strong><small>{item.meta}</small></span><ArrowUpRight size={15} /></button>)}{filteredSearch.length === 0 && <div className="empty-search">没有找到匹配内容，试试“交底书”或“FTO”。</div>}</div>
    </Modal>}

    {modal === 'new' && <Modal title={role === 'enterprise' ? '启动一个新项目' : '新建案件'} subtitle="不用选择 Agent。告诉我们业务目标，系统会推荐负责部门和推进路径。" onClose={() => { setModal(null); setNewCaseFiles([]) }}>
      <form className="form-stack" onSubmit={e => {
        e.preventDefault()
        if (newCaseFiles.length) {
          setDocket(v => [
            ...newCaseFiles.map(f => ({ id: f.id, name: f.name, bucket: 'input' as DocketBucket, note: '用户上传 · 开案首包', source: 'upload' as const })),
            ...v,
          ])
          setComposeFiles(v => [...v, ...newCaseFiles])
        }
        const n = newCaseFiles.length
        setNewCaseFiles([])
        setModal(null)
        notify(n ? `项目已建立，首包 ${n} 个文件已归入输入材料；创新启发部开始整理` : '项目已建立，创新启发部开始整理输入')
        openWorkbench(false)
      }}><label>项目或技术名称<input name="project_name" autoComplete="off" required defaultValue="" placeholder="例如：一种低噪声磁驱泵控制方案" /></label><label>你想解决什么问题？<textarea name="project_goal" autoComplete="off" required rows={4} placeholder="可以直接粘贴研发描述，不需要使用专利语言…" /></label><div className="form-two"><label>业务场景<select name="project_scene" autoComplete="off" defaultValue="研发成果保护"><option>研发成果保护</option><option>新产品上市风险排查</option><option>收到审查意见</option><option>已有专利运营</option></select></label><label>期望申请类型<select name="project_type" autoComplete="off" defaultValue="由部门建议"><option>由部门建议</option><option>发明专利</option><option>实用新型</option><option>发明 + 实用新型</option></select></label></div><div className="form-attach"><div className="form-attach-head"><span>首包材料（可选）</span><button type="button" className="btn btn-secondary" onClick={() => openFilePicker('newcase')}><Paperclip size={14} />选择文件</button></div><p className="attach-hint">{FILE_ACCEPT_HINT} · 开案后归入项目「输入」材料，不是全局知识库</p>{newCaseFiles.length > 0 && <ul className="attach-chip-list" aria-label="开案首包">{newCaseFiles.map(f => <li key={f.id}><Files size={12} /><span>{f.name}</span><button type="button" aria-label={`移除 ${f.name}`} onClick={() => setNewCaseFiles(v => v.filter(x => x.id !== f.id))}><X size={12} /></button></li>)}</ul>}</div><div className="form-hint"><Sparkles size={16} /><span>建议首站：创新启发部 → 专利挖掘部。后续会根据项目情况调整，而非固定走完整条流程。</span></div><div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => { setModal(null); setNewCaseFiles([]) }}>取消</button><button className="btn btn-primary" type="submit">建立项目并开始<ArrowRight size={16} /></button></div></form>
    </Modal>}

    {modal === 'task' && <Modal title="交办一项任务" subtitle={`${currentDept.name}会在权限范围内读取本任务所需内容，你只需说明目标与限制。`} onClose={() => setModal(null)}><form className="form-stack" onSubmit={e => { e.preventDefault(); setModal(null); notify(`任务已交给${currentDept.name}`); openWorkbench(false) }}><label>任务目标<textarea name="task_goal" autoComplete="off" required rows={4} defaultValue={currentDept.id === 'risk' ? '针对计划在中国上市的 MP-300 新产品开展 FTO 分析，重点排查磁驱控制与密封结构。' : ''} placeholder="例如：上市前排查这款产品在中国的专利风险" /></label><label>希望交付物<select name="task_deliverable" autoComplete="off"><option>{currentDept.output}</option><option>部门建议的完整交付包</option></select></label><label>需要重点照顾的要求<input name="task_notes" autoComplete="off" placeholder="时间、预算、目标市场或指定专家（选填）" /></label><div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>取消</button><button className="btn btn-primary" type="submit">确认交办<ArrowRight size={16} /></button></div></form></Modal>}

    {modal === 'expert' && <Modal title="添加一位专家" subtitle="用职责与工作方式定义专家，不需要配置提示词、模型或工具链。" onClose={() => setModal(null)}><form className="form-stack" onSubmit={e => { e.preventDefault(); const data = new FormData(e.currentTarget); const name = String(data.get('expert') || '自定义专家'); setCustomExperts(v => [...v, name]); setModal(null); notify(`${name}已加入${currentDept.name}`) }}><label>专家名称<input name="expert" autoComplete="off" required placeholder="例如：泵行业资深技术顾问" /></label><label>加入部门<select name="expert_dept" autoComplete="off" defaultValue={currentDept.name}>{departments.map(d => <option key={d.id}>{d.name}</option>)}</select></label><label>他 / 她擅长什么？<textarea name="expert_skill" autoComplete="off" required rows={3} placeholder="例如：熟悉磁驱泵结构，擅长判断技术方案能否落地" /></label><label>参与方式<select name="expert_mode" autoComplete="off"><option>按需参与，由部门负责人邀请</option><option>每个任务都参与交叉复核</option><option>只在我指定时参与</option></select></label><div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>取消</button><button className="btn btn-primary" type="submit">加入部门</button></div></form></Modal>}

    {modal === 'handoff' && <Modal title={oaMode ? role === 'agency' ? '交付客户确认' : '确认 OA 答复策略' : storageMode ? '确认质检与申请文件' : handedOff ? '部门接力记录' : '把项目交给下一部门'} subtitle="按权限继承所需事实、证据、版本与决策；跨组织时只共享交付快照。" onClose={() => setModal(null)}>
      <div className="handoff-visual"><div><Avatar name={oaMode ? '答' : storageMode ? '质' : '交'} /><strong>{oaMode ? 'OA 答复部' : storageMode ? '质量审查部' : '交底书部'}</strong><small>{oaMode ? '答复策略与文本已形成' : storageMode ? '质检版本与核查项已形成' : '技术事实已确认'}</small></div><span><ArrowRight size={21} /></span><div><Avatar name={oaMode ? '陈' : storageMode ? '王' : '申'} human={oaMode || storageMode} /><strong>{oaMode ? role === 'agency' ? '澄明科技 · 陈宇' : '陈宇 · 企业确认' : storageMode ? '王工 · 企业确认' : '申请文件部'}</strong><small>{oaMode ? '确认策略与修改范围' : storageMode ? '确认文本与申请策略' : '设计权利要求与说明书'}</small></div></div>
      <div className="handoff-package"><h3>{oaMode || storageMode ? '本次交付快照包含' : '下一部门按需继承'}</h3>{(oaMode ? ['意见陈述书与权利要求修改对照', '证据比对表、来源与答复策略', '需要企业确认的修改范围', '交付人、时间、可见范围与确认记录'] : storageMode ? ['权利要求草案 V4 与说明书质检 Q2', '检索依据、核查项与复核结论', '需要企业确认的保护范围', '交付人、时间、可见范围与确认记录'] : ['本节点所需的技术事实与商业目标', '当前确认版本及必要历史版本', '引用证据、来源与比对结论', '相关权限、待办期限与已确认决策']).map(x => <div key={x}><Check size={15} />{x}</div>)}<p>不包含内部讨论、未确认草稿和无关资料。</p></div>
      <div className="delivery-snapshot"><div><span>交付快照</span><strong>{activeDoc}</strong></div><div><span>交付人</span><strong>{role === 'agency' ? '林岚 · 专利代理师' : '顾言 · 知产负责人'}</strong></div><div><span>可见范围</span><strong>{oaMode || role === 'agency' ? '双方共享' : '企业内部'}</strong></div><div><span>记录时间</span><strong>2026-10-24 10:42</strong></div></div>
      <div className="decision-check"><CircleAlert size={17} /><p>{oaMode || storageMode ? '企业确认前，文本不会进入签署递交环节；确认后仍保留完整版本与回退记录。' : '下一部门完成后，涉及保护范围与申请策略的内容仍会交由你和代理师确认。'}</p></div>
      <div className="modal-actions"><button className="btn btn-secondary" onClick={() => setModal(null)}>关闭</button><button className="btn btn-primary" onClick={() => { setModal(null); if (role === 'enterprise' && !oaMode && !handedOff) setHandedOff(true); notify(oaMode ? role === 'agency' ? '已发送客户确认，交付快照已归档' : '答复策略已确认，交付快照已回传代理所' : storageMode ? role === 'agency' ? '质检与申请文件已发送客户确认' : '质检与申请文件已确认，交付快照已归档' : role === 'agency' ? '交付快照已发送客户确认' : handedOff ? '接力记录已展开' : '申请文件部已接手，所需内容已按权限继承') }}>{oaMode ? role === 'agency' ? '发送确认' : '确认并回传' : storageMode ? role === 'agency' ? '发送确认' : '确认并归档' : role === 'agency' ? '发送确认' : handedOff ? '查看记录' : '确认接力'}<ArrowRight size={16} /></button></div>
    </Modal>}

    {modal === 'review' && <Modal title="确认本节点决策" subtitle="系统把专业内容翻译成需要你判断的事项，并保留确认记录。" onClose={() => setModal(null)}><div className="review-summary"><span className="section-kicker">建议方案</span><h3>{view === 'workbench' && oaMode ? '采用“有限修改 + 创造性争辩”答复策略' : view === 'workbench' && storageMode ? '确认装置与方法权利要求层次，完成质检后进入递交复核' : '核心控制方法申请发明，关键结构同步申请实用新型'}</h3><p>{view === 'workbench' && oaMode ? '独立权利要求仅并入“基于温差动态调整清洗时长”特征，保留其余参数在从属权利要求中。' : view === 'workbench' && storageMode ? '独立权利要求保留分流控制的核心组合，具体阈值置于从属权利要求；两项文本一致性问题由代理师继续复核。' : '兼顾授权前景、保护范围和上市节奏。申请文件部将分别组织权利要求，避免简单重复。'}</p></div><div className="review-options"><label><input type="radio" name="decision" defaultChecked /><span><strong>采纳部门建议</strong><small>进入下一节点，由代理师继续复核</small></span></label><label><input type="radio" name="decision" /><span><strong>需要补充讨论</strong><small>保留当前节点，并发起项目内协同</small></span></label></div><div className="modal-actions"><button className="btn btn-secondary" onClick={() => setModal(null)}>稍后决定</button><button className="btn btn-primary" onClick={() => { setModal(null); notify('决策已确认并写入项目记录') }}>确认决策</button></div></Modal>}

    {messagesOpen && <Modal title="全部消息" subtitle="来自代理师与部门的会话。首页只强调待办，消息从这里进入。" onClose={() => setMessagesOpen(false)}>
      <div className="home-msg-list messages-modal-list">{[
        ['林岚 · 代理师', '请确认 D1 是否对应你们旧款产品', '磁驱泵智能控制系统', '10:31', 0],
        ['申请文件部', '权利要求草案已形成，等待你确认保护层次', '模块化储能热管理', '昨天', 1],
        ['风险排查部', '发现 1 件高风险专利，建议安排技术比对', '高速视觉检测设备', '周二', 2],
      ].map((m) => <button key={String(m[0])} onClick={() => { setMessagesOpen(false); if (Number(m[4]) === 2) { setActiveDept('risk'); setModal('task') } else openWorkbench(false, Number(m[4]) === 1 ? 'storage' : 'magnetic') }}><Avatar name={String(m[0])} human={Number(m[4]) === 0} /><span><strong>{m[0]}</strong><small>{m[1]}</small><em>{m[2]} · {m[3]}</em></span><ChevronRight size={15} /></button>)}</div>
    </Modal>}

    {modal === 'guide' && <Modal title="产品逻辑与原型导览" subtitle="一个工作区、一个负责人、三种使用深度。模式只改变可见能力，不改变项目数据。" wide onClose={() => setModal(null)}><div className="guide-body">
      <section><span className="guide-number">01</span><div><h3>官网、登录、首页与项目执行分工</h3><p>官网解释产品价值，登录进入对应空间；首页承接委托与跨案待办（含消息）；项目管对象与工作台；部门管花名册与工作室。首次空状态与已有工作演示明确区分。</p></div></section>
      <section><span className="guide-number">02</span><div><h3>首页、项目、部门，共享同一业务底座</h3><p>首页：顾言委托、跨案待办与消息；项目：对象列表与工作台；部门：花名册 + 工作室配置（Skill、提示词、MCP）。协同消息从首页「全部消息」或顶栏通知进入，不做首页双强调、不做第四主 tab。切换模式不会另建项目或丢失版本。</p></div></section>
      <section><span className="guide-number">03</span><div><h3>两条业务主线，多种对象独立推进</h3><p>权利形成线覆盖创新、挖掘、布局、申请、审查与运营；风险防控线覆盖产品拆解、FTO、比对和规避。研发项目、申请案件、产品风险与专利资产分别管理状态，可关联、并行、回退或重开。</p></div></section>
      <section><span className="guide-number">04</span><div><h3>三类空间，按权限接力</h3><p>企业私有、代理所私有和双方共享空间相互隔离。部门只继承本任务所需的事实、证据、版本与决策；跨组织交付绑定版本、交付人、时间、可见范围和确认记录。</p></div></section>
      <section><span className="guide-number">05</span><div><h3>协同与文书双视图，确认控制流程</h3><p>协同工作视图呈现顾言计划、部门分工、专家任务、连续指令、交付依据和确认分支；文书工作视图保留卷宗、版本与编辑。技术事实确认后还要确认节点交付，再由用户决定是否接力，不会自动递交。</p></div></section>
      <div className="guide-demo"><strong>建议这样体验原型</strong><div><button onClick={() => { switchRole('enterprise'); switchMode('assistant'); setModal(null) }}>企业首页</button><ArrowRight size={15} /><button onClick={() => { switchRole('enterprise'); switchMode('project'); setModal(null) }}>项目列表</button><ArrowRight size={15} /><button onClick={() => { switchMode('studio'); setModal(null) }}>部门</button><ArrowRight size={15} /><button onClick={() => { switchRole('agency'); openWorkbench(true); setModal(null) }}>代理所 OA 工作台</button></div></div>
    </div></Modal>}
  </div>
}

function ListPage({ title, subtitle, action, onAction, children }: { title: string; subtitle: string; action: string; onAction: () => void; children: React.ReactNode }) {
  return <div className="list-page"><section className="page-title"><div><h1>{title}</h1><p>{subtitle}</p></div><button className="btn btn-primary" onClick={onAction}><Plus size={16} />{action}</button></section>{children}</div>
}

function EnterpriseDocument({ doc, onEdit }: { doc: string; onEdit: () => void }) {
  if (doc === '检索报告') return <article className="document"><div className="doc-meta"><span>检索报告 · R2</span><Status tone="green">23 件证据已核验来源</Status></div><h1>磁驱泵智能控制系统<br />可专利性检索报告</h1><p className="doc-lead">检索目的：评估拟申请技术方案的新颖性与创造性风险。本报告不替代针对产品实施的 FTO 分析。</p><h2>一、结论摘要</h2><p>在已检索的中国专利文献中，未发现单独公开全部核心技术特征的文献。D1 与温度异常检测相关，D2 涉及磁驱泵转速控制，两者组合可能对创造性评价产生影响。</p><table><thead><tr><th>证据</th><th>相关特征</th><th>初步判断</th></tr></thead><tbody><tr><td>D1 · CN114820391A</td><td>温度采集、异常报警</td><td>未公开自适应评分修正</td></tr><tr><td>D2 · CN116203877A</td><td>磁驱泵转速闭环</td><td>控制目标不同</td></tr><tr><td>D3 · CN209164282U</td><td>泵体密封结构</td><td>建议纳入结构申请评估</td></tr></tbody></table><div className="doc-callout"><ShieldCheck size={19} /><p><strong>范围提示</strong><br />可专利性回答“能否获得专利”，FTO 回答“实施产品是否可能落入他人权利要求”。两者目的、检索范围和判断方法不同。</p></div></article>
  if (doc === '权利要求草案') return <article className="document" contentEditable suppressContentEditableWarning onInput={onEdit}><div className="doc-meta"><span>权利要求书 · 草案 V1</span><Status tone="orange">申请文件部起草中</Status></div><h1>权利要求书</h1><p><strong>1.</strong> 一种磁驱泵的智能控制方法，其特征在于，包括：</p><p>获取磁驱泵在运行过程中的温度参数、振动参数和转速参数；</p><p>根据所述温度参数与所述振动参数确定初始异常评分，并依据所述转速参数对应的运行工况对所述初始异常评分进行自适应修正，得到目标异常评分；</p><p>在所述目标异常评分满足预设条件时，调整所述磁驱泵的运行参数。</p><p><strong>2.</strong> 根据权利要求 1 所述的方法，其特征在于，所述运行工况至少包括启动工况、稳态运行工况和变载荷工况。</p><p><strong>3.</strong> 根据权利要求 1 所述的方法，其特征在于，所述自适应修正包括根据历史运行数据确定各运行工况对应的评分修正系数。</p><div className="doc-comment"><MessageSquareText size={16} /><p><strong>代理师提示</strong>：独权暂不加入具体阈值，避免不必要缩小保护范围；是否覆盖量产方案仍需研发确认。</p></div></article>
  if (doc === '审批记录') return <article className="document"><div className="doc-meta"><span>项目决策与审批</span><Status tone="green">全程留痕</Status></div><h1>审批与版本记录</h1><div className="audit-list">{[['10:31', '林岚 · 代理师', '完成交底书专业复核', '确认技术方案具备撰写基础，建议保留异常评分修正层。'], ['10:12', '陈宇 · 研发负责人', '确认技术效果', '确认异常识别时间缩短约 35%，测试条件为 2.5 kW 稳态工况。'], ['09:48', '交底书部', '形成 V3 版本', '补充控制流程、技术效果和两个替代实施方式。'], ['昨天', '布局策略部', '提交组合建议', '核心方法申请发明，密封结构同步评估实用新型。']].map(r => <div key={r[0]}><time>{r[0]}</time><span /><section><strong>{r[1]}</strong><h3>{r[2]}</h3><p>{r[3]}</p></section></div>)}</div></article>
  return <article className="document" contentEditable suppressContentEditableWarning onInput={onEdit}><div className="doc-meta"><span>技术交底书 · V3</span><Status tone="orange">2 处待研发确认</Status></div><h1>一种磁驱泵的智能控制方法及系统</h1><p className="doc-lead">本交底书用于向代理师完整说明技术方案。请重点确认黄色标记的技术事实，其他文字由交底书部维护。</p><h2>一、要解决的技术问题</h2><p>现有磁驱泵通常在温度或振动参数超过固定阈值时触发报警。由于启动、稳态运行和变载荷状态下的正常参数范围不同，固定阈值容易产生误报，或者无法及时识别早期异常。</p><h2>二、核心技术方案</h2><p>控制器分别获取温度传感器、振动传感器和转速传感器的数据，先根据温度参数与振动参数确定初始异常评分，再根据当前转速所对应的运行工况，对初始异常评分进行自适应修正。</p><p>当目标异常评分满足预设条件时，控制器调整磁驱泵的转速或触发停机保护，并记录对应的工况与参数变化。</p><div className="doc-comment"><MessageSquareText size={16} /><p><strong>技术访谈专家</strong>：这里已补充“先评分、再按工况修正”的处理顺序。请确认它与实际程序一致。</p><span className="doc-location">当前位置</span></div><h2>三、达到的技术效果</h2><p>通过区分运行工况修正异常评分，可以降低启动和变载荷阶段的误报，并提高早期异常识别的及时性。</p><p className="fact-highlight">在 2.5 kW 磁驱泵样机的稳态运行测试中，异常识别平均时间由 18 秒缩短至 11.7 秒，误报率由 8.2% 降至 3.1%。<span>待确认测试样本与工况</span></p><h2>四、可替代实施方式</h2><p>异常评分可以采用加权求和、规则模型或经训练的机器学习模型获得；传感器数据可以采用同步采样，也可以按设定时间窗口对齐。</p></article>
}

function StorageDocument({ doc, onEdit }: { doc: string; onEdit: () => void }) {
  if (doc === '说明书质检') return <article className="document"><div className="doc-meta"><span>申请文件质检 · Q2</span><Status tone="orange">2 项待复核</Status></div><h1>说明书与权利要求一致性核查</h1><p className="doc-lead">案件：CN202610512086.4 · 模块化储能热管理装置</p><table><thead><tr><th>核查项</th><th>结果</th><th>处理建议</th></tr></thead><tbody><tr><td>权利要求引用关系</td><td>通过</td><td>保留当前 10 项权利要求</td></tr><tr><td>液冷流道技术特征支持</td><td>通过</td><td>对应说明书第 [0036]—[0041] 段</td></tr><tr><td>温度参数范围一致性</td><td>待复核</td><td>核对实施例与权利要求 6 的上下限</td></tr><tr><td>附图标记一致性</td><td>待复核</td><td>统一导流板与分流板名称</td></tr></tbody></table><div className="doc-callout"><FileCheck2 size={18} /><p><strong>复核边界</strong><br />质量审查部负责文本核查；保护范围与申请策略仍由企业和代理师共同确认。</p></div></article>
  if (doc === '检索报告') return <article className="document"><div className="doc-meta"><span>可专利性检索 · R1</span><Status tone="green">来源已核验</Status></div><h1>模块化储能热管理装置<br />可专利性检索摘要</h1><p className="doc-lead">本报告用于评估拟申请方案的新颖性与创造性，不构成产品实施的 FTO 结论。</p><h2>核心发现</h2><p>D1 公开液冷板内部流道，D2 公开储能电池温度分区控制，均未直接公开“根据模组温差调整分流板开度”的组合控制关系。</p><div className="doc-callout"><ShieldCheck size={18} /><p><strong>撰写建议</strong><br />保留结构权利要求与控制方法权利要求的层次，避免将具体温度阈值写入独立权利要求。</p></div></article>
  if (doc === '审批记录') return <article className="document"><div className="doc-meta"><span>申请案件决策记录</span><Status tone="green">版本可追溯</Status></div><h1>质检与确认记录</h1><div className="audit-list">{[['10:08', '质量审查专家', '形成 Q2 质检版本', '标记温度参数范围和附图标记两项待复核内容。'], ['昨天', '林岚 · 代理师', '确认权利要求层次', '装置独权与控制方法独权分别组织，从属权利要求覆盖关键实施方式。'], ['10 月 22 日', '王工 · 企业研发', '确认量产结构', '确认分流板开度可根据模组温差自动调整。']].map(r => <div key={r[0]}><time>{r[0]}</time><span /><section><strong>{r[1]}</strong><h3>{r[2]}</h3><p>{r[3]}</p></section></div>)}</div></article>
  return <article className="document" contentEditable suppressContentEditableWarning onInput={onEdit}><div className="doc-meta"><span>权利要求书 · 草案 V4</span><Status tone="orange">质量审查部复核中</Status></div><h1>权利要求书</h1><p><strong>1.</strong> 一种模块化储能热管理装置，包括电池模组、液冷板、温度采集组件和控制器，其特征在于：</p><p>所述液冷板设有主流道和与所述主流道连通的多个分流道，各分流道分别对应所述电池模组的不同温度分区；</p><p>所述控制器根据各温度分区之间的温差调整对应分流道的开度，以分配进入各温度分区的冷却液流量。</p><p><strong>2.</strong> 根据权利要求 1 所述的装置，其特征在于，所述分流道的开度由设置于分流道入口的电控阀调整。</p><p><strong>6.</strong> 根据权利要求 1 所述的装置，其特征在于，所述控制器在所述温差达到第一设定值时增大高温温度分区对应分流道的开度。</p><div className="doc-comment"><MessageSquareText size={16} /><p><strong>质量审查专家</strong>：权利要求 6 的第一设定值需与实施例参数范围核对；不建议在独立权利要求中加入固定温度阈值。</p><span className="doc-location">关联当前质检项</span></div></article>
}

function AgencyDocument({ doc, onEdit }: { doc: string; onEdit: () => void }) {
  if (doc === '审查意见原文') return <article className="document"><div className="doc-meta"><span>第一次审查意见通知书</span><Status tone="red">答复期限：剩余 18 天</Status></div><h1>审查意见通知书</h1><p className="doc-lead">申请号：CN202610483217.6　申请人：澄明科技有限公司</p><h2>审查意见摘要</h2><p>权利要求 1 相对于对比文件 1 与对比文件 2 的结合不具备创造性。审查员认为，在对比文件 1 已公开膜组件清洗控制的基础上，本领域技术人员容易想到根据温差调整清洗时长。</p><h2>部门拆解</h2><p>争议集中于：① D1 是否公开温差参数的获取方式；② D2 是否给出动态调整清洗时长的技术启示；③ 组合后能否获得本申请的技术效果。</p></article>
  if (doc === '权利要求修改对照') return <article className="document" contentEditable suppressContentEditableWarning onInput={onEdit}><div className="doc-meta"><span>修改对照 · V2</span><Status tone="orange">未超出原始记载范围核查中</Status></div><h1>权利要求修改对照</h1><h2>权利要求 1</h2><p>一种膜分离系统的清洗控制方法，包括获取膜组件的入口温度、出口温度和跨膜压差；</p><p><mark>根据所述入口温度与出口温度之间的温差以及所述跨膜压差，动态调整清洗时长；</mark></p><p>按照调整后的清洗时长控制清洗装置运行。</p><div className="doc-callout"><FileCheck2 size={18} /><p><strong>修改依据</strong><br />原说明书第 [0048]—[0052] 段、原权利要求 4。质量审查部正在核对引用关系与全文一致性。</p></div></article>
  if (doc === '证据比对表') return <article className="document"><div className="doc-meta"><span>证据比对 · E3</span><Status tone="green">来源已核验</Status></div><h1>权利要求特征比对</h1><table><thead><tr><th>争议特征</th><th>D1</th><th>D2</th><th>本申请</th></tr></thead><tbody><tr><td>获取入口与出口温度</td><td>公开</td><td>未涉及</td><td>公开</td></tr><tr><td>结合温差与跨膜压差</td><td>未公开</td><td>仅公开压差</td><td>明确公开</td></tr><tr><td>动态调整清洗时长</td><td>固定时长</td><td>调整清洗压力</td><td>双参数联动</td></tr></tbody></table><div className="doc-callout"><CircleAlert size={18} /><p><strong>争辩重点</strong><br />D2 调整对象与技术目的不同，不能仅凭均涉及“清洗控制”即认定存在结合启示。</p></div></article>
  return <article className="document" contentEditable suppressContentEditableWarning onInput={onEdit}><div className="doc-meta"><span>意见陈述书 · V2</span><Status tone="orange">等待代理师复核</Status></div><h1>意见陈述书</h1><p className="doc-lead">针对第一次审查意见通知书 · 申请号 CN202610483217.6</p><h2>一、修改说明</h2><p>申请人将原权利要求 4 中“根据入口温度与出口温度之间的温差以及跨膜压差，动态调整清洗时长”的附加技术特征并入权利要求 1，其余权利要求的编号与引用关系作适应性调整。</p><h2>二、关于创造性</h2><p>修改后的权利要求 1 与对比文件 1 的区别至少在于：根据所述入口温度与出口温度之间的温差以及所述跨膜压差，动态调整清洗时长。</p><p>基于上述区别特征，本申请实际解决的技术问题是如何兼顾不同污染程度下的清洗效果与能耗，而非简单调整清洗过程。</p><p>对比文件 2 虽公开根据跨膜压差调整清洗压力，但其并未公开或暗示将温差与跨膜压差共同用于动态确定清洗时长，也未认识到上述双参数联动所产生的技术效果。</p><div className="doc-comment"><MessageSquareText size={16} /><p><strong>OA 策略专家</strong>：建议补充说明“温差反映污染层传热状态”的技术含义，强化非显而易见性论证。</p><span className="doc-location">依据已关联</span></div><h2>三、结论</h2><p>因此，对比文件 1 与对比文件 2 的结合不能得到修改后的权利要求 1 所限定的技术方案，修改后的权利要求 1 具备创造性。</p></article>
}
