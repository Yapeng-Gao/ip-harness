/**
 * Minimal ImportMeta.env so package typecheck can follow @shared
 * utils (slaInbox → deepLinks) without taking vite as a runtime dep.
 */
interface ImportMetaEnv {
  readonly VITE_MULTI_APP?: string
  readonly VITE_IP_API_MOCK_WRITE?: string
  readonly VITE_IP_API_MOCK_READ?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
