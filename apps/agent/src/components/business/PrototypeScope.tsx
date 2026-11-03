/** Shared, always reachable explanation of this prototype's capabilities. */
export function PrototypeScope() {
  return (
    <details className="relative text-[11px]" data-testid="prototype-scope">
      <summary className="focus-ring cursor-pointer rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-900">
        样机说明
      </summary>
      <div className="absolute right-0 top-full z-50 mt-2 w-72 max-w-[85vw] rounded-xl border border-slate-200 bg-white p-4 text-slate-700 shadow-lg">
        <p className="font-semibold">可体验的流程</p>
        <p className="mt-1">前台引导、部门协作、改稿、确认与退回。项目和决策记录保存在当前浏览器。</p>
        <p className="mt-3 font-semibold">尚未接入的能力</p>
        <p className="mt-1">真实账号与多人授权、长期记忆服务、专业检索和质检引擎、官方递交及付款。示例材料与审校建议不能作为已核验结论。</p>
        <p className="mt-3 text-slate-500">确认仅推进样机流程，不会向外递交文件或产生费用。具体页面的能力说明优先。</p>
      </div>
    </details>
  )
}
