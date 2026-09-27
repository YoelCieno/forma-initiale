export type PriceConfig = { readonly base: number; readonly increment: number }

export type TenantConfig = {
  readonly names: readonly string[]
  readonly price?: PriceConfig
  readonly previousPrice?: PriceConfig
  readonly rateType: string
}

// TenantId is a string union derived from valid tenant keys.
// Keep in sync with infra's mocked-data.json keys (wl, fp).
export type TenantId = 'wl' | 'fp'
