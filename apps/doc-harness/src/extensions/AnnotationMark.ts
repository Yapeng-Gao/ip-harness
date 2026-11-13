import { Mark, mergeAttributes, type Editor } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    annotation: {
      setAnnotation: (annotationId: string) => ReturnType
      unsetAnnotation: (annotationId: string) => ReturnType
    }
  }
}

export const AnnotationMark = Mark.create({
  name: 'annotation',

  excludes: '',
  inclusive: false,

  addAttributes() {
    return {
      annotationId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-annotation-id'),
        renderHTML: (attributes) => {
          if (!attributes.annotationId) return {}
          return { 'data-annotation-id': attributes.annotationId }
        },
      },
    }
  },

  parseHTML() {
    return [{ tag: 'mark[data-annotation-id]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'mark',
      mergeAttributes({ class: 'annotation-mark' }, HTMLAttributes),
      0,
    ]
  },

  addCommands() {
    return {
      setAnnotation:
        (annotationId: string) =>
        ({ commands }) =>
          commands.setMark(this.name, { annotationId }),

      unsetAnnotation:
        (annotationId: string) =>
        ({ tr, state, dispatch }) => {
          const markType = state.schema.marks[this.name]
          if (!markType) return false

          let modified = false
          state.doc.descendants((node, pos) => {
            if (!node.isText) return
            const mark = node.marks.find(
              (m) =>
                m.type === markType && m.attrs.annotationId === annotationId,
            )
            if (mark) {
              tr.removeMark(pos, pos + node.nodeSize, mark)
              modified = true
            }
          })

          if (modified && dispatch) dispatch(tr)
          return modified
        },
    }
  },
})

/** 查找某 annotationId 在文档中的起止位置（合并相邻同 id 区间） */
export function findAnnotationRange(
  editor: Editor,
  annotationId: string,
): { from: number; to: number } | null {
  let from: number | null = null
  let to: number | null = null

  editor.state.doc.descendants((node, pos) => {
    if (!node.isText) return
    const has = node.marks.some(
      (m) =>
        m.type.name === 'annotation' && m.attrs.annotationId === annotationId,
    )
    if (has) {
      if (from === null) from = pos
      to = pos + node.nodeSize
    }
  })

  if (from === null || to === null) return null
  return { from, to }
}
