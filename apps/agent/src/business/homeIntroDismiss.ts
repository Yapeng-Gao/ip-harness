/**
 * 产品首页教育块收起 · product-pages §4.0a
 * localStorage 键：ip-agent-home-intro-dismissed；值 '1' 表示已了解（回访默认收起）
 */
export const HOME_INTRO_DISMISS_LS_KEY = 'ip-agent-home-intro-dismissed'

export function isHomeIntroDismissed(): boolean {
  try {
    return localStorage.getItem(HOME_INTRO_DISMISS_LS_KEY) === '1'
  } catch {
    return false
  }
}

/** 写入「已了解」；失败返回 false */
export function dismissHomeIntro(): boolean {
  try {
    localStorage.setItem(HOME_INTRO_DISMISS_LS_KEY, '1')
    return localStorage.getItem(HOME_INTRO_DISMISS_LS_KEY) === '1'
  } catch {
    return false
  }
}

/** 清除收起标记（展开后再想默认展开时用；样机调试也可） */
export function clearHomeIntroDismiss(): void {
  try {
    localStorage.removeItem(HOME_INTRO_DISMISS_LS_KEY)
  } catch {
    /* ignore */
  }
}
