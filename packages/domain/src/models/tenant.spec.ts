import { describe, it, expectTypeOf } from 'vitest'
import type { TenantConfig, TenantId, PriceConfig } from './tenant'

describe('tenant model types', () => {
  it('exports TenantConfig', () => {
    expectTypeOf<TenantConfig>().toBeObject()
  })

  it('exports TenantId', () => {
    expectTypeOf<TenantId>().toBeString()
  })

  it('exports PriceConfig', () => {
    expectTypeOf<PriceConfig>().toBeObject()
  })

  it('exports types (smoke)', () => {
    // ensures all three types are importable together — type-only imports are erased,
    // so runtime check is trivial; real validation is via tsc
    expectTypeOf<TenantConfig>().toEqualTypeOf<TenantConfig>()
    expectTypeOf<TenantId>().toEqualTypeOf<TenantId>()
    expectTypeOf<PriceConfig>().toEqualTypeOf<PriceConfig>()
  })
})
