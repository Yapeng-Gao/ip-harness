/**
 * 专家/前台头像 · 01c H
 *
 * appearance:
 * - stylized（默认）：SVG 半身 + presence 动效
 * - render3d：半身 3D 渲染静帧 + presence 动效（非实时 3D 引擎）
 * - stylized：SVG 半身/脸芯片（可回退）
 */
import { lazy, Suspense, type CSSProperties } from 'react'
import type { OrgDeptId } from '../../departments/orgDepts'

const LiveBust3D = lazy(() =>
  import('./LiveBust3D').then((m) => ({ default: m.LiveBust3D })),
)

export type ExpertPresence =
  | 'idle'
  | 'thinking'
  | 'working'
  | 'waiting'
  | 'returned'
  | 'done'

export type AvatarKind = 'expert' | 'reception'
export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl' | 'hero' | 'stage'
/**
 * stylized = SVG
 * render3d = 3D 风静帧贴图
 * live3d = 真 WebGL 半身人（可转、可挥手）
 */
export type AvatarAppearance = 'stylized' | 'render3d' | 'live3d'

const DEPT_RENDER3D: Partial<Record<OrgDeptId, string>> = {
  'dept-intake': '/expert-avatars/3d/dept-intake.jpg',
  'dept-inspire': '/expert-avatars/3d/dept-inspire.jpg',
  'dept-mining': '/expert-avatars/3d/dept-mining.jpg',
  'dept-disclosure': '/expert-avatars/3d/dept-disclosure.jpg',
  'dept-draft': '/expert-avatars/3d/dept-draft.jpg',
  'dept-oa': '/expert-avatars/3d/dept-oa.jpg',
  'dept-annuity': '/expert-avatars/3d/dept-annuity.jpg',
  'dept-monetize': '/expert-avatars/3d/dept-monetize.jpg',
}

/** 3D 半身图：前台 / 部负责人固定；同伴 lead:false 走 peer 池 */
export function render3dAvatarUrl(
  seed: string,
  opts?: { kind?: AvatarKind; deptId?: OrgDeptId | 'reception'; lead?: boolean },
): string {
  const kind = opts?.kind
  const deptId = opts?.deptId
  if (kind === 'reception' || deptId === 'reception') {
    return '/expert-avatars/3d/reception.jpg'
  }
  if (opts?.lead !== false && deptId) {
    const fixed = DEPT_RENDER3D[deptId]
    if (fixed) return fixed
  }
  const idx = hashExpertSeed(seed) % 9
  return `/expert-avatars/3d/peer-${String(idx).padStart(2, '0')}.jpg`
}

export function presenceFromDeptStatus(
  status: string | null | undefined,
): ExpertPresence {
  if (status === '待确认') return 'waiting'
  if (status === '退回') return 'returned'
  if (status === '进行中') return 'working'
  if (status === '已完成') return 'done'
  return 'idle'
}

export const DEPT_SEAT_COLORS: Partial<Record<OrgDeptId, string>> = {
  'dept-intake': '#1e4d6b',
  'dept-inspire': '#2f5a45',
  'dept-mining': '#3f4f63',
  'dept-disclosure': '#1a5c4e',
  'dept-draft': '#1e3a5f',
  'dept-oa': '#5c4030',
  'dept-annuity': '#3a4a5c',
  'dept-monetize': '#4a3d5c',
}

/** 前台职场色：灰西装 + 品牌蓝点缀 */
const RECEPTION_BRAND = '#3B6FE0'
const RECEPTION_SUIT = '#C9CDD3'
const RECEPTION_SHIRT = '#F5F6F8'
const RECEPTION_ACCENT = RECEPTION_BRAND
const EXPERT_FALLBACK = '#475569'

const PRESENCE_LABEL: Record<
  ExpertPresence,
  { reception: string; expert: string }
> = {
  idle: { reception: '在线', expert: '待命' },
  thinking: { reception: '分诊中', expert: '思考中' },
  working: { reception: '引导中', expert: '办理中' },
  waiting: { reception: '等你确认', expert: '等你拍' },
  returned: { reception: '需改派', expert: '已退回' },
  done: { reception: '已领进', expert: '本站办完' },
}

const SKIN = ['#f6e0c8', '#e8c4a0', '#d4a574', '#c6865a', '#a56b45', '#8d5524'] as const
const HAIR = ['#1c1917', '#292524', '#44403c', '#78350f', '#0f172a', '#57534e'] as const

/** 只保留远看不歧义的发型 */
type HairStyle = 'short' | 'side' | 'bun' | 'long' | 'crop'
type CollarStyle = 'crew' | 'vneck' | 'blazer'

export function hashExpertSeed(input: string): number {
  const s = input.trim() || '?'
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** @deprecated 保留给旧测试 */
export function expertAvatarUrl(nameOrSeed: string): string {
  const idx = hashExpertSeed(nameOrSeed) % 23
  return `/expert-avatars/${String(idx).padStart(2, '0')}.jpg`
}

function resolveKind(
  kind: AvatarKind | undefined,
  deptId?: OrgDeptId | 'reception',
): AvatarKind {
  if (kind) return kind
  if (deptId === 'reception') return 'reception'
  return 'expert'
}

function resolveAccent(
  avatarKind: AvatarKind,
  deptId?: OrgDeptId | 'reception',
): string {
  if (avatarKind === 'reception') return RECEPTION_ACCENT
  if (!deptId || deptId === 'reception') return EXPERT_FALLBACK
  return DEPT_SEAT_COLORS[deptId] ?? EXPERT_FALLBACK
}

type Traits = {
  skin: string
  hair: string
  hairStyle: HairStyle
  glasses: boolean
  collar: CollarStyle
}

function pickTraits(seed: string, avatarKind: AvatarKind): Traits {
  if (avatarKind === 'reception') {
    return {
      skin: '#F3D4C0',
      hair: '#5B3A2E',
      hairStyle: 'side',
      glasses: false,
      collar: 'blazer',
    }
  }
  const h = hashExpertSeed(seed)
  const hairStyles: HairStyle[] = ['short', 'side', 'bun', 'long', 'crop']
  const collars: CollarStyle[] = ['crew', 'vneck', 'blazer']
  return {
    skin: SKIN[h % SKIN.length]!,
    hair: HAIR[(h >>> 3) % HAIR.length]!,
    hairStyle: hairStyles[(h >>> 6) % hairStyles.length]!,
    glasses: (h >>> 9) % 5 === 0,
    collar: collars[(h >>> 12) % collars.length]!,
  }
}

/** 头发只盖头顶与两侧，不压嘴、不压鼻 */
function Hair({
  style,
  color,
  cx,
  cy,
}: {
  style: HairStyle
  color: string
  cx: number
  cy: number
}) {
  switch (style) {
    case 'short':
      return (
        <>
          {/* 头顶+两侧包住头，额前留出发际线（露皮肤＝能读成头发） */}
          <path
            d={`M${cx - 11.5} ${cy + 1.5}
              C${cx - 12} ${cy - 7} ${cx - 7} ${cy - 13.2} ${cx} ${cy - 13.2}
              C${cx + 7} ${cy - 13.2} ${cx + 12} ${cy - 7} ${cx + 11.5} ${cy + 1.5}
              L${cx + 9.5} ${cy + 1}
              C${cx + 9} ${cy - 4} ${cx + 5} ${cy - 6.5} ${cx} ${cy - 6.5}
              C${cx - 5} ${cy - 6.5} ${cx - 9} ${cy - 4} ${cx - 9.5} ${cy + 1}
              Z`}
            fill={color}
          />
        </>
      )
    case 'side':
      return (
        <>
          <path
            d={`M${cx - 11.5} ${cy + 1.5}
              C${cx - 12} ${cy - 7} ${cx - 7} ${cy - 13} ${cx} ${cy - 13}
              C${cx + 7.5} ${cy - 13} ${cx + 12} ${cy - 6.5} ${cx + 11.2} ${cy + 2}
              L${cx + 9} ${cy + 1}
              C${cx + 9.2} ${cy - 3.5} ${cx + 5.5} ${cy - 6.2} ${cx + 1} ${cy - 6.2}
              C${cx - 4} ${cy - 6.2} ${cx - 8.5} ${cy - 3.5} ${cx - 9.5} ${cy + 1}
              Z`}
            fill={color}
          />
          <path
            d={`M${cx + 8} ${cy - 1}c1.5 2.5 2 6 1.5 9.5h-2.5c.2-2.5-.2-5.5-1.2-7.5z`}
            fill={color}
          />
        </>
      )
    case 'bun':
      return (
        <>
          <circle cx={cx} cy={cy - 12} r="3.6" fill={color} />
          <path
            d={`M${cx - 11} ${cy + 1.2}
              C${cx - 11.2} ${cy - 6.5} ${cx - 6.5} ${cy - 12} ${cx} ${cy - 12}
              C${cx + 6.5} ${cy - 12} ${cx + 11.2} ${cy - 6.5} ${cx + 11} ${cy + 1.2}
              L${cx + 9} ${cy + 0.8}
              C${cx + 8.8} ${cy - 3.8} ${cx + 5} ${cy - 6} ${cx} ${cy - 6}
              C${cx - 5} ${cy - 6} ${cx - 8.8} ${cy - 3.8} ${cx - 9} ${cy + 0.8}
              Z`}
            fill={color}
          />
        </>
      )
    case 'long':
      return (
        <>
          <path
            d={`M${cx - 11.5} ${cy + 1.5}
              C${cx - 12} ${cy - 7.5} ${cx - 6.5} ${cy - 13.2} ${cx} ${cy - 13.2}
              C${cx + 6.5} ${cy - 13.2} ${cx + 12} ${cy - 7.5} ${cx + 11.5} ${cy + 1.5}
              L${cx + 9.2} ${cy + 1}
              C${cx + 9} ${cy - 4} ${cx + 5} ${cy - 6.5} ${cx} ${cy - 6.5}
              C${cx - 5} ${cy - 6.5} ${cx - 9} ${cy - 4} ${cx - 9.2} ${cy + 1}
              Z`}
            fill={color}
          />
          <path
            d={`M${cx - 11.5} ${cy + 1.5}c-0.8 5-1 10-0.5 14h3c-0.3-4 0-8 0.7-12`}
            fill={color}
          />
          <path
            d={`M${cx + 11.5} ${cy + 1.5}c0.8 5 1 10 0.5 14h-3c0.3-4 0-8-0.7-12`}
            fill={color}
          />
        </>
      )
    case 'crop':
      return (
        <path
          d={`M${cx - 10} ${cy + 0.5}
            C${cx - 10.2} ${cy - 6} ${cx - 5.5} ${cy - 11} ${cx} ${cy - 11}
            C${cx + 5.5} ${cy - 11} ${cx + 10.2} ${cy - 6} ${cx + 10} ${cy + 0.5}
            L${cx + 8} ${cy + 0.2}
            C${cx + 7.8} ${cy - 3.2} ${cx + 4.5} ${cy - 5.2} ${cx} ${cy - 5.2}
            C${cx - 4.5} ${cy - 5.2} ${cx - 7.8} ${cy - 3.2} ${cx - 8} ${cy + 0.2}
            Z`}
          fill={color}
        />
      )
  }
}

/** 前台耳麦：深灰设备感，不抢戏、不发荧光 */
function ReceptionHeadset({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g className="expert-avatar__headset" aria-hidden>
      <rect
        x={cx - 14.2}
        y={cy - 1}
        width="3.4"
        height="6.2"
        rx="1.6"
        fill="#334155"
      />
      <rect
        x={cx + 10.8}
        y={cy - 1}
        width="3.4"
        height="6.2"
        rx="1.6"
        fill="#334155"
      />
      <path
        d={`M${cx - 12.2} ${cy + 0.8}c0-5 4.6-8.6 12.2-8.6s12.2 3.6 12.2 8.6`}
        fill="none"
        stroke="#64748b"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d={`M${cx - 12.4} ${cy + 4}c-0.8 2.6 0.4 5.6 2.6 6.6`}
        fill="none"
        stroke="#475569"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <circle
        className="expert-avatar__mic"
        cx={cx - 9.6}
        cy={cy + 11.6}
        r="1.45"
        fill="#94a3b8"
        stroke="#334155"
        strokeWidth="0.6"
      />
    </g>
  )
}

function Torso({
  bust,
  accent,
  collar,
  reception,
}: {
  bust: boolean
  accent: string
  collar: CollarStyle
  reception: boolean
}) {
  const cx = bust ? 24 : 20
  const cy = bust ? 50 : 36
  const rx = bust ? 15 : 13
  const ry = bust ? 11 : 7

  if (reception) {
    return (
      <g data-reception-suit="pro">
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={RECEPTION_SUIT} />
        <path
          d={bust ? 'M20 43.5h8v13.5h-8z' : 'M16 32h8v7h-8z'}
          fill={RECEPTION_SHIRT}
        />
        <path
          d={
            bust
              ? 'M15.2 44.8l3.6 1.2-1.2 7.2-3.4-1.1z'
              : 'M12.2 33.2l2.8 0.9-0.9 4.6-2.4-.7z'
          }
          fill={accent}
        />
        {bust ? (
          <>
            <path
              d="M23 46.2c1.5 2.2 3 4 4.6 5"
              fill="none"
              stroke={accent}
              strokeWidth="1.05"
              strokeLinecap="round"
            />
            <rect x="26.2" y="50.4" width="6.4" height="4.6" rx="0.7" fill="#fff" />
            <rect
              x="27"
              y="51.5"
              width="4.8"
              height="1.05"
              rx="0.25"
              fill={accent}
            />
          </>
        ) : null}
      </g>
    )
  }

  /* 专家：部色西装 + 白衬衫（避免色块圆饼） */
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={accent} />
      <path
        d={
          collar === 'vneck'
            ? bust
              ? 'M18 44l6 7 6-7v9H18z'
              : 'M14 32l6 4.5 6-4.5v5H14z'
            : bust
              ? 'M21.5 43h5v14h-5z'
              : 'M17.5 32h5v8h-5z'
        }
        fill="#f8fafc"
        opacity="0.95"
      />
    </g>
  )
}

function sleeveArm(
  accent: string,
  skin: string,
  d: string,
  hand: { x: number; y: number },
  cls?: string,
) {
  return (
    <g className={cls}>
      <path d={d} fill="none" stroke={accent} strokeWidth="4.4" strokeLinecap="round" />
      <path d={d} fill="none" stroke={skin} strokeWidth="2.5" strokeLinecap="round" />
      <circle
        className="expert-avatar__hand"
        cx={hand.x}
        cy={hand.y}
        r="3"
        fill={skin}
      />
    </g>
  )
}

/** 衣下手臂（头后）；托腮/举手等盖在脸前的手另走 BustGestureFront */
function BustArms({
  presence,
  accent,
  skin,
}: {
  presence: ExpertPresence
  accent: string
  skin: string
}) {
  const sleeve = (d: string, hand: { x: number; y: number }, cls?: string) =>
    sleeveArm(accent, skin, d, hand, cls)

  /* 六态远看可分：托腮 / 持稿 / 呈递 / 下垂 / 确认 / 垂立 */
  if (presence === 'thinking') {
    return (
      <g className="expert-avatar__arms" data-gesture="chin">
        {sleeve('M13 42c-1 4 0 9 2 12', { x: 14, y: 55 })}
      </g>
    )
  }
  if (presence === 'working') {
    return (
      <g className="expert-avatar__arms" data-gesture="work">
        {sleeve('M11 42c-1.5 3 0 8 3 11', { x: 13, y: 54 })}
        {sleeve('M37 41c1 2 0.5 5 -1 7', { x: 35, y: 49 })}
        <g className="expert-avatar__prop">
          <rect
            x="16"
            y="44"
            width="16"
            height="12"
            rx="1.4"
            fill="#fff"
            stroke={accent}
            strokeWidth="1.15"
          />
          <path
            d="M19 48h10M19 51.5h8M19 55h6"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="0.9"
            strokeLinecap="round"
          />
        </g>
      </g>
    )
  }
  if (presence === 'waiting') {
    return (
      <g className="expert-avatar__arms" data-gesture="present">
        {sleeve('M12 38c-6 1-9 5-8 11', { x: 5, y: 49 })}
        {sleeve('M36 38c6 1 9 5 8 11', { x: 43, y: 49 })}
        <rect
          x="14"
          y="50"
          width="20"
          height="3.2"
          rx="1.2"
          fill="#fff"
          stroke={accent}
          strokeWidth="1"
          opacity="0.95"
        />
      </g>
    )
  }
  if (presence === 'returned') {
    return (
      <g className="expert-avatar__arms" data-gesture="down" opacity="0.8">
        {sleeve('M14 43c-1 5 -0.5 10 0.5 13', { x: 14, y: 57 })}
        {sleeve('M34 43c1 5 0.5 10 -0.5 13', { x: 34, y: 57 })}
      </g>
    )
  }
  if (presence === 'done') {
    return (
      <g className="expert-avatar__arms" data-gesture="ok">
        {sleeve('M12 42c-1.5 4 0 9 2 12', { x: 13, y: 55 })}
      </g>
    )
  }
  return (
    <g className="expert-avatar__arms" data-gesture="rest">
      {sleeve('M12 42c-2 3.5-1 9 1.5 12', { x: 12.5, y: 55 })}
      {sleeve('M36 42c2 3.5 1 9 -1.5 12', { x: 35.5, y: 55 })}
    </g>
  )
}

/** 盖在头/脸前的手势：思考托腮、办完举手 */
function BustGestureFront({
  presence,
  accent,
  skin,
}: {
  presence: ExpertPresence
  accent: string
  skin: string
}) {
  if (presence === 'thinking') {
    return (
      <g className="expert-avatar__chin-arm" data-gesture-front="chin">
        {sleeveArm(
          accent,
          skin,
          'M37 46c3-5 4-11 2-15',
          { x: 38, y: 29 },
        )}
      </g>
    )
  }
  if (presence === 'done') {
    return (
      <g className="expert-avatar__hand-front" data-gesture-front="ok">
        {sleeveArm(
          accent,
          skin,
          'M36 42c4-1 7 3 5.5 8',
          { x: 41, y: 31 },
        )}
      </g>
    )
  }
  return null
}

const SIZE_W: Record<AvatarSize, number> = {
  sm: 32,
  md: 48,
  lg: 56,
  xl: 72,
  hero: 96,
  /** 大厅前台舞台（可选放大） */
  stage: 168,
}

export function ExpertAvatar({
  name,
  size = 'md',
  tone = 'light',
  seed,
  photo = false,
  /**
   * 默认：SVG 半身（stylized）。可显式传 render3d / live3d 试 3D
   */
  appearance,
  presence = 'idle',
  deptId,
  detail,
  kind,
  lead,
}: {
  name: string
  size?: AvatarSize
  tone?: 'light' | 'onDark'
  seed?: string
  photo?: boolean
  appearance?: AvatarAppearance
  presence?: ExpertPresence
  deptId?: OrgDeptId | 'reception'
  detail?: string
  kind?: AvatarKind
  /** false=同伴像（peer 池）；true/缺省 + deptId = 部负责人固定像 */
  lead?: boolean
}) {
  const avatarKind = resolveKind(kind, deptId)
  const bust = size !== 'sm'
  const pxW = SIZE_W[size]
  const pxH = bust ? Math.round(pxW * 1.32) : pxW
  const label = name.trim() || '专家'
  const key = seed ?? name
  const accent = resolveAccent(avatarKind, deptId)
  const t = pickTraits(key, avatarKind)
  const delayMs = (hashExpertSeed(key) % 7) * 140
  const resolvedAppearance: AvatarAppearance = appearance ?? 'stylized'
  const ring =
    tone === 'onDark'
      ? 'outline outline-1 -outline-offset-1 outline-white/25'
      : 'outline outline-1 -outline-offset-1 outline-black/10'

  const title =
    presence === 'returned' && detail
      ? `${label} · 退回：${detail}`
      : presence === 'waiting'
        ? avatarKind === 'reception'
          ? `${label} · 等你确认去向`
          : `${label} · 等你拍板`
        : presence === 'working'
          ? `${label} · 在途`
          : presence === 'thinking'
            ? avatarKind === 'reception'
              ? `${label} · 正在分诊`
              : `${label} · 思考中`
            : presence === 'done'
              ? `${label} · 本站办完`
              : avatarKind === 'reception'
                ? `${label} · 前台`
                : label

  if (photo) {
    return (
      <img
        src={expertAvatarUrl(key)}
        alt=""
        aria-hidden
        title={title}
        width={pxW}
        height={pxW}
        className={`inline-block shrink-0 rounded-full object-cover ${ring}`}
        style={{ width: pxW, height: pxW }}
        data-testid="expert-avatar"
        data-avatar-mode="photo"
        loading="lazy"
      />
    )
  }

  if (resolvedAppearance === 'live3d') {
    return (
      <span
        title={title}
        aria-hidden
        data-testid="expert-avatar"
        data-avatar-mode="live3d"
        data-avatar-kind={avatarKind}
        data-presence={presence}
        data-dept={deptId ?? 'unset'}
        data-avatar-size={size}
        className={`expert-avatar expert-avatar--live3d ${ring}`}
        style={
          {
            width: pxW,
            height: pxH,
            ['--ea-accent']: accent,
            ['--ea-delay']: `${delayMs}ms`,
          } as CSSProperties
        }
      >
        <Suspense
          fallback={
            <span
              className="expert-avatar__live3d-fallback"
              style={{
                width: pxW,
                height: pxH,
                background: avatarKind === 'reception' ? '#ecfdf5' : '#e8eef5',
              }}
            />
          }
        >
          <LiveBust3D
            width={pxW}
            height={pxH}
            kind={avatarKind}
            presence={presence}
            accent={accent}
            seed={key}
            className="expert-avatar__live3d"
          />
        </Suspense>
        {presence === 'waiting' ? (
          <span className="expert-avatar__badge" data-ea-badge="wait" />
        ) : null}
        {presence === 'returned' ? (
          <span className="expert-avatar__badge" data-ea-badge="back" />
        ) : null}
      </span>
    )
  }

  if (resolvedAppearance === 'render3d') {
    const src = render3dAvatarUrl(key, {
      kind: avatarKind,
      deptId,
      lead: lead ?? (bust ? true : false),
    })
    return (
      <span
        title={title}
        aria-hidden
        data-testid="expert-avatar"
        data-avatar-mode="render3d"
        data-avatar-kind={avatarKind}
        data-presence={presence}
        data-dept={deptId ?? 'unset'}
        data-avatar-size={size}
        className={`expert-avatar expert-avatar--render3d ${ring}`}
        style={
          {
            width: pxW,
            height: pxH,
            ['--ea-accent']: accent,
            ['--ea-delay']: `${delayMs}ms`,
          } as CSSProperties
        }
      >
        <span className="expert-avatar__render3d-frame">
          <img
            className="expert-avatar__render3d-img"
            src={src}
            alt=""
            width={pxW}
            height={pxH}
            draggable={false}
            loading="lazy"
          />
          <span className="expert-avatar__render3d-shade" />
        </span>
        {presence === 'waiting' ? (
          <span className="expert-avatar__badge" data-ea-badge="wait" />
        ) : null}
        {presence === 'returned' ? (
          <span className="expert-avatar__badge" data-ea-badge="back" />
        ) : null}
        {presence === 'done' ? (
          <span className="expert-avatar__badge" data-ea-badge="done" />
        ) : null}
      </span>
    )
  }

  const cx = bust ? 24 : 20
  const cy = bust ? 20 : 17.5
  const eyeDx = 4.4
  const eyeR = 2.7

  /* 六态脸：瞳孔/眉/嘴/睑要拉开，仍保持职场克制 */
  const pupil =
    presence === 'waiting'
      ? { x: 0, y: 0 }
      : presence === 'working'
        ? { x: 1.05, y: 0.55 }
        : presence === 'thinking'
          ? { x: -1.05, y: -0.85 }
          : presence === 'returned'
            ? { x: 0, y: 0.95 }
            : presence === 'done'
              ? { x: 0, y: -0.2 }
              : { x: 0, y: 0 }

  const lid =
    presence === 'returned' ? 0.5 : presence === 'working' ? 0.82 : 1

  const browY = cy - 4.5
  const brow =
    presence === 'thinking'
      ? {
          left: `M${cx - eyeDx - 2} ${browY + 0.35}h3.8`,
          right: `M${cx + eyeDx - 1.8} ${browY - 1.15}h3.8`,
          w: 1.25,
          op: 0.85,
        }
      : presence === 'waiting'
        ? {
            left: `M${cx - eyeDx - 2} ${browY + 0.55}c1.2-1.6 3.2-1.8 4.2-0.2`,
            right: `M${cx + eyeDx - 2.2} ${browY + 0.55}c1.2-1.6 3.2-1.8 4.2-0.2`,
            w: 1.2,
            op: 0.8,
          }
        : presence === 'working'
          ? {
              left: `M${cx - eyeDx - 2} ${browY + 0.15}c1 0.9 2.8 0.9 4 0.15`,
              right: `M${cx + eyeDx - 2} ${browY + 0.15}c1 0.9 2.8 0.9 4 0.15`,
              w: 1.2,
              op: 0.82,
            }
          : presence === 'returned'
            ? {
                left: `M${cx - eyeDx - 2} ${browY - 0.2}c1.1 1.2 3 1.3 4.2 0.35`,
                right: `M${cx + eyeDx - 2.2} ${browY - 0.2}c1.1 1.2 3 1.3 4.2 0.35`,
                w: 1.25,
                op: 0.88,
              }
            : {
                left: `M${cx - eyeDx - 1.7} ${browY}h3.4`,
                right: `M${cx + eyeDx - 1.7} ${browY}h3.4`,
                w: 1,
                op: 0.6,
              }

  const mouthPath =
    presence === 'returned'
      ? `M${cx - 3} ${cy + 6.5}c1.1-0.9 3.8-0.9 6 0`
      : presence === 'thinking'
        ? `M${cx - 1.4} ${cy + 6.1}h2.8`
        : presence === 'working'
          ? `M${cx - 2.4} ${cy + 6.15}h4.8`
          : presence === 'waiting'
            ? `M${cx - 2.8} ${cy + 5.45}c1.1 0.7 3.4 0.7 5.6 0`
            : presence === 'done'
              ? `M${cx - 3} ${cy + 5.35}c1.2 0.85 3.8 0.85 6 0`
              : avatarKind === 'reception'
                ? `M${cx - 2.6} ${cy + 5.55}c1 0.5 3.2 0.5 5.2 0`
                : `M${cx - 2.2} ${cy + 5.75}c0.85 0.35 2.8 0.35 4.4 0`

  const faceTilt =
    presence === 'thinking'
      ? `rotate(-8 ${cx} ${cy})`
      : presence === 'working'
        ? `rotate(5 ${cx} ${cy})`
        : presence === 'returned'
          ? `rotate(3 ${cx} ${cy}) translate(0 1.2)`
          : undefined

  const stageFill =
    avatarKind === 'reception' ? '#EEF1F5' : '#eef2f7'
  const vb = bust ? '0 0 48 64' : '0 0 40 40'
  const stateLabel =
    PRESENCE_LABEL[presence][
      avatarKind === 'reception' ? 'reception' : 'expert'
    ]

  return (
    <span
      title={title}
      aria-hidden
      data-testid="expert-avatar"
      data-avatar-mode={bust ? 'bust' : 'portrait'}
      data-avatar-kind={avatarKind}
      data-presence={presence}
      data-dept={deptId ?? 'unset'}
      data-avatar-size={size}
      className={`expert-avatar ${ring}`}
      style={
        {
          width: pxW,
          height: pxH,
          ['--ea-accent']: accent,
          ['--ea-skin']: t.skin,
          ['--ea-delay']: `${delayMs}ms`,
        } as CSSProperties
      }
    >
      <svg
        className="expert-avatar__svg"
        viewBox={vb}
        width={pxW}
        height={pxH}
        role="presentation"
      >
        {bust ? (
          <rect
            className="expert-avatar__stage"
            x="1"
            y="1"
            width="46"
            height="62"
            rx="14"
            fill={stageFill}
          />
        ) : (
          <circle cx="20" cy="20" r="19" fill={stageFill} />
        )}

        {bust ? (
          <>
            <rect
              className="expert-avatar__progress"
              x="2.5"
              y="2.5"
              width="43"
              height="59"
              rx="12.5"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.2"
              strokeDasharray="36 110"
              pathLength="100"
            />
            <rect
              className="expert-avatar__wait-ring"
              x="2.5"
              y="2.5"
              width="43"
              height="59"
              rx="12.5"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.4"
              pathLength="100"
            />
          </>
        ) : (
          <>
            <circle
              className="expert-avatar__progress"
              cx="20"
              cy="20"
              r="18"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.2"
              strokeDasharray="32 100"
            />
            <circle
              className="expert-avatar__wait-ring"
              cx="20"
              cy="20"
              r="18"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.4"
            />
          </>
        )}

        {/* 颈短粗 → 衣 → 臂 → 头 */}
        {bust ? (
          <rect
            x={cx - 4}
            y={cy + 9}
            width="8"
            height="6"
            rx="2.5"
            fill="var(--ea-skin)"
          />
        ) : null}

        <Torso
          bust={bust}
          accent={accent}
          collar={t.collar}
          reception={avatarKind === 'reception'}
        />
        {bust ? (
          <BustArms
            presence={presence}
            accent={avatarKind === 'reception' ? RECEPTION_SUIT : accent}
            skin={t.skin}
          />
        ) : null}

        <g className="expert-avatar__face" transform={faceTilt}>
          <ellipse
            cx={cx - 11}
            cy={cy + 1}
            rx="2"
            ry="2.8"
            fill="var(--ea-skin)"
          />
          <ellipse
            cx={cx + 11}
            cy={cy + 1}
            rx="2"
            ry="2.8"
            fill="var(--ea-skin)"
          />

          <ellipse
            className="expert-avatar__head"
            cx={cx}
            cy={cy}
            rx="11"
            ry="12"
            fill="var(--ea-skin)"
          />

          <g className="expert-avatar__hair">
            <Hair style={t.hairStyle} color={t.hair} cx={cx} cy={cy} />
          </g>

          <g
            className="expert-avatar__brows"
            stroke={t.hair}
            fill="none"
            strokeLinecap="round"
          >
            <path d={brow.left} strokeWidth={brow.w} opacity={brow.op} />
            <path d={brow.right} strokeWidth={brow.w} opacity={brow.op} />
          </g>

          <g transform={`translate(${cx - eyeDx} ${cy - 0.2})`}>
            <g className="expert-avatar__eye">
              <ellipse
                rx={eyeR}
                ry={eyeR * 0.88 * lid}
                fill="#fffef8"
                stroke="#d6d3d1"
                strokeWidth="0.35"
              />
              <circle cx={pupil.x} cy={pupil.y} r={eyeR * 0.42} fill="#1c1917" />
              <circle
                cx={pupil.x - 0.4}
                cy={pupil.y - 0.35}
                r={0.4}
                fill="#fff"
                opacity="0.9"
              />
            </g>
          </g>
          <g transform={`translate(${cx + eyeDx} ${cy - 0.2})`}>
            <g className="expert-avatar__eye">
              <ellipse
                rx={eyeR}
                ry={eyeR * 0.88 * lid}
                fill="#fffef8"
                stroke="#d6d3d1"
                strokeWidth="0.35"
              />
              <circle cx={pupil.x} cy={pupil.y} r={eyeR * 0.42} fill="#1c1917" />
              <circle
                cx={pupil.x - 0.4}
                cy={pupil.y - 0.35}
                r={0.4}
                fill="#fff"
                opacity="0.9"
              />
            </g>
          </g>

          <path
            className="expert-avatar__mouth"
            d={mouthPath}
            fill="none"
            stroke="#78716c"
            strokeOpacity="0.7"
            strokeWidth="1.25"
            strokeLinecap="round"
          />

          {t.glasses ? (
            <g fill="none" stroke="#334155" strokeWidth="1.05" opacity="0.7">
              <circle cx={cx - eyeDx} cy={cy - 0.3} r={eyeR + 0.9} />
              <circle cx={cx + eyeDx} cy={cy - 0.3} r={eyeR + 0.9} />
              <path
                d={`M${cx - eyeDx + eyeR + 0.7} ${cy - 0.3}h${eyeDx * 2 - eyeR * 2 - 1.4}`}
              />
            </g>
          ) : null}

          {avatarKind === 'reception' ? (
            <ReceptionHeadset cx={cx} cy={cy} />
          ) : null}
        </g>

        {bust ? (
          <BustGestureFront
            presence={presence}
            accent={avatarKind === 'reception' ? RECEPTION_SUIT : accent}
            skin={t.skin}
          />
        ) : null}

        <circle
          className="expert-avatar__done-pip"
          cx={bust ? 39 : 31}
          cy={bust ? 10 : 8}
          r="2.2"
          fill="#34d399"
        />
      </svg>
      {presence === 'waiting' ? (
        <span className="expert-avatar__badge" data-ea-badge="wait" />
      ) : null}
      {presence === 'returned' ? (
        <span className="expert-avatar__badge" data-ea-badge="back" />
      ) : null}
      {presence === 'working' ? (
        <span className="expert-avatar__badge" data-ea-badge="work" />
      ) : null}
      {presence === 'thinking' ? (
        <span className="expert-avatar__badge" data-ea-badge="think" />
      ) : null}
      {bust ? (
        <span
          className="expert-avatar__state"
          data-ea-state={presence}
          data-testid="expert-avatar-state"
        >
          {stateLabel}
        </span>
      ) : null}
    </span>
  )
}
