export const FRAMEWORK_NAMES = [
  'react',
  'angular',
  'vue',
  'svelte',
  'solid',
] as const

export const FAKE_PLANTS_NAMES = [
  'light-bearer',
  'misty-biter',
  'silent-trumpet',
  'dancing-box',
  'little-shade',
  'crimson-veil',
  'ember-leaf',
] as const

export type PriceConfig = { readonly base: number; readonly increment: number }

export type TenantConfig = {
  readonly names: readonly string[]
  readonly price?: PriceConfig
  readonly previousPrice?: PriceConfig
  readonly rateType: 'cyclic' | 'random'
}

export const PRODUCT_TENANT_CONFIGS: Record<string, TenantConfig> =
  Object.freeze({
    wl: Object.freeze({
      names: FRAMEWORK_NAMES,
      previousPrice: { base: 29.99, increment: 10 },
      rateType: 'cyclic',
    }),
    fp: Object.freeze({
      names: FAKE_PLANTS_NAMES,
      price: { base: 9.99, increment: 10 },
      rateType: 'random',
    }),
  })

export const RATE_VALUE = Object.freeze({
  cyclic: (counter: number) => (counter % 5) + 1,
  random: () => Math.floor(Math.random() * 5) + 1,
})
