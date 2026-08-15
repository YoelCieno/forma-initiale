import tenantConfigs from '../data/mocked-data.json'
import { TenantConfig } from '../models'

export const FRAMEWORK_NAMES = tenantConfigs.wl.names
export const FAKE_PLANTS_NAMES = tenantConfigs.fp.names

export const PRODUCT_TENANT_CONFIGS =
  Object.freeze(tenantConfigs) as Record<string, TenantConfig>

export const RATE_VALUE = Object.freeze({
  cyclic: (counter: number) => (counter % 5) + 1,
  random: () => Math.floor(Math.random() * 5) + 1,
})

export const DEV_DELAY = 1000
