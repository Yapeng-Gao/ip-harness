import { Link, useParams } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { Button, Card, Chip, EmptyState, PageHeader } from '../components/ui'
import { DetailDrawer } from '../components/DetailDrawer'
import { getCorpus, searchActions, useSearchStore } from '../state/store'

export function FamilyPage() {
  const { familyId = '' } = useParams()
  const corpus = getCorpus()
  const members = corpus.filter((h) => h.familyId === familyId)
  const { basketIds } = useSearchStore()

  if (!familyId || members.length === 0) {
    return (
      <EmptyState
        title="同族未找到"
        body="样机种子中无此 familyId。请从检索结果进入。"
        action={
          <Link to="/" className="text-sm font-medium underline">
            返回检索
          </Link>
        }
      />
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="同族示意 · 非真 INPADOC"
        title={`同族 ${familyId}`}
        desc={`${members.length} 件成员。点击打开详情抽屉；外链真库禁用。`}
      />
      <p className="mb-4 text-sm">
        <Link to="/" className="underline decoration-slate-300">
          ← 检索工作台
        </Link>
      </p>
      <ul className="space-y-2">
        {members.map((h) => {
          const inBasket = basketIds.includes(h.id)
          return (
            <li key={h.id}>
              <Card>
                <button
                  type="button"
                  className="focus-ring w-full text-left"
                  onClick={() => {
                    searchActions.getFamily(familyId)
                    searchActions.openHit(h.id)
                  }}
                >
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-medium text-slate-500">{h.publicationNumber}</span>
                    {h.country ? <Chip>{h.country}</Chip> : null}
                    {h.legalStatus ? <Chip>{h.legalStatus}</Chip> : null}
                  </div>
                  <p className="mt-1 font-medium text-slate-900">{h.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {h.applicant} · {h.date}
                  </p>
                </button>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={() =>
                      inBasket
                        ? searchActions.removeFromBasket(h.id)
                        : searchActions.addToBasket(h.id)
                    }
                  >
                    {inBasket ? '移出工作篮' : '加入工作篮'}
                  </Button>
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                    <ExternalLink className="h-3 w-3" aria-hidden />
                    外链真库（禁用）
                  </span>
                </div>
              </Card>
            </li>
          )
        })}
      </ul>
      <DetailDrawer />
    </div>
  )
}
