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
    delete process.env['VUE_FIRST_PORT']
    delete process.env['ANGULAR_FIRST_PORT']
    delete process.env['REACT_FIRST_PORT']
  })

  const writeViteConfig = (appName: string, port?: number) => {
    const appDir = join(tmpDir, 'apps', appName)
    mkdirSync(appDir, { recursive: true })
    const config = port !== undefined
      ? `import { defineWhiteLabelViteConfig } from 'white-label-vue/vite.config.base'\n\nexport default defineWhiteLabelViteConfig({\n  devPort: ${port},\n})\n`
      : `import { defineWhiteLabelViteConfig } from 'white-label-vue/vite.config.base'\n\nexport default defineWhiteLabelViteConfig({})\n`
    writeFileSync(join(appDir, 'vite.config.ts'), config)
  }

  const writeAngularConfig = (appName: string, port?: number) => {
    const appDir = join(tmpDir, 'apps', appName)
    mkdirSync(appDir, { recursive: true })
    const serve = port !== undefined ? { options: { port } } : {}
    const config = { projects: { [appName]: { projectType: 'application', serve } } }
    writeFileSync(join(appDir, 'angular.json'), JSON.stringify(config, null, 2))
  }

  it('returns VUE_FIRST_PORT fallback (3000) when apps dir is empty', () => {
    expect(findNextDevPort(tmpDir, 'vue')).toBe(3000)
  })

  it('returns VUE_FIRST_PORT fallback when no -vue dirs exist', () => {
    writeViteConfig('some-other-app', 3100)
    expect(findNextDevPort(tmpDir, 'vue')).toBe(3000)
  })

  it('returns VUE_FIRST_PORT fallback when -vue dir has no vite.config.ts', () => {
    mkdirSync(join(tmpDir, 'apps', 'empty-vue'), { recursive: true })
    expect(findNextDevPort(tmpDir, 'vue')).toBe(3000)
  })

  it('returns max+1 when single app has devPort', () => {
    writeViteConfig('fake-plants-vue', 3101)
    expect(findNextDevPort(tmpDir, 'vue')).toBe(3102)
  })

  it('returns max+1 when multiple apps have devPorts', () => {
    writeViteConfig('white-label-vue', 3100)
    writeViteConfig('fake-plants-vue', 3101)
    writeViteConfig('left-socks-vue', 3102)
    expect(findNextDevPort(tmpDir, 'vue')).toBe(3103)
  })

  it('returns max+1 when ports are non-contiguous', () => {
    writeViteConfig('a-vue', 3100)
    writeViteConfig('b-vue', 3105)
    expect(findNextDevPort(tmpDir, 'vue')).toBe(3106)
  })

  it('ignores -vue dirs without devPort in config', () => {
    writeViteConfig('a-vue', 3101)
    writeViteConfig('b-vue') // no devPort
    expect(findNextDevPort(tmpDir, 'vue')).toBe(3102)
  })

  it('ignores -vue dirs without vite.config.ts at all', () => {
    writeViteConfig('a-vue', 3100)
    mkdirSync(join(tmpDir, 'apps', 'b-vue'), { recursive: true })
    expect(findNextDevPort(tmpDir, 'vue')).toBe(3101)
  })

  it('returns VUE_FIRST_PORT fallback when apps dir does not exist', () => {
    const badDir = join(tmpDir, 'nonexistent')
    expect(findNextDevPort(badDir, 'vue')).toBe(3000)
  })

  it('vue scan ignores -angular dirs entirely', () => {
    writeAngularConfig('white-label-angular', 3200)
    expect(findNextDevPort(tmpDir, 'vue')).toBe(3000)
  })

  it('angular: returns 3200 when no angular apps exist', () => {
    writeViteConfig('white-label-vue', 3100)
    expect(findNextDevPort(tmpDir, 'angular')).toBe(3200)
  })

  it('angular: returns max+1 of angular.json serve ports', () => {
    writeAngularConfig('white-label-angular', 3200)
    writeAngularConfig('fake-plants-angular', 3201)
    expect(findNextDevPort(tmpDir, 'angular')).toBe(3202)
  })

  it('angular: ignores -angular dirs without angular.json', () => {
    writeAngularConfig('a-angular', 3201)
    mkdirSync(join(tmpDir, 'apps', 'b-angular'), { recursive: true })
    expect(findNextDevPort(tmpDir, 'angular')).toBe(3202)
  })

  it('angular: ignores angular.json without a serve port', () => {
    writeAngularConfig('a-angular', 3201)
    writeAngularConfig('b-angular') // no port
    expect(findNextDevPort(tmpDir, 'angular')).toBe(3202)
  })

  it('angular: ignores non -angular dirs', () => {
    writeViteConfig('white-label-vue', 3100)
    writeAngularConfig('white-label-angular', 3200)
    expect(findNextDevPort(tmpDir, 'angular')).toBe(3201)
  })

  it('react: returns REACT_FIRST_PORT fallback (3300) when no -react apps exist', () => {
    writeViteConfig('white-label-vue', 3100)
    expect(findNextDevPort(tmpDir, 'react')).toBe(3300)
  })

  it('react: returns max+1 of vite devPort values', () => {
    writeViteConfig('white-label-react', 3300)
    expect(findNextDevPort(tmpDir, 'react')).toBe(3301)
  })

  describe('first-port env overrides', () => {
    it('VUE_FIRST_PORT wins over the 3000 fallback', () => {
      process.env['VUE_FIRST_PORT'] = '4000'
      expect(findNextDevPort(tmpDir, 'vue')).toBe(4000)
    })

    it('ANGULAR_FIRST_PORT wins over the 3200 fallback', () => {
      process.env['ANGULAR_FIRST_PORT'] = '4400'
      expect(findNextDevPort(tmpDir, 'angular')).toBe(4400)
    })

    it('REACT_FIRST_PORT wins over the 3300 fallback', () => {
      process.env['REACT_FIRST_PORT'] = '4800'
      expect(findNextDevPort(tmpDir, 'react')).toBe(4800)
    })

    it('env override never displaces an existing app port', () => {
      process.env['VUE_FIRST_PORT'] = '4000'
      writeViteConfig('white-label-vue', 3100)
      expect(findNextDevPort(tmpDir, 'vue')).toBe(3101)
    })

    it('non-numeric env value falls back to the default', () => {
      process.env['VUE_FIRST_PORT'] = 'not-a-port'
      expect(findNextDevPort(tmpDir, 'vue')).toBe(3000)
    })

    it('zero env value falls back to the default', () => {
      process.env['VUE_FIRST_PORT'] = '0'
      expect(findNextDevPort(tmpDir, 'vue')).toBe(3000)
    })
  })
})
