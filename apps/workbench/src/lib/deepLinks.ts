/**
 * Workbench deep-link surface — re-export @shared.
 * Call sites should prefer AppLink / navigateApp + relative paths
 * (`/cases/:id`, `/docket?case=`, `/billing/…`, `/agent?…`); do not pre-bake
 * APP_DEV_URLS in toast/nextActions when AppLink can resolve them.
 */
export {
  isMultiApp,
  isAbsoluteHttpUrl,
  surfaceForPath,
  currentAppId,
  midHref,
  workbenchHref,
  agentHref,
  iamHref,
  resolveAppHref,
  appHref,
  navigateApp,
  type ResolvedAppHref,
} from '@shared/lib/deepLinks'
