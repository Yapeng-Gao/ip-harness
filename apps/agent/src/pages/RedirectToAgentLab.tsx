import { useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/** Imperative redirect so `/agent/gallery` always replaces URL to `/agent/lab`. */
export function RedirectToAgentLab() {
  const navigate = useNavigate()
  useLayoutEffect(() => {
    navigate('/agent/lab', { replace: true })
  }, [navigate])
  return (
    <p
      className="p-6 text-sm text-[var(--text-3)]"
      data-testid="agent-gallery-redirect"
    >
      正在前往原型展廊…
    </p>
  )
}
