import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { readMockedData, writeMockedData } from './file-io'
import { addTenantConfig } from './add-tenant'
import { getArgs, main } from './register-tenant'

vi.hoisted(() => {
  // Prevent process.exit from killing the process during module import
  // (register-tenant.ts calls main() at top level)
  vi.spyOn(process, 'exit').mockImplementation((() => {}) as never)
})

vi.mock('./file-io', () => ({
  readMockedData: vi.fn(),
  writeMockedData: vi.fn(),
}))

vi.mock('./add-tenant', () => ({
  addTenantConfig: vi.fn(),
}))


const originalArgv = process.argv

beforeEach(() => {
	vi.spyOn(process, 'exit').mockImplementation((() => {}) as never)
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'log').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
  process.argv = originalArgv
})

describe('getArgs', () => {
  it('returns prefix and names for valid --prefix and --names-json', () => {
    process.argv = [
      'node',
      'script',
      '--prefix',
      'test-tenant',
      '--names-json',
      '["alpha","beta"]',
    ]
    const result = getArgs()
    expect(result).toEqual({ prefix: 'test-tenant', names: ['alpha', 'beta'] })
  })

  it('throws when --prefix flag is missing', () => {
    process.argv = ['node', 'script', '--names-json', '["a","b"]']
    expect(() => getArgs()).toThrow('Usage: bun packages/generator')
  })

  it('throws when --names-json flag is missing', () => {
    process.argv = ['node', 'script', '--prefix', 'test']
    expect(() => getArgs()).toThrow('Usage: bun packages/generator')
  })

  it('throws when --prefix value is missing (flag at end)', () => {
    process.argv = ['node', 'script', '--names-json', '["a"]', '--prefix']
    expect(() => getArgs()).toThrow('Usage: bun packages/generator')
  })

  it('throws when --names-json value is missing (flag at end)', () => {
    process.argv = ['node', 'script', '--prefix', 'test', '--names-json']
    expect(() => getArgs()).toThrow('Usage: bun packages/generator')
  })

  it('throws for invalid JSON in --names-json', () => {
    process.argv = [
      'node',
      'script',
      '--prefix',
      'test',
      '--names-json',
      'not-json',
    ]
    expect(() => getArgs()).toThrow('Invalid JSON in --names-json')
  })

  it('throws for non-array names', () => {
    process.argv = [
      'node',
      'script',
      '--prefix',
      'test',
      '--names-json',
      '"just-a-string"',
    ]
    expect(() => getArgs()).toThrow(
      '--names-json must be a non-empty JSON array of strings',
    )
  })

  it('throws for empty array names', () => {
    process.argv = [
      'node',
      'script',
      '--prefix',
      'test',
      '--names-json',
      '[]',
    ]
    expect(() => getArgs()).toThrow(
      '--names-json must be a non-empty JSON array of strings',
    )
  })
})

describe('main', () => {
  beforeEach(() => {
    process.argv = [
      'node',
      'script',
      '--prefix',
      'test',
      '--names-json',
      '["alpha","beta"]',
    ]
  })

  it('completes successfully with valid data flow', () => {
    const mockConfig = {
      existing: {
        names: ['x'],
        price: { base: 9.99, increment: 10 },
        rateType: 'random',
      },
    }
    const mockUpdated = {
      ...mockConfig,
      test: {
        names: ['alpha', 'beta'],
        price: { base: 9.99, increment: 10 },
        rateType: 'random' as const,
      },
    }

    vi.mocked(readMockedData).mockReturnValue(mockConfig)

    vi.mocked(addTenantConfig).mockReturnValue(mockUpdated)

    main()

    expect(addTenantConfig).toHaveBeenCalledWith(mockConfig, 'test', [
      'alpha',
      'beta',
    ])
    expect(console.log).toHaveBeenCalledWith(
      '✅ Tenant "test" registered with 2 name(s)',
    )
  })

  it('logs error and exits with code 1 when readMockedData throws', () => {
    vi.mocked(readMockedData).mockImplementation(() => {
      throw new Error('File not found')
    })

    main()

    expect(console.error).toHaveBeenCalled()
    expect(process.exit).toHaveBeenCalledWith(1)
  })

  it('logs error and exits with code 1 when addTenantConfig throws', () => {
    const mockConfig = {
      existing: {
        names: ['x'],
        price: { base: 9.99, increment: 10 },
        rateType: 'random',
      },
    }
    vi.mocked(readMockedData).mockReturnValue(mockConfig)

    vi.mocked(addTenantConfig).mockImplementation(() => {
      throw new Error('Tenant "test" already exists')
    })

    main()

    expect(console.error).toHaveBeenCalled()
    expect(process.exit).toHaveBeenCalledWith(1)
  })

  it('logs error and exits with code 1 when writeMockedData throws', () => {
    const mockConfig = {
      existing: {
        names: ['x'],
        price: { base: 9.99, increment: 10 },
        rateType: 'random',
      },
    }
    const mockUpdated = {
      ...mockConfig,
      test: {
        names: ['alpha', 'beta'],
        price: { base: 9.99, increment: 10 },
        rateType: 'random' as const,
      },
    }

    vi.mocked(readMockedData).mockReturnValue(mockConfig)

    vi.mocked(addTenantConfig).mockReturnValue(mockUpdated)

    vi.mocked(writeMockedData).mockImplementation(() => {
      throw new Error('Permission denied')
    })

    main()

    expect(console.error).toHaveBeenCalled()
    expect(process.exit).toHaveBeenCalledWith(1)
  })
})
