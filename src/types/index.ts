/**
 * Compat re-export — canonical types live in @ip/domain (Phase 1).
 * Must use `export type *`：domain/types 纯类型；verbatim 下 `export *` 会被擦掉。
 */
export type * from '@ip/domain/types'
