import { APP_DEV_URLS } from '@ip/contracts'

/** Ops shell origin from shared contracts — do not hardcode localhost ports. */
export const OPS_URL = APP_DEV_URLS.ops

/** Ops alerts channel config (path + hash); deep-link only, never mutate ops. */
export const OPS_ALERTS_URL = `${APP_DEV_URLS.ops}/config#alerts`
