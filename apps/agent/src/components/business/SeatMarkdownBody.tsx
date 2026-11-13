import type { RefObject } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Props = {
  children: string
  className?: string
  'data-testid'?: string
  'data-step-index'?: number
  flash?: boolean
  bodyRef?: RefObject<HTMLDivElement | null>
}

/**
 * 席成果 / 办理过程 Markdown 渲染（GFM 表）。
 * 保持面板尺寸与字号接近原 pre，仅把 md 结构变成可读排版。
 */
export function SeatMarkdownBody({
  children,
  className = '',
  flash = false,
  bodyRef,
  ...data
}: Props) {
  return (
    <div
      ref={bodyRef}
      className={`seat-md max-h-72 overflow-y-auto px-3 py-3 text-[12px] leading-relaxed text-slate-700 transition-colors duration-500 ${
        flash ? 'bg-amber-50 ring-2 ring-amber-200 ring-inset' : ''
      } ${className}`}
      data-testid={data['data-testid']}
      data-step-index={data['data-step-index']}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children: c }) => (
            <h1 className="mb-2 text-[14px] font-semibold text-slate-900">{c}</h1>
          ),
          h2: ({ children: c }) => (
            <h2 className="mb-1.5 mt-3 text-[13px] font-semibold text-slate-900">
              {c}
            </h2>
          ),
          h3: ({ children: c }) => (
            <h3 className="mb-1 mt-2.5 text-[12px] font-semibold text-slate-800">
              {c}
            </h3>
          ),
          p: ({ children: c }) => <p className="mb-2 last:mb-0">{c}</p>,
          ul: ({ children: c }) => (
            <ul className="mb-2 list-disc space-y-0.5 pl-4">{c}</ul>
          ),
          ol: ({ children: c }) => (
            <ol className="mb-2 list-decimal space-y-0.5 pl-4">{c}</ol>
          ),
          li: ({ children: c }) => <li className="pl-0.5">{c}</li>,
          strong: ({ children: c }) => (
            <strong className="font-semibold text-slate-900">{c}</strong>
          ),
          em: ({ children: c }) => <em className="italic text-slate-600">{c}</em>,
          blockquote: ({ children: c }) => (
            <blockquote className="mb-2 border-l-2 border-slate-300 pl-2 text-slate-500">
              {c}
            </blockquote>
          ),
          code: ({ className: cn, children: c }) => {
            const block = Boolean(cn?.includes('language-'))
            if (block) {
              return (
                <code className="block overflow-x-auto rounded-md bg-slate-50 p-2 font-mono text-[10px] text-slate-700">
                  {c}
                </code>
              )
            }
            return (
              <code className="rounded bg-slate-100 px-0.5 font-mono text-[11px] text-slate-800">
                {c}
              </code>
            )
          },
          pre: ({ children: c }) => (
            <pre className="mb-2 overflow-x-auto rounded-md border border-slate-100 bg-slate-50 p-2">
              {c}
            </pre>
          ),
          table: ({ children: c }) => (
            <div className="mb-2 overflow-x-auto">
              <table className="w-full min-w-[16rem] border-collapse text-left text-[11px]">
                {c}
              </table>
            </div>
          ),
          thead: ({ children: c }) => (
            <thead className="bg-slate-50 text-slate-600">{c}</thead>
          ),
          th: ({ children: c }) => (
            <th className="border border-slate-200 px-1.5 py-1 font-semibold">
              {c}
            </th>
          ),
          td: ({ children: c }) => (
            <td className="border border-slate-200 px-1.5 py-1 align-top">
              {c}
            </td>
          ),
          hr: () => <hr className="my-3 border-slate-200" />,
          a: ({ href, children: c }) => (
            <a
              href={href}
              className="text-sky-700 underline"
              target="_blank"
              rel="noreferrer"
            >
              {c}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
