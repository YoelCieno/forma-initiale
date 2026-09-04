import tenantConfigs from '../data/mocked-data.json'
import type { TenantConfig, TenantId } from '../models'

export type { TenantId }

export const FRAMEWORK_NAMES = tenantConfigs.wl.names
export const FAKE_PLANTS_NAMES = tenantConfigs.fp.names

export const PRODUCT_TENANT_CONFIGS = Object.freeze(tenantConfigs) satisfies Record<TenantId, TenantConfig>

export const RATE_VALUE: Record<string,(counter: number) => number> = Object.freeze({
  cyclic: (counter: number) => (counter % 5) + 1,
  random: () => Math.floor(Math.random() * 5) + 1,
})

export const DEV_DELAY = 1000
