import { describe, it, expect } from 'vitest'
import { safeJsonParse } from './safe-json-parse'

describe('safeJsonParse', () => {
  it('parses valid JSON string', () => {
    const result = safeJsonParse<{ a: number }>('{"a":1}', 'test')
    expect(result).toEqual({ a: 1 })
  })

  it('throws for invalid JSON string', () => {
    expect(() => safeJsonParse('not-json', 'test')).toThrow(/Invalid JSON/)
  })

  it('throws with custom label in error message', () => {
    expect(() => safeJsonParse('{{{', 'my-label')).toThrow(/Invalid JSON in my-label/)
  })
})
