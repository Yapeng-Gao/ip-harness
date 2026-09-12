import { useCallback, useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import type { FlowKey } from '../data/flowSteps'

/**
 * Flow 本地步进 + 案级写回。
 * - case 切换时从 store 水合（不强制清零）
 * - setStep 写回 store（单调抬高）
 * - syncProgressFloor：把推导进度（progressStep）单调抬高写回，供中台可见
 */
export function usePersistedFlowStep(caseId: string, flowKey: FlowKey) {
  const { getFlowNodeProgress, setFlowNodeProgress } = useApp()
  const storedStepIndex = getFlowNodeProgress(caseId, flowKey)?.stepIndex ?? 0
  const [step, setStepLocal] = useState(storedStepIndex)

  useEffect(() => {
    setStepLocal(getFlowNodeProgress(caseId, flowKey)?.stepIndex ?? 0)
  }, [caseId, flowKey, getFlowNodeProgress])

  const setStep = useCallback(
    (n: number) => {
      setStepLocal(n)
      setFlowNodeProgress(caseId, flowKey, n)
    },
    [caseId, flowKey, setFlowNodeProgress],
  )

  const syncProgressFloor = useCallback(
    (progressStep: number) => {
      const cur = getFlowNodeProgress(caseId, flowKey)?.stepIndex ?? 0
      if (progressStep > cur) {
        setFlowNodeProgress(caseId, flowKey, progressStep)
      }
    },
    [caseId, flowKey, getFlowNodeProgress, setFlowNodeProgress],
  )

  return { step, setStep, syncProgressFloor, storedStepIndex }
}
