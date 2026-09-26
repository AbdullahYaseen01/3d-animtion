/// <reference types="vite/client" />

/** Build-time flag: true only for the production deployment (or ALLOW_INDEXING=true). */
declare const __ALLOW_INDEXING__: boolean

/** Fontsource subpaths resolve to CSS through the package export map. */
declare module '@fontsource-variable/*'

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string
  readonly VITE_GA4_ID?: string
  readonly VITE_GA_ID?: string
  readonly VITE_GSC_VERIFICATION?: string
}
