/** 首字圆形占位头像（示意，非真人）· 公司抽屉 / 部门钉栏同构 */
export function ExpertAvatar({
  name,
  size = 'md',
  tone = 'light',
}: {
  name: string
  size?: 'sm' | 'md'
  /** light = 浅色壳；onDark = 深底上的反白（仅选中卡内用） */
  tone?: 'light' | 'onDark'
}) {
  const ch = name.trim().charAt(0) || '?'
  const dim = size === 'sm' ? 'h-5 w-5 text-[10px]' : 'h-7 w-7 text-[11px]'
  const color =
    tone === 'onDark'
      ? 'bg-white/20 text-white'
      : 'bg-slate-200 text-slate-700'
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${dim} ${color}`}
      data-testid="expert-avatar"
    >
      {ch}
    </span>
  )
}
