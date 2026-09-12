import { Card, PageHeader, StatusPill } from '../components/ui'
import { QUALITY_BANNER, QUALITY_ROWS } from '../data/mockQuality'

export function QualityPage() {
  return (
    <div>
      <PageHeader
        eyebrow="质量与安全"
        title="打分 / 敏感 / 污染示意"
        desc="质量门禁为卡片形状。样机标「非真 PII」——无真敏感信息引擎、不处理真实个人信息。"
      />

      <Card className="mb-4 border-amber-200 bg-amber-50/80">
        <p className="text-xs font-medium text-amber-950">非真 PII</p>
        <p className="mt-1 text-xs leading-relaxed text-amber-950/90">{QUALITY_BANNER}</p>
      </Card>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-rest">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">数据集</th>
              <th className="px-3 py-2 font-medium">质量打分</th>
              <th className="px-3 py-2 font-medium">敏感（示意）</th>
              <th className="px-3 py-2 font-medium">污染</th>
              <th className="px-3 py-2 font-medium">说明</th>
            </tr>
          </thead>
          <tbody>
            {QUALITY_ROWS.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-2 font-medium text-slate-900">{row.dataset}</td>
                <td className="px-3 py-2">
                  <StatusPill tone={row.tone}>{row.score}</StatusPill>
                </td>
                <td className="px-3 py-2 text-xs text-slate-600">{row.sensitive}</td>
                <td className="px-3 py-2 text-xs text-slate-600">{row.contamination}</td>
                <td className="px-3 py-2 text-xs text-slate-500">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
