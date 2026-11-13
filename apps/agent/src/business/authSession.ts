/**
 * 样机会话（非真鉴权）· product-pages §4.0
 * localStorage 键：ip-agent-auth-session；值 '1' 表示已建立工作会话
 */
export const AUTH_SESSION_LS_KEY = 'ip-agent-auth-session'

export function isLoggedIn(): boolean {
  try {
    return localStorage.getItem(AUTH_SESSION_LS_KEY) === '1'
  } catch {
    return false
  }
}

/** 写入假会话；失败返回 false（登录页可提示重试） */
export function loginDemo(): boolean {
  try {
    localStorage.setItem(AUTH_SESSION_LS_KEY, '1')
    return localStorage.getItem(AUTH_SESSION_LS_KEY) === '1'
  } catch {
    return false
  }
}

export function logoutDemo(): void {
  try {
    localStorage.removeItem(AUTH_SESSION_LS_KEY)
  } catch {
    /* ignore */
  }
}
