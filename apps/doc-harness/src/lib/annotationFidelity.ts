import type { Annotation } from '../types'

/**
 * 批注保真策略（采纳 Agent 建议时）：
 * 若 proposed HTML 不含原 mark，则对仍 open 的 annotations 按 quote 重新挂回；
 * 找不到 quote → 标 orphan（保留列表，Mark 缺失提示）。
 * 已 resolved 的不重挂。
 */
export function reattachOpenAnnotationsByQuote(
  html: string,
  annotations: Annotation[],
  chapterId: string,
): { html: string; annotations: Annotation[] } {
  let nextHtml = html
  const nextAnnotations = annotations.map((a) => {
    if (a.chapterId !== chapterId) return a
    if (a.resolved) {
      return { ...a, orphan: false }
    }

    const markRe = new RegExp(
      `<mark[^>]*data-annotation-id=["']${escapeReg(a.id)}["'][^>]*>`,
      'i',
    )
    if (markRe.test(nextHtml)) {
      return { ...a, orphan: false }
    }

    const quote = a.quote.trim()
    if (!quote) {
      return { ...a, orphan: true }
    }

    const idx = indexOfPlainInHtml(nextHtml, quote)
    if (idx < 0) {
      return { ...a, orphan: true }
    }

    const before = nextHtml.slice(0, idx)
    const matched = nextHtml.slice(idx, idx + quote.length)
    const after = nextHtml.slice(idx + quote.length)
    nextHtml =
      before +
      `<mark data-annotation-id="${a.id}" class="annotation-mark">${matched}</mark>` +
      after
    return { ...a, orphan: false }
  })

  return { html: nextHtml, annotations: nextAnnotations }
}

function escapeReg(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 在去标签后的纯文本位置映射回 HTML 源中第一次出现的 quote（简化：直接搜原文） */
function indexOfPlainInHtml(html: string, quote: string): number {
  // 优先精确匹配（quote 通常来自 textBetween，无标签）
  const exact = html.indexOf(quote)
  if (exact >= 0) {
    // 避免挂在已有 mark 标签属性里
    const before = html.slice(Math.max(0, exact - 40), exact)
    if (/data-annotation-id\s*=\s*["'][^"']*$/.test(before)) return -1
    return exact
  }
  return -1
}
