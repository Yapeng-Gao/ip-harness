import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Button, Card, Chip, PageHeader } from '../components/ui'
import { inspireActions, useInspireStore } from '../state/store'
import { SEED_PROMPT } from '../state/seed'

export function PromptPage() {
  const { prompt, phase, cards, favorites } = useInspireStore()
  const navigate = useNavigate()

  function onInspire() {
    inspireActions.inspire()
    // 短 delay 后墙页已有卡；先跳转让用户看到 expanding
    navigate('/sparks')
  }

  return (
    <div>
      <PageHeader
        eyebrow="① 输入台"
        title="问题 / 技术点"
        desc="输入一条技术点或问题，点「激发」进入语义扩召墙。卡片由领域种子与动词模板拼装，无真 LLM。可预填种子便于演示。"
      />

      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone="mock">backend: mock</Chip>
          <Chip tone="neutral">阶段 {phase}</Chip>
          <Chip tone="accent">已扩召 {cards.length}</Chip>
          <Chip tone="ok">收藏 {favorites.length}</Chip>
        </div>

        <label className="mt-4 block">
          <span className="text-sm font-medium text-slate-800">技术点 / 问题</span>
          <textarea
            className="ui-input mt-2 min-h-[7.5rem] resize-y leading-relaxed"
            rows={5}
            value={prompt}
            onChange={(e) => inspireActions.setPrompt(e.target.value)}
            placeholder="例如：柔性显示模组的弯折区应力缓冲结构…"
          />
        </label>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            className="inline-flex items-center gap-1.5"
            disabled={phase === 'expanding'}
            onClick={onInspire}
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {phase === 'expanding' ? '扩召中…' : '激发'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => inspireActions.setPrompt(SEED_PROMPT)}
          >
            恢复种子技术点
          </Button>
          <Button variant="secondary" onClick={() => inspireActions.setPrompt('')}>
            清空
          </Button>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          空输入会进入 empty 态。扩召结果墙路径 <code>/sparks</code>；诚实横幅含「无真 LLM」。
        </p>
      </Card>
    </div>
  )
}
