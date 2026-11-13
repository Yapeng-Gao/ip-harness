import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

/** 调试开关默认关；?debug=1 开启（Solo/Team/租户演示等） */
export function useAgentDebug(): boolean {
  const [params] = useSearchParams()
  return useMemo(() => {
    const v = params.get('debug')
    return v === '1' || v === 'true'
  }, [params])
}
