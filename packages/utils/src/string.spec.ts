import { describe, it, expect } from 'vitest'
import { caseType } from './string'

describe('caseType', () => {
  describe('kebabToPascal', () => {
    it('converts simple kebab to PascalCase', () => {
      const { kebabToPascal } = caseType()
      expect(kebabToPascal('my-tenant')).toBe('MyTenant')
    })

    it('converts single word', () => {
      const { kebabToPascal } = caseType()
      expect(kebabToPascal('hello')).toBe('Hello')
    })

    it('handles multiple hyphens', () => {
      const { kebabToPascal } = caseType()
      expect(kebabToPascal('my-long-tenant-name')).toBe('MyLongTenantName')
    })
  })

  describe('kebabToCamel', () => {
    it('converts simple kebab to camelCase', () => {
      const { kebabToCamel } = caseType()
      expect(kebabToCamel('my-tenant')).toBe('myTenant')
    })

    it('converts single word', () => {
      const { kebabToCamel } = caseType()
      expect(kebabToCamel('hello')).toBe('hello')
    })

    it('handles multiple hyphens', () => {
      const { kebabToCamel } = caseType()
      expect(kebabToCamel('my-long-tenant-name')).toBe('myLongTenantName')
    })
  })

  describe('pascalToKebab', () => {
    it('converts PascalCase to kebab-case', () => {
      const { pascalToKebab } = caseType()
      expect(pascalToKebab('ProductCard')).toBe('product-card')
    })

    it('handles single uppercase prefix', () => {
      const { pascalToKebab } = caseType()
      expect(pascalToKebab('AComponent')).toBe('a-component')
    })
  })
})
