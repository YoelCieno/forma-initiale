import { describe, it, expect } from 'vitest'
import { settle } from './promises'

describe('promises / settle', () => {
  it('resolves after n microtask ticks', async () => {
    let flag = false
    Promise.resolve().then(() => { flag = true })
    await settle(1)
    expect(flag).toBe(true)
  })

  it('defaults to 2 ticks', async () => {
    let count = 0
    Promise.resolve().then(() => { count++ })
    // default should flush at least 1 tick
    await settle()
    expect(count).toBe(1)
  })
})