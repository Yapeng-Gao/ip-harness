/**
 * 专家头像 · 真人照片风占位（非字母圆 / 非机器人插画）
 *
 * 来源：本地 vendored `public/expert-avatars/*.jpg`
 * （源自 randomuser.me 公开人像占位图，入库以避免运行时 CDN 抖动）
 * 稳定性：对岗名（或 seed）做 32-bit hash → 下标固定；同岗永远同图。
 * 公司抽屉 / 部门台右栏 / 欢迎页货架共用本组件。
 */

const AVATAR_COUNT = 23 // 00.jpg … 22.jpg

/** FNV-1a 稳定 hash → 非负 32-bit */
export function hashExpertSeed(input: string): number {
  const s = input.trim() || '?'
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** 按岗名 hash 固定的本地照片风占位 URL */
export function expertAvatarUrl(nameOrSeed: string): string {
  const idx = hashExpertSeed(nameOrSeed) % AVATAR_COUNT
  return `/expert-avatars/${String(idx).padStart(2, '0')}.jpg`
}

export function ExpertAvatar({
  name,
  size = 'md',
  tone = 'light',
  seed,
}: {
  name: string
  size?: 'sm' | 'md'
  /** light = 浅色壳；onDark = 深底选中卡（加浅色描边） */
  tone?: 'light' | 'onDark'
  /** 可选稳定 id；缺省用 name */
  seed?: string
}) {
  const dim = size === 'sm' ? 'h-5 w-5' : 'h-7 w-7'
  const ring =
    tone === 'onDark'
      ? 'outline outline-1 -outline-offset-1 outline-white/10'
      : 'outline outline-1 -outline-offset-1 outline-black/10'
  const src = expertAvatarUrl(seed ?? name)
  const label = name.trim() || '专家'

  return (
    <img
      src={src}
      alt=""
      aria-hidden
      title={label}
      width={size === 'sm' ? 20 : 28}
      height={size === 'sm' ? 20 : 28}
      className={`inline-block shrink-0 rounded-full object-cover ${dim} ${ring}`}
      data-testid="expert-avatar"
      loading="lazy"
    />
  )
}
