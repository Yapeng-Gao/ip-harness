import { useId } from 'react'
import type { TemplateId } from '../state/types'

function ExplodedSketch() {
  return (
    <g fill="none" stroke="#334155" strokeWidth={1.6}>
      <rect x={280} y={200} width={240} height={160} rx={10} fill="#f8fafc" />
      <text x={400} y={286} textAnchor="middle" fill="#475569" stroke="none" fontSize={13}>
        外壳 10
      </text>
      <rect x={80} y={80} width={140} height={80} rx={8} fill="#e8f2ff" />
      <text x={150} y={126} textAnchor="middle" fill="#1e293b" stroke="none" fontSize={12}>
        传感模块
      </text>
      <rect x={580} y={80} width={140} height={80} rx={8} fill="#ecfdf5" />
      <text x={650} y={126} textAnchor="middle" fill="#1e293b" stroke="none" fontSize={12}>
        处理单元
      </text>
      <rect x={80} y={400} width={140} height={80} rx={8} fill="#fff7ed" />
      <text x={150} y={446} textAnchor="middle" fill="#1e293b" stroke="none" fontSize={12}>
        多通道 ADC
      </text>
      <rect x={580} y={400} width={140} height={80} rx={8} fill="#f5f3ff" />
      <text x={650} y={446} textAnchor="middle" fill="#1e293b" stroke="none" fontSize={12}>
        通信接口
      </text>
      <path
        d="M220 140 L300 220 M580 140 L500 220 M220 420 L300 340 M580 420 L500 340"
        strokeDasharray="5 4"
        stroke="#94a3b8"
      />
    </g>
  )
}

function FlowchartSketch({ markerId }: { markerId: string }) {
  const boxes: { x: number; y: number; w: number; h: number; t: string }[] = [
    { x: 70, y: 200, w: 120, h: 64, t: '采集' },
    { x: 250, y: 200, w: 120, h: 64, t: '滤波' },
    { x: 430, y: 200, w: 130, h: 64, t: '特征提取' },
    { x: 610, y: 200, w: 120, h: 64, t: '上报' },
    { x: 250, y: 360, w: 120, h: 64, t: '异常检测' },
  ]
  return (
    <g fill="none" stroke="#334155" strokeWidth={1.6}>
      <defs>
        <marker id={markerId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0 0 L8 4 L0 8 z" fill="#334155" />
        </marker>
      </defs>
      {boxes.map((b) => (
        <g key={b.t}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={10} fill="#f8fafc" />
          <text
            x={b.x + b.w / 2}
            y={b.y + b.h / 2 + 4}
            textAnchor="middle"
            fill="#1e293b"
            stroke="none"
            fontSize={13}
          >
            {b.t}
          </text>
        </g>
      ))}
      <path d="M190 232 L250 232" markerEnd={`url(#${markerId})`} />
      <path d="M370 232 L430 232" markerEnd={`url(#${markerId})`} />
      <path d="M560 232 L610 232" markerEnd={`url(#${markerId})`} />
      <path d="M310 264 L310 360" markerEnd={`url(#${markerId})`} />
    </g>
  )
}

export function Sketch({ templateId }: { templateId: TemplateId }) {
  const raw = useId().replace(/:/g, '')
  return templateId === 'exploded' ? (
    <ExplodedSketch />
  ) : (
    <FlowchartSketch markerId={`fig-arrow-${raw}`} />
  )
}
