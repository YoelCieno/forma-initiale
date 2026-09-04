interface ImportMeta {
  readonly env: {
    readonly MODE: 'test' | 'development' | 'production'
    readonly VITE_API_URL?: string
    readonly VITE_TENANT_ID?: string
  }
}
