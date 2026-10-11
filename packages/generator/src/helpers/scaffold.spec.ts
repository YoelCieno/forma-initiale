import { describe, it, expect, vi, afterAll } from 'vitest'
import type { Mock } from 'vitest'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import type { VueTenantContext } from '../models'
import { getLog, getMissingScaffoldFiles, outDir } from './scaffold'
import { createMockContext, tmpDirs } from './mocks'

afterAll(() => {
  for (const dir of tmpDirs) {
    rmSync(dir, { recursive: true, force: true })
  }
})

interface MockLogger {
  notice: Mock
  warn: Mock
  error: Mock
  log: Mock
}

function ctxWithLogger(): { ctx: VueTenantContext; logger: MockLogger } {
  const ctx: VueTenantContext = createMockContext()
  const logger: MockLogger = {
    notice: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
  }
  ctx.pinion.logger = logger
  return { ctx, logger }
}

describe('outDir', () => {
  it('targets apps/<name>-vue', () => {
    const ctx: VueTenantContext = createMockContext({ name: 'zen-plants' })
    expect(outDir(ctx)).toBe('apps/zen-plants-vue')
  })
})

describe('getMissingScaffoldFiles', () => {
  it('returns all scaffold checks when nothing exists', () => {
    const ctx: VueTenantContext = createMockContext({ name: 'missing-tenant' })
    const missing = getMissingScaffoldFiles(ctx)
    expect(missing.length).toBeGreaterThan(0)
    expect(missing.every((f) => f.includes('missing-tenant-vue'))).toBe(true)
  })

  it('excludes files that exist on disk', () => {
    const ctx: VueTenantContext = createMockContext({ name: 'partial-tenant' })
    const pkg = join(ctx.cwd, outDir(ctx), 'package.json')
    mkdirSync(dirname(pkg), { recursive: true })
    writeFileSync(pkg, '{}')

    const missing = getMissingScaffoldFiles(ctx)
    expect(missing.some((f) => f.endsWith('package.json'))).toBe(false)
    expect(existsSync(pkg)).toBe(true)
  })
})

describe('getLog', () => {
  it('regression: prints success notice when zero files missing (was: length < 0, always warned)', () => {
    const { ctx, logger } = ctxWithLogger()

    getLog(ctx, [])

    expect(logger.notice).toHaveBeenCalledWith(
      expect.stringContaining('created successfully'),
    )
    expect(logger.warn).not.toHaveBeenCalled()
  })

  it('warns with the missing file COUNT when files are missing', () => {
    const { ctx, logger } = ctxWithLogger()

    getLog(ctx, ['/a/b.json', '/c/d.ts'])

    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('2 file(s) missing'),
    )
    expect(logger.warn).not.toHaveBeenCalledWith(
      expect.stringContaining('/a/b.json'),
    )
    expect(logger.notice).not.toHaveBeenCalled()
  })
})
