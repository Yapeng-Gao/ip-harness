/**
 * 第二刀 · 写路径优先 api-mock（样机，非真后端）。
 * 默认开；VITE_IP_API_MOCK_WRITE=0 或 localStorage['ip-harness.api-mock.write']='0' 关。
 */
import { createApiClient } from '@ip/api'
import type { CommandMeta, CommandResult, DomainCommand } from '@ip/contracts'

const LS_KEY = 'ip-harness.api-mock.write'

function readViteFlag(): string | undefined {
  try {
    // Vite / bundler；SSR / Node typecheck 时可能无 import.meta.env
    return import.meta.env?.VITE_IP_API_MOCK_WRITE
  } catch {
    return undefined
  }
}

function readLocalStorageFlag(): string | null {
  try {
    if (typeof localStorage === 'undefined') return null
    return localStorage.getItem(LS_KEY)
  } catch {
    return null
  }
}

/** 默认开：仅当 env 或 LS 显式为 '0' 时关 */
export function isApiMockWritePreferred(): boolean {
  if (readViteFlag() === '0') return false
  if (readLocalStorageFlag() === '0') return false
  return true
}

/**
 * POST /v1/commands/dispatch。
 * 网络 / 5xx / 抛错 → null（调用方 fallback 内存）。
 * 打到样机并拿到 JSON（含 ok:false）→ 返回该结果。
 */
export async function tryDispatchViaApiMock(
  cmd: DomainCommand,
  meta?: CommandMeta,
): Promise<CommandResult | null> {
  try {
    const client = createApiClient()
    const result = await client.dispatchCommand(cmd, meta)
    return result
  } catch {
    return null
  }
}

export function apiMockWriteModeLabel(): string {
  return isApiMockWritePreferred()
    ? '写路径优先 @ip/api → api-mock:5180（样机）；失败 fallback 内存'
    : '写路径仅内存 dispatch（api-mock 写开关已关）'
}
