import type { Product } from '@repo/domain'
import { PRODUCT_TENANT_CONFIGS, RATE_VALUE } from '../constants'
import type { PriceConfig, TenantConfig, TenantId } from '../models'

let counter = 0

const calculatePrice = (counter: number, config?: PriceConfig): number => {
  if (!config) return 0
  return parseFloat((config.base + counter * config.increment).toFixed(2))
}

const getPriceRecord = (counter: number, tenantId: TenantId): Product => {
  const config: TenantConfig = PRODUCT_TENANT_CONFIGS[tenantId]
  return {
    id: `prod-${counter}`,
    name: config.names[(counter - 1) % config.names.length],
    previousPrice: calculatePrice(counter, config.previousPrice),
    price: calculatePrice(counter, config.price),
    rate: RATE_VALUE[config.rateType](counter),
  }
}

export const buildProduct = (
  tenantId: TenantId,
  overrides?: Partial<Product>,
): Product => {
  counter++
  return {
    ...getPriceRecord(counter, tenantId),
    ...overrides,
  }
}

export const buildProductList = (tenantId: TenantId): Product[] => {
  const count = PRODUCT_TENANT_CONFIGS[tenantId].names.length
  return Array.from({ length: count }, () => buildProduct(tenantId))
}

export const resetProductCounter = (): void => {
  counter = 0
}
