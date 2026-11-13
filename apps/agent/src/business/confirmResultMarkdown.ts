/**
 * 确认页展示成果：席覆盖稿优先，否则回退 resultPreview
 */
export function resolveConfirmResultMarkdown(input: {
  resultPreview: string
  artifactMarkdown?: string | null
}): string {
  const override = input.artifactMarkdown?.trim()
  if (override) return override
  return input.resultPreview
}
