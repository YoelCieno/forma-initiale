import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { onExit } from './error-utils'

beforeEach(() => {
  vi.spyOn(process, 'exit').mockImplementation((() => {}) as never)
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('onExit', () => {
  it('returns the result of the function when no error is thrown', () => {
    const result = onExit(() => 'hello')
    expect(result).toBe('hello')
  })

  it('calls process.exit(1) when the function throws', () => {
    onExit(() => {
      throw new Error('boom')
    })
    expect(process.exit).toHaveBeenCalledWith(1)
  })

  it('logs error with prefix when prefix is provided', () => {
    onExit(() => {
      throw new Error('failed')
    }, 'Write failed')
    expect(console.error).toHaveBeenCalledWith('Error: Write failed: failed')
  })

  it('logs error without prefix when prefix is not provided', () => {
    onExit(() => {
      throw new Error('failed')
    })
    expect(console.error).toHaveBeenCalledWith('Error: failed')
  })

  it('calls process.exit(1) when a non-Error value is thrown', () => {
    onExit(() => {
      throw 'string error'
    })
    expect(process.exit).toHaveBeenCalledWith(1)
  })
})
