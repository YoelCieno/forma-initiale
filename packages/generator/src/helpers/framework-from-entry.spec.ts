import { describe, it, expect } from 'vitest'
import { inferFramework } from './framework-from-entry'

describe('inferFramework', () => {
  it('infers angular from angular tpl module path', () => {
    expect(
      inferFramework(
        '/repo/packages/generator/src/generators/angular-tenant.tpl.ts',
      ),
    ).toBe('angular')
  })

  it('infers vue from vue tpl module path', () => {
    expect(
      inferFramework(
        '/repo/packages/generator/src/generators/vue-tenant.tpl.ts',
      ),
    ).toBe('vue')
  })

  it('matches import.meta.url file URL shape', () => {
    expect(
      inferFramework(
        'file:///repo/packages/generator/src/generators/angular-tenant.tpl.ts',
      ),
    ).toBe('angular')
  })

  it('throws on unrecognizable path', () => {
    expect(() =>
      inferFramework('/repo/packages/generator/src/helpers/scaffold.ts'),
    ).toThrow('Cannot infer framework')
  })
})
