import { APP_DEV_URLS } from '@ip/contracts'

/** Mid case detail with audit tab query (mid syncs when ready). */
export function midCaseUrl(caseId: string): string {
  return `${APP_DEV_URLS.mid}/cases/${caseId}?tab=audit`
}

export const MID_LINKS = {
  inbox: `${APP_DEV_URLS.mid}/`,
  docket: `${APP_DEV_URLS.mid}/docket`,
  billing: `${APP_DEV_URLS.mid}/billing`,
} as const
