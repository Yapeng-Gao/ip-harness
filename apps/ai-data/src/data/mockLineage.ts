export type LineageNode = {
  id: string
  label: string
  kind: string
}

export type LineageEdge = {
  from: string
  to: string
  label: string
}

export const LINEAGE_NODES: LineageNode[] = [
  { id: 'n-src', label: '脱敏导出单', kind: 'Source' },
  { id: 'n-raw', label: 'RawBlob（假）', kind: 'Raw' },
  { id: 'n-clean', label: 'CleanJob（假）', kind: 'Clean' },
  { id: 'n-ds', label: 'claims-sft', kind: 'Dataset' },
  { id: 'n-ver', label: 'v1.4', kind: 'Version' },
]

export const LINEAGE_EDGES: LineageEdge[] = [
  { from: 'n-src', to: 'n-raw', label: 'ingest' },
  { from: 'n-raw', to: 'n-clean', label: 'clean' },
  { from: 'n-clean', to: 'n-ds', label: 'publish' },
  { from: 'n-ds', to: 'n-ver', label: 'tag' },
]

export const LINEAGE_NOTE =
  '简单 DAG mock：节点与边为内存表。不替代 case audit，无真血缘仓。'
