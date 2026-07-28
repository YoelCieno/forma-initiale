import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { findNextDevPort } from './port-allocator'

describe('findNextDevPort', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = join(tmpdir(), `port-allocator-test-${Date.now()}`)
    mkdirSync(join(tmpDir, 'apps'), { recursive: true })
  })

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true })
  })

  const writeViteConfig = (appName: string, port?: number) => {
    const appDir = join(tmpDir, 'apps', appName)
    mkdirSync(appDir, { recursive: true })
    const config = port !== undefined
      ? `import { defineWhiteLabelViteConfig } from 'white-label-vue/vite.config.base'\n\nexport default defineWhiteLabelViteConfig({\n  devPort: ${port},\n})\n`
      : `import { defineWhiteLabelViteConfig } from 'white-label-vue/vite.config.base'\n\nexport default defineWhiteLabelViteConfig({})\n`
    writeFileSync(join(appDir, 'vite.config.ts'), config)
  }

  it('returns DEFAULT_FIRST_PORT (3100) when apps dir is empty', () => {
    expect(findNextDevPort(tmpDir)).toBe(3100)
  })

  it('returns DEFAULT_FIRST_PORT when no -vue dirs exist', () => {
    writeViteConfig('some-other-app', 3100)
    expect(findNextDevPort(tmpDir)).toBe(3100)
  })

  it('returns DEFAULT_FIRST_PORT when -vue dir has no vite.config.ts', () => {
    mkdirSync(join(tmpDir, 'apps', 'empty-vue'), { recursive: true })
    expect(findNextDevPort(tmpDir)).toBe(3100)
  })

  it('returns max+1 when single app has devPort', () => {
    writeViteConfig('fake-plants-vue', 3101)
    expect(findNextDevPort(tmpDir)).toBe(3102)
  })

  it('returns max+1 when multiple apps have devPorts', () => {
    writeViteConfig('white-label-vue', 3100)
    writeViteConfig('fake-plants-vue', 3101)
    writeViteConfig('left-socks-vue', 3102)
    expect(findNextDevPort(tmpDir)).toBe(3103)
  })

  it('returns max+1 when ports are non-contiguous', () => {
    writeViteConfig('a-vue', 3100)
    writeViteConfig('b-vue', 3105)
    expect(findNextDevPort(tmpDir)).toBe(3106)
  })

  it('ignores -vue dirs without devPort in config', () => {
    writeViteConfig('a-vue', 3101)
    writeViteConfig('b-vue') // no devPort
    expect(findNextDevPort(tmpDir)).toBe(3102)
  })

  it('ignores -vue dirs without vite.config.ts at all', () => {
    writeViteConfig('a-vue', 3100)
    mkdirSync(join(tmpDir, 'apps', 'b-vue'), { recursive: true })
    expect(findNextDevPort(tmpDir)).toBe(3101)
  })

  it('returns DEFAULT_FIRST_PORT when apps dir does not exist', () => {
    const badDir = join(tmpDir, 'nonexistent')
    expect(findNextDevPort(badDir)).toBe(3100)
  })
})
