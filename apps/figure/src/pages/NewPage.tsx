import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Button, Card, Chip, PageHeader } from '../components/ui'
import { figureActions } from '../state/store'
import { CHAPTER_OPTIONS, TEMPLATE_LABELS, type TemplateId } from '../state/types'

export function NewPage() {
  const nav = useNavigate()
  const [title, setTitle] = useState('智能传感装置 · 新附图')
  const [partsText, setPartsText] = useState('传感模块\n处理单元\n通信接口')
  const [chapterRef, setChapterRef] = useState('')
  const [templateId, setTemplateId] = useState<TemplateId>('exploded')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const parts = partsText
      .split(/[\n,，;；]/)
      .map((p) => p.trim())
      .filter(Boolean)
    const draftId = figureActions.createDraft(
      { title: title.trim() || '未命名附图', parts, chapterRef: chapterRef || undefined },
      templateId,
    )
    nav(`/generate/${draftId}`)
  }

  return (
    <div>
      <PageHeader
        eyebrow="① 上下文"
        title="填写生成上下文"
        desc="标题、部件列表、可选关联章节（假下拉，对齐 doc-harness 种子名）。下一步为 mock 生成，不会调用文生图 API。"
      />
      <Card className="p-5">
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-slate-500">标题</span>
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus-ring"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="附图标题"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-500">部件列表（一行一个，或逗号分隔）</span>
            <textarea
              className="mt-1 min-h-[96px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus-ring"
              value={partsText}
              onChange={(e) => setPartsText(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-500">关联章节（可选·假下拉）</span>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-ring"
              value={chapterRef}
              onChange={(e) => setChapterRef(e.target.value)}
            >
              {CHAPTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend className="text-xs font-medium text-slate-500">模板（≥2 种）</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {(Object.keys(TEMPLATE_LABELS) as TemplateId[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTemplateId(id)}
                  className={`rounded-lg border px-3 py-2 text-sm focus-ring ${
                    templateId === id
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] font-medium'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  {TEMPLATE_LABELS[id]}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button type="submit" className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              生成草图
            </Button>
            <Chip tone="mock">无真文生图 · 1～2s 假延迟</Chip>
          </div>
        </form>
      </Card>
    </div>
  )
}
