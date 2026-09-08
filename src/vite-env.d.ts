/// <reference types="vite/client" />

interface ViteTypeOptions {
  strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  /** @deprecated Use VITE_API_URL instead. */
  readonly VITE_API_BASE_URL?: string
}
