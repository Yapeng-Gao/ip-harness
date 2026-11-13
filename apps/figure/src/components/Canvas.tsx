import { useRef, type PointerEvent } from 'react'
import type { Annotation, EditorTool, FigureAsset } from '../state/types'
import { CANVAS } from '../state/types'
import { Sketch } from './Sketch'

function clientToSvg(svg: SVGSVGElement, clientX: number, clientY: number) {
  const pt = svg.createSVGPoint()
  pt.x = clientX
  pt.y = clientY
  const ctm = svg.getScreenCTM()
  if (!ctm) return { x: 0, y: 0 }
  const p = pt.matrixTransform(ctm.inverse())
  return { x: p.x, y: p.y }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function AnnotationMark({
  ann,
  selected,
}: {
  ann: Annotation
  selected: boolean
}) {
  const ring = selected ? '#007aff' : 'transparent'
  if (ann.kind === 'bubble') {
    // DF-M3 · optical offset above anchor so bubble does not crop part labels
    const oy = -28
    return (
      <g transform={`translate(${ann.x} ${ann.y})`} style={{ cursor: 'grab' }}>
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={oy + 16}
          stroke="#0f172a"
          strokeWidth={1.4}
          strokeLinecap="round"
        />
        <circle cx={0} cy={0} r={3.5} fill="#0f172a" />
        <circle cx={0} cy={oy} r={16} fill="#0f172a" stroke={ring} strokeWidth={3} />
        <text
          textAnchor="middle"
          x={0}
          y={oy + 5}
          fill="#fff"
          fontSize={13}
          fontWeight={600}
          style={{ pointerEvents: 'none' }}
        >
          {ann.text}
        </text>
      </g>
    )
  }
  if (ann.kind === 'label') {
    const w = Math.max(48, ann.text.length * 14 + 16)
    return (
      <g transform={`translate(${ann.x} ${ann.y})`} style={{ cursor: 'grab' }}>
        <rect
          x={-w / 2}
          y={-14}
          width={w}
          height={28}
          rx={6}
          fill="#fffbeb"
          stroke={selected ? '#007aff' : '#f59e0b'}
          strokeWidth={selected ? 2.4 : 1.2}
        />
        <text
          textAnchor="middle"
          y={5}
          fill="#78350f"
          fontSize={12}
          style={{ pointerEvents: 'none' }}
        >
          {ann.text}
        </text>
      </g>
    )
  }
  return (
    <g transform={`translate(${ann.x} ${ann.y})`} style={{ cursor: 'grab' }}>
      <line x1={0} y1={0} x2={48} y2={-32} stroke="#0f172a" strokeWidth={1.4} />
      <circle r={4} fill="#0f172a" stroke={ring} strokeWidth={3} />
      <rect
        x={36}
        y={-52}
        width={Math.max(56, ann.text.length * 13 + 14)}
        height={24}
        rx={4}
        fill="#fff"
        stroke={selected ? '#007aff' : '#94a3b8'}
        strokeWidth={selected ? 2 : 1}
      />
      <text x={44} y={-35} fill="#0f172a" fontSize={12} style={{ pointerEvents: 'none' }}>
        {ann.text}
      </text>
    </g>
  )
}

export function FigureCanvas({
  asset,
  tool,
  selectedId,
  onSelect,
  onPlace,
  onMove,
  onMoveStart,
}: {
  asset: FigureAsset
  tool: EditorTool
  selectedId: string | null
  onSelect: (id: string | null) => void
  onPlace: (x: number, y: number) => void
  onMove: (id: string, x: number, y: number) => void
  onMoveStart: () => void
}) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const dragRef = useRef<{
    id: string
    ox: number
    oy: number
    ax: number
    ay: number
    recorded: boolean
  } | null>(null)
  const sketchOn = asset.layers.find((l) => l.kind === 'sketch')?.visible !== false
  const annoOn = asset.layers.find((l) => l.kind === 'annotation')?.visible !== false

  function point(e: PointerEvent) {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    return clientToSvg(svg, e.clientX, e.clientY)
  }

  function onBgPointerDown(e: PointerEvent<SVGSVGElement>) {
    const t = e.target as Element
    if (t.closest('[data-ann]')) return
    if (tool === 'select') {
      onSelect(null)
      return
    }
    const p = point(e)
    onPlace(clamp(p.x, 16, CANVAS.width - 16), clamp(p.y, 16, CANVAS.height - 16))
  }

  function onAnnPointerDown(e: PointerEvent, ann: Annotation) {
    e.stopPropagation()
    onSelect(ann.id)
    const p = point(e)
    dragRef.current = {
      id: ann.id,
      ox: p.x,
      oy: p.y,
      ax: ann.x,
      ay: ann.y,
      recorded: false,
    }
    ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
  }

  function onPointerMove(e: PointerEvent<SVGSVGElement>) {
    const drag = dragRef.current
    if (!drag) return
    const p = point(e)
    const dx = p.x - drag.ox
    const dy = p.y - drag.oy
    if (!drag.recorded && (Math.abs(dx) > 1 || Math.abs(dy) > 1)) {
      onMoveStart()
      drag.recorded = true
    }
    if (!drag.recorded) return
    onMove(
      drag.id,
      clamp(drag.ax + dx, 16, CANVAS.width - 16),
      clamp(drag.ay + dy, 16, CANVAS.height - 16),
    )
  }

  function onPointerUp() {
    dragRef.current = null
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${CANVAS.width} ${CANVAS.height}`}
      className="h-auto w-full touch-none rounded-lg border border-slate-200 bg-[linear-gradient(to_right,#e2e8f022_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f022_1px,transparent_1px)] bg-[size:24px_24px] bg-white"
      role="img"
      aria-label="附图画布"
      onPointerDown={onBgPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{ cursor: tool === 'select' ? 'default' : 'crosshair' }}
    >
      <rect width={CANVAS.width} height={CANVAS.height} fill="transparent" />
      {sketchOn ? (
        <g style={{ pointerEvents: 'none' }}>
          <Sketch templateId={asset.templateId} />
        </g>
      ) : null}
      {annoOn
        ? asset.annotations.map((ann) => (
            <g
              key={ann.id}
              data-ann={ann.id}
              onPointerDown={(e) => onAnnPointerDown(e, ann)}
            >
              <AnnotationMark ann={ann} selected={selectedId === ann.id} />
            </g>
          ))
        : null}
    </svg>
  )
}

export function FigureThumb({ asset, className = '' }: { asset: FigureAsset; className?: string }) {
  const sketchOn = asset.layers.find((l) => l.kind === 'sketch')?.visible !== false
  const annoOn = asset.layers.find((l) => l.kind === 'annotation')?.visible !== false
  return (
    <svg
      viewBox={`0 0 ${CANVAS.width} ${CANVAS.height}`}
      className={`h-auto w-full rounded-md border border-slate-200 bg-white ${className}`}
      aria-hidden
    >
      {sketchOn ? (
        <g style={{ pointerEvents: 'none' }}>
          <Sketch templateId={asset.templateId} />
        </g>
      ) : null}
      {annoOn
        ? asset.annotations.map((ann) => (
            <g key={ann.id}>
              <AnnotationMark ann={ann} selected={false} />
            </g>
          ))
        : null}
    </svg>
  )
}
