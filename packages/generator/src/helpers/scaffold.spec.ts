import { describe, it, expect, vi, afterAll } from 'vitest'
import type { Mock } from 'vitest'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import type { TenantContext } from '../models'
import { getLog, getMissingScaffoldFiles, outDir } from './scaffold'
import { createMockContext, tmpDirs } from './mocks'

interface MockLogger {
  notice: Mock
  warn: Mock
  error: Mock
  log: Mock
}

afterAll(() => {
  for (const dir of tmpDirs) {
    rmSync(dir, { recursive: true, force: true })
  }
})

function ctxWithLogger(): { ctx: TenantContext; logger: MockLogger } {
  const ctx: TenantContext = createMockContext()
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
    const ctx: TenantContext = createMockContext({ name: 'zen-plants' })
    expect(outDir(ctx)).toBe('apps/zen-plants-vue')
  })

  it('targets apps/<name>-angular for angular framework', () => {
    const ctx: TenantContext = createMockContext({
      name: 'zen-plants',
      framework: 'angular',
    })
    expect(outDir(ctx)).toBe('apps/zen-plants-angular')
  })
})

describe('getMissingScaffoldFiles', () => {
  it('returns all scaffold checks when nothing exists', () => {
    const ctx: TenantContext = createMockContext({ name: 'missing-tenant' })
    const missing = getMissingScaffoldFiles(ctx, [
      'package.json',
      'vite.config.ts',
      'src/main.ts',
    ])
    expect(missing.length).toBeGreaterThan(0)
    expect(missing.every((f) => f.includes('missing-tenant-vue'))).toBe(true)
  })

  it('excludes files that exist on disk', () => {
    const ctx: TenantContext = createMockContext({ name: 'partial-tenant' })
    const pkg = join(ctx.cwd, outDir(ctx), 'package.json')
    mkdirSync(dirname(pkg), { recursive: true })
    writeFileSync(pkg, '{}')

    const missing = getMissingScaffoldFiles(ctx, [
      'package.json',
      'src/main.ts',
    ])
    expect(missing.some((f) => f.endsWith('package.json'))).toBe(false)
    expect(missing).toHaveLength(1)
    expect(missing[0].endsWith('src/main.ts')).toBe(true)
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
