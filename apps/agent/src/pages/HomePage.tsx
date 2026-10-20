import { useSearchParams } from 'react-router-dom'
import { HomeProjectRail } from '../components/home/HomeProjectRail'
import { HomeBriefing } from '../components/home/HomeBriefing'
import { HomeTodoStrip } from '../components/home/HomeTodoStrip'
import { HomeComposer } from '../components/home/HomeComposer'
import { HomeConversationRail } from '../components/home/HomeConversationRail'

/**
 * 首页 · /agent
 * 左：项目列表（新建 / 挂载历史）
 * 中：简报 + 待办 + 对话框（资料 / @专家 / @部门）
 * 右：对话记录（可折叠）
 */
export function HomePage() {
  const [params] = useSearchParams()
  /** 资产页「作为对话附件」带过来的 doc id */
  const attachId = params.get('attach')

  return (
    <div
      className="flex min-h-0 flex-1 overflow-hidden"
      data-testid="agent-home-page"
      data-home="workbench"
    >
      <HomeProjectRail />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-white">
        <div className="mx-auto w-full max-w-3xl px-5 py-6 sm:px-6">
          <header className="mb-5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              知产 Agent
            </p>
            <h1
              className="mt-1 text-[24px] font-semibold leading-tight tracking-tight text-slate-900 sm:text-[28px]"
              data-testid="home-title"
            >
              今天要办什么？
            </h1>
            <p className="mt-1.5 text-pretty text-[13px] leading-relaxed text-slate-600">
              描述指令、挂上资料、点名部门或专家 → 直接落成工作区
            </p>
          </header>

          <div className="space-y-3">
            <HomeTodoStrip />
            <HomeComposer initialAttachId={attachId} />
            <HomeBriefing />
          </div>

          <footer className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
            <span>样机 · 无真 LLM · 写库须 HITL</span>
          </footer>
        </div>
      </div>

      <HomeConversationRail />
    </div>
  )
}
