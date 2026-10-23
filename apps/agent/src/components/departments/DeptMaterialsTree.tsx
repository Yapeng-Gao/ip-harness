import { FileText, Paperclip, GitBranch, ChevronRight } from 'lucide-react'

export type MaterialsTreeNode = {
  id: string
  label: string
  kind: 'deliverable' | 'attachment' | 'version' | 'section'
  /** optional one-line hint under label */
  hint?: string
  children?: MaterialsTreeNode[]
}

export type DeptMaterialsTreeProps = {
  nodes: MaterialsTreeNode[]
  selectedId: string
  onSelect: (id: string) => void
  className?: string
  testId?: string
}

/**
 * 部门台左·目录（product-pages §2 Cursor 三栏 / Frame 5）
 * 材料树：交卷物节点 / 附件 / 版本；点选决定中栏。禁 AI 黑话目录名。
 */
export function DeptMaterialsTree({
  nodes,
  selectedId,
  onSelect,
  className = '',
  testId = 'dept-materials-tree',
}: DeptMaterialsTreeProps) {
  return (
    <nav
      className={`flex h-full min-h-0 flex-col bg-white text-slate-800 ${className}`}
      data-testid={testId}
      aria-label="本部门材料目录"
    >
      <header className="shrink-0 border-b border-slate-200 px-3 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          材料目录
        </p>
        <p className="mt-0.5 text-[12px] font-medium text-slate-700">
          点选决定中栏产出
        </p>
      </header>
      <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 py-2">
        {nodes.map((node) => (
          <TreeItem
            key={node.id}
            node={node}
            depth={0}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </nav>
  )
}

function kindIcon(kind: MaterialsTreeNode['kind']) {
  switch (kind) {
    case 'attachment':
      return Paperclip
    case 'version':
      return GitBranch
    case 'section':
      return ChevronRight
    case 'deliverable':
    default:
      return FileText
  }
}

function TreeItem({
  node,
  depth,
  selectedId,
  onSelect,
}: {
  node: MaterialsTreeNode
  depth: number
  selectedId: string
  onSelect: (id: string) => void
}) {
  const selected = node.id === selectedId
  const Icon = kindIcon(node.kind)
  const pad = 8 + depth * 12

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(node.id)}
        className={`btn-press focus-ring flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left ${
          selected
            ? 'bg-slate-900 text-white'
            : 'text-slate-700 hover:bg-slate-50'
        }`}
        style={{ paddingLeft: pad }}
        data-testid={`dept-materials-node-${node.id}`}
        data-selected={selected ? '1' : '0'}
        aria-current={selected ? 'true' : undefined}
      >
        <Icon
          className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
            selected ? 'text-white/80' : 'text-slate-400'
          }`}
          aria-hidden
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] font-medium">
            {node.label}
          </span>
          {node.hint ? (
            <span
              className={`mt-0.5 block truncate text-[10px] ${
                selected ? 'text-white/70' : 'text-slate-400'
              }`}
            >
              {node.hint}
            </span>
          ) : null}
        </span>
      </button>
      {node.children && node.children.length > 0 ? (
        <ul className="mt-0.5 space-y-0.5">
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}
