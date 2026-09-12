export type DiffOp = { type: 'equal' | 'add' | 'remove'; text: string }

/** Token-level LCS diff; Chinese-friendly (split CJK chars / latin words). */
export function tokenize(text: string): string[] {
  const tokens: string[] = []
  const re = /[\u4e00-\u9fff]|[A-Za-z0-9_]+|[^\s]|(\s+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    tokens.push(m[0])
  }
  return tokens
}

export function diffTokens(a: string, b: string): DiffOp[] {
  const A = tokenize(a)
  const B = tokenize(b)
  const n = A.length
  const m = B.length
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] =
        A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  const ops: DiffOp[] = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (A[i] === B[j]) {
      ops.push({ type: 'equal', text: A[i] })
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: 'remove', text: A[i] })
      i++
    } else {
      ops.push({ type: 'add', text: B[j] })
      j++
    }
  }
  while (i < n) {
    ops.push({ type: 'remove', text: A[i++] })
  }
  while (j < m) {
    ops.push({ type: 'add', text: B[j++] })
  }
  // merge adjacent same-type
  const merged: DiffOp[] = []
  for (const op of ops) {
    const last = merged[merged.length - 1]
    if (last && last.type === op.type) last.text += op.text
    else merged.push({ ...op })
  }
  return merged
}
