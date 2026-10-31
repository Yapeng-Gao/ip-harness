/**
 * T7 带教淡出 · 对齐交互大纲 §7
 * 首次进某部短说明；「知道了」后本机记住；设置可重开。
 * 非全屏强制课。
 */
export const TEACH_FADE_KEY = 'ip-agent-teaching-fade-v1'

export type TeachFadeState = {
  /** deptId → dismissed */
  dismissed: Record<string, boolean>
  /** 全局重开开关：true = 强制再显示 */
  forceShow: boolean
}

function empty(): TeachFadeState {
  return { dismissed: {}, forceShow: false }
}

export function loadTeachFade(): TeachFadeState {
  try {
    if (typeof localStorage === 'undefined') return empty()
    const raw = localStorage.getItem(TEACH_FADE_KEY)
    if (!raw) return empty()
    const p = JSON.parse(raw) as TeachFadeState
    return {
      dismissed: p?.dismissed && typeof p.dismissed === 'object' ? p.dismissed : {},
      forceShow: Boolean(p?.forceShow),
    }
  } catch {
    return empty()
  }
}

export function saveTeachFade(state: TeachFadeState): void {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(TEACH_FADE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export function shouldShowTeachTip(deptId: string): boolean {
  const s = loadTeachFade()
  if (s.forceShow) return true
  return !s.dismissed[deptId]
}

export function dismissTeachTip(deptId: string): TeachFadeState {
  const s = loadTeachFade()
  const next = {
    ...s,
    forceShow: false,
    dismissed: { ...s.dismissed, [deptId]: true },
  }
  saveTeachFade(next)
  return next
}

export function reopenAllTeachTips(): TeachFadeState {
  const next: TeachFadeState = { dismissed: {}, forceShow: true }
  saveTeachFade(next)
  return next
}

export function clearForceShow(): TeachFadeState {
  const s = loadTeachFade()
  const next = { ...s, forceShow: false }
  saveTeachFade(next)
  return next
}

export type TeachCopy = {
  title: string
  body: string
  askLine: string
}

const COPY: Record<string, TeachCopy> = {
  'dept-intake': {
    title: '① 立项部 · 办完标志',
    body: '项目卡齐（名称/方向/状态）+ 你确认建项。',
    askLine: '要你拍：确认建项 / 改方向 / 搁置',
  },
  'dept-inspire': {
    title: '② 创新激发 · 办完标志',
    body: '问题→路径（含推荐）→ 你选题并收藏（或跳过留痕）。',
    askLine: '要你拍：选哪条路径 / 是否收藏',
  },
  'dept-mining': {
    title: '③ 专利挖掘 · 办完标志',
    body: '双路径择一：分析报告 或 可交④创新点包，经你确认。',
    askLine: '要你拍：确认点包交④ / 只要报告 / 改拆案',
  },
  'dept-disclosure': {
    title: '④ 交底部 · 办完标志',
    body: '交底质检全绿才可交⑤；全绿 ≠ 已递交申请。',
    askLine: '要你拍：事实确认 / 质检 / 可否交⑤',
  },
  'dept-draft': {
    title: '⑤ 申请部 · 办完标志',
    body: 'A理解→B申不申→C撰稿过线；过线 ≠ 确认递交。',
    askLine: '要你拍：申不申 / 保护范围 / 确认递交',
  },
  'dept-oa': {
    title: '⑥ 答复部 · 办完标志',
    body: '本轮答复可递交（D 过线）；须有现行申请文件。',
    askLine: '要你拍：答复策略 / 认风险 / 确认递交',
  },
  'dept-annuity': {
    title: '⑦ 维护部 · 办完标志',
    body: '期限/年费台账明白账 + 你确认缴费或暂缓。',
    askLine: '要你拍：确认缴费 / 暂缓 / 转⑧',
  },
  'dept-monetize': {
    title: '⑧ 复盘部 · 办完标志',
    body: '五块复盘可交；只读不拍不得回写⑦台账。',
    askLine: '要你拍：维持 / 放弃 / 只读不拍',
  },
}

export function teachCopyForDept(deptId: string): TeachCopy {
  return (
    COPY[deptId] || {
      title: '本部门说明',
      body: '办完看合格线；硬请示在右栏拍。',
      askLine: '要你拍：右栏汇报气泡',
    }
  )
}
