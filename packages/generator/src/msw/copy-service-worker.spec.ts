import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { VueTenantContext } from '../models'
import { existsSync } from 'node:fs'

vi.mock('./file-io', () => ({
  readMockedData: vi.fn(),
  writeMockedData: vi.fn(),
  copyMswWorker: vi.fn(),
}))

vi.mock('./add-tenant', () => ({
  addTenantConfig: vi.fn(),
}))

vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>()
  return {
    ...actual,
    existsSync: vi.fn(() => true), // default: file exists
  }
})

import { getProductNames, copyServiceWorker } from './copy-service-worker'
import { readMockedData, writeMockedData, copyMswWorker } from './file-io'
import { addTenantConfig } from './add-tenant'

function createMockContext(
  overrides: Partial<VueTenantContext> = {},
): VueTenantContext {
  return {
    name: 'test',
    Name: 'Test',
    camelName: 'test',
    description: 'Test tenant',
    metadataMode: 'fixture',
    theme: 'default',
    overrideComponent: false,
    registerMsw: true,
    prefix: 'te',
    cwd: '/tmp/test',
    argv: [],
    pinion: {
      cwd: '/tmp/test',
      force: true,
      logger: {
        notice: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        log: vi.fn(),
      },
      prompt: vi.fn().mockResolvedValue({}),
      trace: [],
      exec: vi.fn().mockResolvedValue(0),
    },
    ...overrides,
  } as unknown as VueTenantContext
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getProductNames', () => {
  it('returns correct 3 names with suffixes alpha, beta, gamma', () => {
    const result = getProductNames('foo')
    expect(result).toEqual(['foo-alpha', 'foo-beta', 'foo-gamma'])
  })

  it('works with hyphenated name', () => {
    const result = getProductNames('my-app')
    expect(result).toEqual(['my-app-alpha', 'my-app-beta', 'my-app-gamma'])
  })

  it('works with single-letter name', () => {
    const result = getProductNames('x')
    expect(result).toEqual(['x-alpha', 'x-beta', 'x-gamma'])
  })
})

describe('copyServiceWorker', () => {
  it('logs notice and returns ctx unchanged when registerMsw is false', () => {
    const ctx = createMockContext({ registerMsw: false })
    const result = copyServiceWorker(ctx)

    expect(ctx.pinion.logger.notice).toHaveBeenCalledOnce()
    expect(result).toBe(ctx)
    expect(readMockedData).not.toHaveBeenCalled()
    expect(addTenantConfig).not.toHaveBeenCalled()
    expect(writeMockedData).not.toHaveBeenCalled()
    expect(copyMswWorker).not.toHaveBeenCalled()
  })

  it('reads data, adds config, writes data, copies worker, logs success on happy path', () => {
    const ctx = createMockContext()
    const mockData = {
      existing: {
        names: ['a'],
        price: { base: 9.99, increment: 10 },
        rateType: 'random' as const,
      },
    }
    const mockUpdated = {
      ...mockData,
      te: {
        names: ['test-alpha', 'test-beta', 'test-gamma'],
        price: { base: 9.99, increment: 10 },
        rateType: 'random' as const,
      },
    }

    vi.mocked(readMockedData).mockReturnValue(mockData)
    vi.mocked(addTenantConfig).mockReturnValue(mockUpdated)

    const result = copyServiceWorker(ctx)

    expect(readMockedData).toHaveBeenCalledOnce()
    expect(addTenantConfig).toHaveBeenCalledWith(
      mockData,
      'te',
      ['test-alpha', 'test-beta', 'test-gamma'],
    )
    expect(writeMockedData).toHaveBeenCalledOnce()
    expect(writeMockedData).toHaveBeenCalledWith(
      expect.any(String),
      mockUpdated,
    )
    expect(copyMswWorker).toHaveBeenCalledOnce()
    expect(ctx.pinion.logger.notice).toHaveBeenCalledTimes(2)
    expect(result).toBe(ctx)
  })

  it('throws when MSW worker not found', () => {
    const ctx = createMockContext()
    const mockData = {
      existing: {
        names: ['a'],
        price: { base: 9.99, increment: 10 },
        rateType: 'random' as const,
      },
    }

    vi.mocked(readMockedData).mockReturnValue(mockData)
    vi.mocked(addTenantConfig).mockReturnValue({
      ...mockData,
      te: {
        names: ['test-alpha', 'test-beta', 'test-gamma'],
        price: { base: 9.99, increment: 10 },
        rateType: 'random' as const,
      },
    })

    vi.mocked(existsSync).mockReturnValue(false)

    expect(() => copyServiceWorker(ctx)).toThrow('MSW worker not found')

    expect(readMockedData).toHaveBeenCalledOnce()
    expect(addTenantConfig).toHaveBeenCalledOnce()
    expect(writeMockedData).toHaveBeenCalledOnce()
    expect(copyMswWorker).not.toHaveBeenCalled()
  })

  it('re-throws when copyMswWorker fails with non-not-found error', () => {
    const ctx = createMockContext()
    const mockData = {
      existing: {
        names: ['a'],
        price: { base: 9.99, increment: 10 },
        rateType: 'random' as const,
      },
    }
    vi.mocked(readMockedData).mockReturnValue(mockData)
    vi.mocked(addTenantConfig).mockReturnValue({
      ...mockData,
      te: {
        names: ['test-alpha', 'test-beta', 'test-gamma'],
        price: { base: 9.99, increment: 10 },
        rateType: 'random' as const,
      },
    })

    // Ensure existsSync returns true so we reach copyMswWorker
    vi.mocked(existsSync).mockReturnValue(true)

    vi.mocked(copyMswWorker).mockImplementation(() => {
      throw new Error('EACCES: permission denied')
    })

    expect(() => copyServiceWorker(ctx)).toThrow('EACCES')
  })
})
