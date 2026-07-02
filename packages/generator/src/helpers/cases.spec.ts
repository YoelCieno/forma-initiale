import { describe, it, expect } from 'vitest'
import { kebabToPascal, kebabToCamel, pascalToKebab, caseTransform } from './cases'
import type { VueTenantContext } from '../models'

describe('kebabToPascal', () => {
  it('converts simple kebab to PascalCase', () => {
    expect(kebabToPascal('my-tenant')).toBe('MyTenant')
  })

  it('converts single word', () => {
    expect(kebabToPascal('hello')).toBe('Hello')
  })

  it('handles multiple hyphens', () => {
    expect(kebabToPascal('my-long-tenant-name')).toBe('MyLongTenantName')
  })
})

describe('kebabToCamel', () => {
  it('converts simple kebab to camelCase', () => {
    expect(kebabToCamel('my-tenant')).toBe('myTenant')
  })

  it('converts single word', () => {
    expect(kebabToCamel('hello')).toBe('hello')
  })

  it('handles multiple hyphens', () => {
    expect(kebabToCamel('my-long-tenant-name')).toBe('myLongTenantName')
  })
})

describe('pascalToKebab', () => {
  it('converts PascalCase to kebab-case', () => {
    expect(pascalToKebab('ProductCard')).toBe('product-card')
  })

  it('handles single uppercase letter prefix', () => {
    expect(pascalToKebab('AComponent')).toBe('a-component')
  })
})

describe('caseTransform', () => {
  it('adds Name (PascalCase) and camelName (camelCase) from name (kebab-case)', async () => {
    const ctx: Partial<VueTenantContext> = { name: 'my-tenant' }
    const result = await caseTransform()(ctx as VueTenantContext)
    expect(result.Name).toBe('MyTenant')
    expect(result.camelName).toBe('myTenant')
  })
})
