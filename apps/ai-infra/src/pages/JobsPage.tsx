import { PageHeader, ProgressBar, StatusPill } from '../components/ui'
import {
  JOB_KIND_LABEL,
  JOB_STATUS_LABEL,
  JOB_STATUS_TONE,
  JOBS,
} from '../data/mockJobs'

export function JobsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="作业"
        title="训练 / 批推"
        desc="列表与假进度条。无调度器、无 checkpoint 落盘、不读 PatentCase 当语料。"
      />

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-rest">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">作业</th>
              <th className="px-3 py-2 font-medium">类型</th>
              <th className="px-3 py-2 font-medium">状态</th>
              <th className="px-3 py-2 font-medium">假进度</th>
              <th className="px-3 py-2 font-medium">队列</th>
              <th className="px-3 py-2 font-medium">提交</th>
            </tr>
          </thead>
          <tbody>
            {JOBS.map((j) => (
              <tr key={j.id} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-2">
                  <p className="font-medium text-slate-900">{j.name}</p>
                  <p className="text-xs text-slate-500">{j.note}</p>
                </td>
                <td className="px-3 py-2">{JOB_KIND_LABEL[j.kind]}</td>
                <td className="px-3 py-2">
                  <StatusPill tone={JOB_STATUS_TONE[j.status]}>
                    {JOB_STATUS_LABEL[j.status]}
                  </StatusPill>
                </td>
                <td className="min-w-[10rem] px-3 py-2">
                  <ProgressBar value={j.progress} />
                </td>
                <td className="px-3 py-2 font-mono text-xs text-slate-600">{j.queue}</td>
                <td className="px-3 py-2 tabular-nums text-xs text-slate-600">{j.submitted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
