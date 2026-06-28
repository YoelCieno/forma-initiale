// Vite-specific env augmentation for infra adapters
// These apps consuming this package run in a Vite context
interface ImportMeta {
  readonly env: {
    readonly VITE_API_URL: string
    readonly VITE_TENANT_ID: string
  }
}
