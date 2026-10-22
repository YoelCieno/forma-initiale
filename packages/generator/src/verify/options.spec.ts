import { describe, it, expect } from 'vitest'
import type { Framework } from '../models/main'
import type { Options, VerifyOptions } from '../models/verify'
import { options } from './options'

const parseWith = (argv: string[]): VerifyOptions => options().parse(argv)

describe('frameworkList', () => {
  it('exposes every supported framework in order', () => {
    const { frameworkList } = options()
    expect(frameworkList).toEqual(['vue', 'angular', 'react'])
  })
})

describe('isFramework', () => {
  it('accepts a supported framework', () => {
    expect(options().isFramework('react')).toBe(true)
  })

  it('rejects an unsupported framework', () => {
    expect(options().isFramework('svelte')).toBe(false)
  })

  it('narrows the value to Framework', () => {
    const { isFramework } = options()
    const value: string = 'angular'
    expect(isFramework(value)).toBe(true)
    if (isFramework(value)) {
      const framework: Framework = value
      expect(framework).toBe('angular')
    }
  })
})

describe('parse', () => {
  it('defaults to vue with probe and keep disabled', () => {
    expect(parseWith([])).toEqual({
      framework: 'vue',
      probe: false,
      keep: false,
    })
  })

  it('reads --framework with a separate value', () => {
    expect(parseWith(['--framework', 'angular']).framework).toBe('angular')
  })

  it('reads --framework with an inline value', () => {
    expect(parseWith(['--framework=react']).framework).toBe('react')
  })

  it('reads the --probe and --keep flags', () => {
    expect(parseWith(['--probe', '--keep'])).toEqual({
      framework: 'vue',
      probe: true,
      keep: true,
    })
  })

  it('reads --probe alone', () => {
    const parsed: VerifyOptions = parseWith(['--probe'])
    expect(parsed.probe).toBe(true)
    expect(parsed.keep).toBe(false)
  })

  it('throws on an unknown framework and lists the valid ones', () => {
    expect(() => parseWith(['--framework', 'svelte'])).toThrow(/Unknown framework/)
    expect(() => parseWith(['--framework', 'svelte'])).toThrow(/vue/)
    expect(() => parseWith(['--framework', 'svelte'])).toThrow(/angular/)
    expect(() => parseWith(['--framework', 'svelte'])).toThrow(/react/)
  })

  it('throws on an unknown option', () => {
    expect(() => parseWith(['--bogus'])).toThrow(/Unknown option/)
  })
})

describe('tenantName', () => {
  it('derives the tenant name from the framework', () => {
    const verify: Options = options()
    expect(
      verify.tenantName({ framework: 'vue', probe: false, keep: false }),
    ).toBe('smoke-vue')
    expect(
      verify.tenantName({ framework: 'angular', probe: false, keep: false }),
    ).toBe('smoke-angular')
  })
})
