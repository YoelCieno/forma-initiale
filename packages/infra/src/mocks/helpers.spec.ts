import { afterEach, describe, expect, it, vi } from 'vitest'
import { delayDev } from './helpers'
import { DEV_DELAY } from './constants'

const env: { MODE: 'test' | 'development' | 'production' } = import.meta.env

describe('delayDev', () => {
  afterEach(() => {
    env.MODE = 'test'
    vi.useRealTimers()
  })

  it('does NOT delay when running under vitest (import.meta.env.MODE === "test")', async () => {
    expect(env.MODE).toBe('test')

    vi.useFakeTimers()
    let settled = false
    delayDev().then(() => {
      settled = true
    })

    // Flush microtasks only — do NOT advance any timers.
    await vi.advanceTimersByTimeAsync(0)

    expect(settled).toBe(true)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('applies the configured DEV_DELAY when NOT in test mode', async () => {
    env.MODE = 'production'

    vi.useFakeTimers()
    let settled = false
    delayDev().then(() => {
      settled = true
    })

    await vi.advanceTimersByTimeAsync(DEV_DELAY - 1)
    expect(settled).toBe(false)

    await vi.advanceTimersByTimeAsync(1)
    await vi.advanceTimersByTimeAsync(0)
    expect(settled).toBe(true)
  })
})
