/**
 * 专家头像 · 真人照片风占位（非字母圆 / 非机器人插画）
 *
 * 来源：randomuser.me 公开人像占位图（`/api/portraits/{men|women}/{0-99}.jpg`）
 * 稳定性：对岗名（或传入的 seed）做 32-bit 字符串 hash → 性别 + 序号固定；
 * 同一岗名永远同一张图。公司抽屉 / 部门钉栏 / 欢迎页货架共用。
 */

/** FNV-ish 稳定 hash → 非负 32-bit */
export function hashExpertSeed(input: string): number {
  const s = input.trim() || '?'
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** 按岗名 hash 固定的照片风占位 URL（公开占位服务，非业务真人照） */
export function expertAvatarUrl(nameOrSeed: string, sizePx = 64): string {
  const h = hashExpertSeed(nameOrSeed)
  const gender = h % 2 === 0 ? 'women' : 'men'
  const idx = h % 100
  // sizePx 仅作语义保留；randomuser 固定档，浏览器侧用 CSS 圆形裁切
  void sizePx
  return `https://randomuser.me/api/portraits/${gender}/${idx}.jpg`
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
      ? 'ring-1 ring-white/40'
      : 'ring-1 ring-slate-200'
  const src = expertAvatarUrl(seed ?? name, size === 'sm' ? 40 : 64)
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
      referrerPolicy="no-referrer"
    />
  )
}
