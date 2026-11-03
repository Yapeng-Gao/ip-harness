import { useEffect, useState } from 'react'
import { FileText, Paperclip, GitBranch, ChevronRight, ChevronDown } from 'lucide-react'

export type MaterialsTreeNode = {
  id: string
  label: string
  kind: 'deliverable' | 'attachment' | 'version' | 'section'
  /** optional one-line hint under label */
  hint?: string
  children?: MaterialsTreeNode[]
  /** 默认收起子树（辅链/版本等次级组） */
  defaultCollapsed?: boolean
}

export type DeptMaterialsTreeProps = {
  nodes: MaterialsTreeNode[]
  selectedId: string
  onSelect: (id: string) => void
  className?: string
  testId?: string
}

/** 辅链/挂件/版本组默认折；本稿零件默认开（稿件主路径） */
export function groupDefaultCollapsed(node: MaterialsTreeNode): boolean {
  if (node.defaultCollapsed != null) return node.defaultCollapsed
  if (node.id === 'side-aux' || node.id === 'versions') return true
  if (node.id.startsWith('side-') && node.children?.length) return true
  return false
}

function containsId(node: MaterialsTreeNode, id: string): boolean {
  if (node.id === id) return true
  return (node.children ?? []).some((c) => containsId(c, id))
}

/**
 * 部门台左·目录（product-pages §2 Cursor 三栏 / Frame 5）
 * 材料树：交卷物 / 本稿零件 / 辅链挂件（默认折）/ 附件 / 版本（默认折）。
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
      data-tree-fold="v1"
      aria-label="本部门材料目录"
    >
      <header className="sr-only">
        <p>材料目录</p>
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
  const hasKids = Boolean(node.children && node.children.length > 0)
  const wantCollapsed = groupDefaultCollapsed(node)
  const childSelected = hasKids && containsId(node, selectedId) && !selected
  const [open, setOpen] = useState(() => {
    if (!hasKids) return false
    if (containsId(node, selectedId)) return true
    return !wantCollapsed
  })

  useEffect(() => {
    if (hasKids && containsId(node, selectedId)) setOpen(true)
  }, [selectedId, hasKids, node])

  const Icon = kindIcon(node.kind)
  const pad = 8 + depth * 12
  const showKids = hasKids && open

  return (
    <li
      data-tree-node={node.id}
      data-tree-collapsed={hasKids ? (open ? '0' : '1') : undefined}
      data-tree-group={hasKids ? '1' : '0'}
    >
      <div className="flex items-start gap-0.5">
        {hasKids ? (
          <button
            type="button"
            className="btn-press focus-ring mt-1 shrink-0 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-expanded={open}
            aria-label={open ? `收起 ${node.label}` : `展开 ${node.label}`}
            data-testid={`dept-materials-fold-${node.id}`}
            onClick={(e) => {
              e.stopPropagation()
              setOpen((v) => !v)
            }}
          >
            {open ? (
              <ChevronDown className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            )}
          </button>
        ) : (
          <span className="mt-1 w-4 shrink-0" aria-hidden />
        )}
        <button
          type="button"
          onClick={() => {
            onSelect(node.id)
            if (hasKids && !open) setOpen(true)
          }}
          className={`btn-press focus-ring flex min-w-0 flex-1 items-start gap-2 rounded-md px-2 py-1.5 text-left ${
            selected
              ? 'bg-slate-900 text-white'
              : childSelected
                ? 'bg-slate-50 text-slate-800'
                : 'text-slate-700 hover:bg-slate-50'
          }`}
          style={{ paddingLeft: Math.max(4, pad - 8) }}
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
              {hasKids && !open ? (
                <span className="ml-1 text-[10px] font-normal opacity-70">
                  · {node.children!.length}
                </span>
              ) : null}
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
      </div>
      {showKids ? (
        <ul className="mt-0.5 space-y-0.5" data-testid={`dept-materials-children-${node.id}`}>
          {node.children!.map((child) => (
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
