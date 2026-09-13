import type { TenantId, TenantConfig } from '@repo/domain'
import tenantConfigs from '../data/mocked-data.json'

export const PRODUCT_TENANT_CONFIGS = Object.freeze(tenantConfigs) satisfies Record<TenantId, TenantConfig>
export const FRAMEWORK_NAMES = PRODUCT_TENANT_CONFIGS.wl.names
export const FAKE_PLANTS_NAMES = PRODUCT_TENANT_CONFIGS.fp.names

export const RATE_VALUE: Record<string, (counter: number) => number> = Object.freeze({
  cyclic: (counter: number) => (counter % 5) + 1,
  random: () => Math.floor(Math.random() * 5) + 1,
})

export const DEV_DELAY = 1000
