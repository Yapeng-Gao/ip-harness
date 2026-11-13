import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronDown,
  ChevronRight,
  Filter,
  Loader2,
  Plus,
  Search,
  Send,
  Trash2,
} from 'lucide-react'
import { Button, Card, Chip, EmptyState, PageHeader } from '../components/ui'
import { DetailDrawer } from '../components/DetailDrawer'
import { searchActions, useSearchStore } from '../state/store'
import type { AdvancedRow, SearchHit, SearchMode } from '../state/types'
import { ADVANCED_FIELD_LABELS, DOWNSTREAM_HONESTY, DOWNSTREAM_PLACEHOLDERS } from '../state/types'

const MODES: { id: SearchMode; label: string }[] = [
  { id: 'keyword', label: '关键词' },
  { id: 'semantic', label: '语义' },
  { id: 'advanced', label: '高级（检索式）' },
]

const COUNTRIES = ['CN', 'US', 'EP', 'WO', 'JP', 'KR', 'TW']
const LEGAL = ['有效', '审查中', '失效']
const IPC_PRESETS = ['H01M', 'H01L', 'A61K', 'H04W', 'C08L', 'G06N']

export function SearchPage() {
  const s = useSearchStore()
  const [expandedFamilies, setExpandedFamilies] = useState<Record<string, boolean>>({})

  const collapse = s.filters.collapseFamily ?? true

  const displayGroups = useMemo(() => {
    if (!collapse) {
      return s.hits.map((h) => ({ type: 'flat' as const, hit: h }))
    }
    const seen = new Set<string>()
    const rows: Array<
      | { type: 'family'; familyId: string; rep: SearchHit; members: SearchHit[] }
      | { type: 'flat'; hit: SearchHit }
    > = []
    for (const h of s.hits) {
      const fid = h.familyId
      if (!fid) {
        rows.push({ type: 'flat', hit: h })
        continue
      }
      if (seen.has(fid)) continue
      seen.add(fid)
      const members = s.hits.filter((x) => x.familyId === fid)
      const rep = [...members].sort(
        (a, b) => b.score - a.score || (a.date ?? '').localeCompare(b.date ?? ''),
      )[0]!
      rows.push({ type: 'family', familyId: fid, rep, members })
    }
    return rows
  }, [s.hits, collapse])

  function onSearch(e?: FormEvent) {
    e?.preventDefault()
    searchActions.runSearch()
  }

  function toggleCountry(c: string) {
    const cur = s.filters.docTypes ?? []
    const next = cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]
    searchActions.patchFilters({ docTypes: next })
  }

  function toggleLegal(v: string) {
    const cur = s.filters.legalStatus ?? []
    const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]
    searchActions.patchFilters({ legalStatus: next })
  }

  function toggleIpc(p: string) {
    const cur = s.filters.ipcPrefix ?? []
    const next = cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]
    searchActions.patchFilters({ ipcPrefix: next })
  }

  return (
    <div>
      <PageHeader
        eyebrow="B1 · W0 deep-demo"
        title="专利检索工作台"
        desc="三模式共用结果管道；过滤与同族折叠写入 SearchQuery.filters；Agent 侧同形状。内存 mock，无真 ES / 向量 / 专利库。"
      />

      <Card className="mb-4">
        <div className="flex flex-wrap gap-1 border-b border-slate-100 pb-3">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={
                s.mode === m.id
                  ? 'rounded-[var(--radius-sm)] bg-[var(--color-accent-soft)] px-3 py-1.5 text-sm font-medium text-slate-900 focus-ring'
                  : 'rounded-[var(--radius-sm)] px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 focus-ring'
              }
              onClick={() => searchActions.setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>

        <form className="mt-3 space-y-3" onSubmit={onSearch}>
          {s.mode !== 'advanced' ? (
            <div>
              <label className="sr-only" htmlFor="search-q">
                查询
              </label>
              <div className="flex gap-2">
                <input
                  id="search-q"
                  className="focus-ring flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  placeholder={
                    s.mode === 'semantic'
                      ? '自然语言描述技术点，例如：固态电解质 锂离子电池'
                      : '关键词，支持 AND / OR，例如：固态电解质 AND 宁德'
                  }
                  value={s.text}
                  onChange={(e) => searchActions.setText(e.target.value)}
                />
                <Button type="submit" className="gap-1" disabled={s.status === 'running'}>
                  {s.status === 'running' ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Search className="h-4 w-4" aria-hidden />
                  )}
                  检索
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {s.advancedRows.map((row) => (
                <AdvancedRowEditor key={row.id} row={row} />
              ))}
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" className="gap-1" onClick={() => searchActions.addAdvancedRow()}>
                  <Plus className="h-3.5 w-3.5" />
                  添加字段行
                </Button>
                <Button type="submit" className="gap-1" disabled={s.status === 'running'}>
                  {s.status === 'running' ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Search className="h-4 w-4" aria-hidden />
                  )}
                  检索
                </Button>
              </div>
            </div>
          )}

          {s.error ? (
            <p role="alert" className="text-sm text-rose-600">
              {s.error}{' '}
              {s.status === 'error' ? (
                <button
                  type="button"
                  className="underline"
                  onClick={() => searchActions.dismissError()}
                >
                  关闭并回 idle
                </button>
              ) : null}
            </p>
          ) : null}

          <details className="rounded-md border border-dashed border-slate-200 bg-slate-50/80 px-3 py-2">
            <summary className="cursor-pointer text-xs font-medium text-slate-500 hover:text-slate-700">
              开发者选项
            </summary>
            <label
              className="mt-2 flex items-center gap-2 text-xs text-slate-600"
              title="forceNextFail · 下次检索注入故障"
            >
              <input
                type="checkbox"
                checked={s.forceNextFail}
                onChange={(e) => searchActions.setForceNextFail(e.target.checked)}
              />
              <span>
                下次检索故意失败
                <code className="ml-1 rounded bg-slate-100 px-1 font-mono text-[10px] text-slate-400">
                  → error
                </code>
              </span>
            </label>
          </details>
        </form>
      </Card>

      <Card className="mb-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p
            className="flex items-center gap-2 text-sm font-medium text-slate-800"
            title="写入 Query.filters"
          >
            <Filter className="h-4 w-4" aria-hidden />
            过滤条件
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-normal text-slate-400">
              Query.filters
            </code>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                searchActions.clearFilters()
              }}
            >
              清空过滤
            </Button>
            <Button
              variant="secondary"
              onClick={() => searchActions.applyFiltersNow()}
              disabled={!s.lastQuery || s.status === 'running'}
            >
              应用过滤并重跑
            </Button>
            {!s.lastQuery ? (
              <span className="agent-confirm-reason" data-tone="block" role="status">
                请先检索
              </span>
            ) : s.status === 'running' ? (
              <span className="text-xs text-slate-500" role="status">
                检索进行中
              </span>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-slate-600">
            日期从
            <input
              type="date"
              className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
              value={s.filters.dateFrom ?? ''}
              onChange={(e) => searchActions.patchFilters({ dateFrom: e.target.value })}
            />
          </label>
          <label className="text-xs text-slate-600">
            日期至
            <input
              type="date"
              className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
              value={s.filters.dateTo ?? ''}
              onChange={(e) => searchActions.patchFilters({ dateTo: e.target.value })}
            />
          </label>
          <label className="text-xs text-slate-600 sm:col-span-2">
            申请人包含
            <input
              className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
              placeholder="例如：宁德 / Toyota / Roche"
              value={(s.filters.applicants ?? [])[0] ?? ''}
              onChange={(e) =>
                searchActions.patchFilters({
                  applicants: e.target.value.trim() ? [e.target.value] : [],
                })
              }
            />
          </label>
        </div>

        <div className="mt-3">
          <p className="text-xs text-slate-500">国家 / 文书类型</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {COUNTRIES.map((c) => (
              <button
                key={c}
                type="button"
                className={
                  (s.filters.docTypes ?? []).includes(c)
                    ? 'rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 text-xs text-white focus-ring'
                    : 'rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-700 hover:bg-slate-50 focus-ring'
                }
                onClick={() => toggleCountry(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3">
          <p className="text-xs text-slate-500">IPC 前缀</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {IPC_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                className={
                  (s.filters.ipcPrefix ?? []).includes(p)
                    ? 'rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 text-xs text-white focus-ring'
                    : 'rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-700 hover:bg-slate-50 focus-ring'
                }
                onClick={() => toggleIpc(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3">
          <p className="text-xs text-slate-500">法律状态</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {LEGAL.map((v) => (
              <button
                key={v}
                type="button"
                className={
                  (s.filters.legalStatus ?? []).includes(v)
                    ? 'rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 text-xs text-white focus-ring'
                    : 'rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-700 hover:bg-slate-50 focus-ring'
                }
                onClick={() => toggleLegal(v)}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <label
          className="mt-4 flex items-center gap-2 text-sm text-slate-700"
          title="filters.collapseFamily"
        >
          <input
            type="checkbox"
            checked={collapse}
            onChange={() => searchActions.toggleCollapseFamily()}
          />
          同族折叠
          <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
            collapseFamily
          </code>
        </label>
      </Card>

      <BasketBar />

      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
        <span>
          状态 <Chip tone={statusTone(s.status)}>{s.status}</Chip>
        </span>
        {s.lastResponse ? (
          <>
            <Chip tone={s.lastResponse.backend === 'sqlite-fts' ? 'ok' : 'mock'}>
              backend: {s.lastResponse.backend}
            </Chip>
            {s.lastResponse.indexVersion ? (
              <Chip tone="neutral">index: {s.lastResponse.indexVersion}</Chip>
            ) : null}
            <span className="tabular-nums text-xs text-slate-500">
              tookMs {s.lastResponse.tookMs} · 命中 {s.hits.length}
              {collapse ? ` · 折叠行 ${displayGroups.length}` : ''}
            </span>
          </>
        ) : null}
        {s.lastResponse?.warnings?.map((w) => (
          <Chip key={w} tone="warn">
            {w}
          </Chip>
        ))}
        {s.mode === 'semantic' &&
        s.status === 'done' &&
        (!s.lastResponse || s.lastResponse.backend === 'mock') ? (
          <Chip tone="accent">语义相似·示意</Chip>
        ) : null}
      </div>

      {s.status === 'idle' && s.hits.length === 0 ? (
        <EmptyState
          title="尚未检索"
          body="选择模式并输入查询后点「检索」。种子库约 23 条示意专利，含 ≥3 个多成员同族。不会声称已扫全库。"
          action={
            <Button
              variant="secondary"
              onClick={() => searchActions.runSearch()}
            >
              用当前查询检索
            </Button>
          }
        />
      ) : null}

      {s.status === 'running' ? (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-8 text-sm text-slate-600 shadow-rest">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          检索中（假延迟）…
        </div>
      ) : null}

      {s.status === 'empty' ? (
        <EmptyState
          title="无命中"
          body="当前 Query + filters 在内存种子中无匹配。这是合法空态，并非「全库已扫」。可放宽过滤或改关键词。"
          action={
            <Button
              variant="secondary"
              onClick={() => {
                searchActions.clearFilters()
                searchActions.runSearch({ fromFilters: true })
              }}
            >
              清空过滤并重跑
            </Button>
          }
        />
      ) : null}

      {(s.status === 'done' || (s.hits.length > 0 && s.status !== 'running')) && (
        <ul className="space-y-2">
          {displayGroups.map((row) => {
            if (row.type === 'flat') {
              return (
                <HitRow
                  key={row.hit.id}
                  hit={row.hit}
                  semantic={s.mode === 'semantic' && (!s.lastResponse || s.lastResponse.backend === 'mock')}
                />
              )
            }
            const open = expandedFamilies[row.familyId] ?? false
            return (
              <li key={row.familyId}>
                <HitRow hit={row.rep} semantic={s.mode === 'semantic' && (!s.lastResponse || s.lastResponse.backend === 'mock')} />
                <div className="ml-3 mt-1 border-l-2 border-slate-200 pl-3">
                  <button
                    type="button"
                    className="focus-ring inline-flex items-center gap-1 text-xs font-medium text-slate-700"
                    onClick={() => {
                      setExpandedFamilies((prev) => ({
                        ...prev,
                        [row.familyId]: !open,
                      }))
                      searchActions.getFamily(row.familyId)
                    }}
                  >
                    {open ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                    同族 {row.members.length} 件
                    <Link
                      to={`/families/${row.familyId}`}
                      className="ml-2 underline decoration-slate-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      详情页
                    </Link>
                  </button>
                  {open ? (
                    <ul className="mt-1 space-y-1">
                      {row.members
                        .filter((m) => m.id !== row.rep.id)
                        .map((m) => (
                          <HitRow key={m.id} hit={m} compact semantic={s.mode === 'semantic' && (!s.lastResponse || s.lastResponse.backend === 'mock')} />
                        ))}
                    </ul>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <DetailDrawer />
    </div>
  )
}

function statusTone(status: string): 'neutral' | 'accent' | 'warn' | 'ok' | 'mock' {
  if (status === 'done') return 'ok'
  if (status === 'error') return 'warn'
  if (status === 'running') return 'accent'
  if (status === 'empty') return 'neutral'
  return 'neutral'
}

function AdvancedRowEditor({ row }: { row: AdvancedRow }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className="focus-ring rounded-md border border-slate-200 px-2 py-1.5 text-sm"
        value={row.field}
        onChange={(e) =>
          searchActions.updateAdvancedRow(row.id, {
            field: e.target.value as AdvancedRow['field'],
          })
        }
      >
        {(Object.keys(ADVANCED_FIELD_LABELS) as AdvancedRow['field'][]).map((f) => (
          <option key={f} value={f}>
            {ADVANCED_FIELD_LABELS[f]}
          </option>
        ))}
      </select>
      <input
        className="focus-ring min-w-[12rem] flex-1 rounded-md border border-slate-200 px-2 py-1.5 text-sm"
        value={row.value}
        placeholder="字段值"
        onChange={(e) => searchActions.updateAdvancedRow(row.id, { value: e.target.value })}
      />
      <button
        type="button"
        className="focus-ring rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
        aria-label="删除行"
        onClick={() => searchActions.removeAdvancedRow(row.id)}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}

function HitRow({
  hit,
  compact,
  semantic,
}: {
  hit: SearchHit
  compact?: boolean
  semantic?: boolean
}) {
  const { basketIds } = useSearchStore()
  const inBasket = basketIds.includes(hit.id)
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-rest ${
        compact ? 'px-3 py-2' : 'px-4 py-3'
      }`}
    >
      <button
        type="button"
        className="focus-ring w-full text-left"
        onClick={() => searchActions.openHit(hit.id)}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500">{hit.publicationNumber}</span>
          <span className="tabular-nums text-xs text-slate-400">score {hit.score}</span>
          {hit.legalStatus ? <Chip>{hit.legalStatus}</Chip> : null}
          {semantic ? <Chip tone="accent">语义相似·示意</Chip> : null}
        </div>
        <p className={`font-medium text-slate-900 ${compact ? 'text-sm' : 'mt-1'}`}>{hit.title}</p>
        {!compact ? (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
            {hit.applicant} · {hit.date} · {(hit.ipc ?? []).slice(0, 2).join(', ')}
          </p>
        ) : null}
      </button>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={() =>
            inBasket ? searchActions.removeFromBasket(hit.id) : searchActions.addToBasket(hit.id)
          }
        >
          {inBasket ? '移出篮' : '加入工作篮'}
        </Button>
      </div>
    </div>
  )
}

function BasketBar() {
  const { basketIds, events } = useSearchStore()
  const empty = basketIds.length === 0
  const lastDown = events.find((e) => e.action === 'sendDownstream' || e.action === 'sendToAgent')
  return (
    <Card className="mb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-800">
            工作篮{' '}
            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs text-white">
              {basketIds.length}
            </span>
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            送 Agent / 下游写事件+深链（已开壳 · 篮未跨口同步）；不 dispatch DomainCommand / PatentCase。
            <Link to="/saved" className="ml-1 underline decoration-slate-300">
              打开收藏页
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            className="gap-1"
            disabled={empty}
            onClick={() => searchActions.sendToAgent()}
          >
            <Send className="h-4 w-4" aria-hidden />
            送 Agent
          </Button>
          {DOWNSTREAM_PLACEHOLDERS.map((d) => (
            <Button
              key={d.target}
              variant="secondary"
              disabled={empty}
              onClick={() => searchActions.sendDownstream(d.target)}
            >
              {d.label}
            </Button>
          ))}
          {empty ? <Chip tone="warn">请先加入工作篮</Chip> : null}
        </div>
      </div>
      {lastDown ? (
        <p className="mt-2 text-xs text-emerald-700">
          最近：{lastDown.tool ?? lastDown.action}
          {lastDown.note ? ` · ${lastDown.note}` : ''}
          {lastDown.action === 'sendDownstream' &&
          typeof lastDown.payload?.href === 'string' ? (
            <>
              {' · '}
              <a
                href={String(lastDown.payload.href)}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-emerald-300"
              >
                {String(lastDown.payload.href)} · {DOWNSTREAM_HONESTY}
              </a>
            </>
          ) : null}
        </p>
      ) : null}
    </Card>
  )
}
