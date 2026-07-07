import type { Product } from '@repo/domain'
import { PRODUCT_TENANT_CONFIGS, RATE_VALUE } from '../constants'
import type { PriceConfig } from '../constants'

let counter = 0

type TenantId = keyof typeof PRODUCT_TENANT_CONFIGS

function isValidTenant(id: string): id is TenantId {
  return id in PRODUCT_TENANT_CONFIGS
}

function calculatePrice(counter: number, config?: PriceConfig): number {
  if (!config) return 0
  return parseFloat((config.base + counter * config.increment).toFixed(2))
}

function getPriceRecord(counter: number, tenantId: TenantId): Product {
  const config = PRODUCT_TENANT_CONFIGS[tenantId]
  return {
    id: `prod-${counter}`,
    name: config.names[(counter - 1) % config.names.length],
    previousPrice: calculatePrice(counter, config.previousPrice),
    price: calculatePrice(counter, config.price),
    rate: RATE_VALUE[config.rateType](counter),
  }
}

export function buildProduct(
  tenantId: TenantId = 'wl',
  overrides?: Partial<Product>,
): Product {
  if (!isValidTenant(tenantId)) {
    throw new Error(`Unknown tenant: ${tenantId}`)
  }

  counter++
  return {
    ...getPriceRecord(counter, tenantId),
    ...overrides,
  }
}

export function buildProductList(tenantId: TenantId): Product[] {
  const count = PRODUCT_TENANT_CONFIGS[tenantId].names.length
  return Array.from({ length: count }, () => buildProduct(tenantId))
}

export function resetProductCounter(): void {
  counter = 0
}
