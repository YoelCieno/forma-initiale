import { describe, it, expect } from 'vitest'
import { createMockContext } from './mocks'

describe('createMockContext', () => {
  it('returns a mock context with default values', () => {
    const ctx: Record<string, unknown> = createMockContext()
    expect(ctx.name).toBe('test')
    expect(ctx.Name).toBe('Test')
    expect(ctx.metadataMode).toBe('fixture')
    expect(ctx.cwd).toBeDefined()
  })

  it('applies overrides', () => {
    const ctx: Record<string, unknown> = createMockContext({ name: 'custom', metadataMode: 'none' })
    expect(ctx.name).toBe('custom')
    expect(ctx.metadataMode).toBe('none')
  })
})
