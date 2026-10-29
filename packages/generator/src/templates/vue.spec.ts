import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { TenantContext } from '../models'
import { REPO_ROOT } from '../helpers/file-io'
import {
  packageJson,
  viteConfig,
  tsconfigJson,
  eslintrc,
  indexHtml,
  mainTs,
  stylesIndex,
  componentVue,
  vitestSetup,
  vitestConfig,
  mainSpec,
  env,
  envExample,
} from './vue'

function ctx(overrides: Partial<TenantContext> = {}): TenantContext {
  return {
    name: 'test-tenant',
    Name: 'Test',
    camelName: 'testTenant',
    description: 'Test tenant',
    metadataMode: 'fixture',
    theme: 'default',
    brandHex: undefined,
    overrideComponent: false,
    overrideComponentName: undefined,
    prefix: 'te',
    framework: 'vue',
    devPort: 3103,
    cwd: '/tmp',
    argv: [],
    pinion: {} as TenantContext['pinion'],
    ...overrides,
  }
}

describe('packageJson', () => {
  it('contains tenant name and scripts/deps', () => {
    const result = packageJson(ctx())
    expect(result).toContain('"name": "test-tenant-vue"')
    expect(result).toContain('"dev": "vp dev"')
    expect(result).toContain('"build": "vp build"')
    expect(result).toContain('"test": "vp test"')
    expect(result).toContain('"white-label-vue": "workspace:*"')
    expect(result).toContain('"@repo/infra": "*"')
    expect(result).toContain('"vue":')
  })
})

describe('viteConfig', () => {
  it('contains componentDirs when overrideComponent is true', () => {
    const result = viteConfig(ctx({ overrideComponent: true }))
    expect(result).toContain('componentDirs')
  })

  it('comments out componentDirs when overrideComponent is false', () => {
    const result = viteConfig(ctx({ overrideComponent: false }))
    expect(result).toContain('// componentDirs')
  })
})

describe('tsconfigJson', () => {
  it('extends @repo/typescript-config/vite.json and has strictNullChecks', () => {
    const result = tsconfigJson()
    expect(result).toContain('"extends": "@repo/typescript-config/vite.json"')
    expect(result).toContain('"strictNullChecks": true')
  })
})

describe('indexHtml', () => {
  it('contains title with Name — Tenant', () => {
    const result = indexHtml(ctx({ Name: 'TestTenant' }))
    expect(result).toContain('<title>TestTenant — Tenant</title>')
  })
})

describe('mainTs', () => {
  it('imports @repo/ui/styles and metadata when metadataMode is fixture', () => {
    const result = mainTs(
      ctx({ metadataMode: 'fixture', camelName: 'test', theme: 'default' }),
    )
    expect(result).toContain("import '@repo/ui/styles/main.css'")
    expect(result).toContain("import { testMap } from '@repo/infra'")
  })

  it('does not import metadata when metadataMode is none', () => {
    const result = mainTs(ctx({ metadataMode: 'none', theme: 'default' }))
    expect(result).toContain("import '@repo/ui/styles/main.css'")
    expect(result).not.toContain("@repo/infra'")
    expect(result).toContain('// metaMap: myMap,')
  })
})

describe('stylesIndex', () => {
  it('imports tokens.css', () => {
    const result = stylesIndex()
    expect(result).toContain("'./tokens.css'")
  })
})

describe('componentVue', () => {
  it('produces valid component with correct class and script setup', () => {
    const result = componentVue(ctx({ overrideComponentName: 'ProductCard' }))
    expect(result).toContain('c-product-card')
    expect(result).toContain('<script setup lang="ts">')
  })
})

describe('eslintrc', () => {
  it('extends @repo/eslint-config/vue.js with tenant rules', () => {
    const result = eslintrc()
    expect(result).toContain('extends: ["@repo/eslint-config/vue.js"]')
    expect(result).toContain('root: true')
    expect(result).toContain('vue/no-deprecated-slot-attribute')
    expect(result).toContain('vue/html-self-closing')
  })
})

describe('vitestSetup', () => {
  it('imports vitest and @vue/test-utils', () => {
    const result = vitestSetup()
    expect(result).toContain("import { vi } from 'vitest'")
    expect(result).toContain("import { config } from '@vue/test-utils'")
  })

  it('configures isCustomElement for fe- prefix', () => {
    const result = vitestSetup()
    expect(result).toContain("tag.startsWith('fe-')")
  })
})

describe('mainSpec', () => {
  it('imports createWhiteLabelApp', () => {
    const result = mainSpec()
    expect(result).toContain("import { createWhiteLabelApp } from 'white-label-vue/app'")
  })

  it('tests app creation with createWhiteLabelApp', () => {
    const result = mainSpec()
    expect(result).toContain('createWhiteLabelApp')
    expect(result).toContain('expect')
    expect(result).toContain('app.unmount()')
  })
})

describe('vitestConfig', () => {
  it('defines jsdom environment and vue plugin', () => {
    const result = vitestConfig()
    expect(result).toContain("defineConfig")
    expect(result).toContain("environment: 'jsdom'")
    expect(result).toContain("isCustomElement")
    expect(result).toContain("VITE_ENABLE_MOCKS: ''")
  })
})

describe('env', () => {
  it('contains VITE_TENANT_ID from tenant name', () => {
    const result = env(ctx({ name: 'my-tenant', prefix: 'mt' }))
    expect(result).toContain('VITE_TENANT_ID=mt')
  })

  it('contains VITE_API_URL and VITE_ENABLE_MOCKS', () => {
    const result = env(ctx())
    expect(result).toContain('VITE_API_URL')
    expect(result).toContain('VITE_ENABLE_MOCKS')
  })
})

describe('envExample', () => {
  it('contains VITE_TENANT_ID placeholder', () => {
    const result = envExample
    expect(result).toContain('VITE_TENANT_ID=')
  })

  it('contains VITE_API_URL and VITE_ENABLE_MOCKS', () => {
    const result = envExample
    expect(result).toContain('VITE_API_URL')
    expect(result).toContain('VITE_ENABLE_MOCKS')
  })
})

describe('mirror-tenant SoT parity (design decision 8)', () => {
  const mirrorRoot = join(REPO_ROOT, 'apps/mirror-tenant-vue/')
  const readMirror = (rel: string): string => readFileSync(join(mirrorRoot, rel), 'utf8')

  const readers = [
    { name: 'eslintrc', tpl: eslintrc, rel: '.eslintrc.cjs' },
    { name: 'vitestSetup', tpl: vitestSetup, rel: 'vitest.setup.ts' },
    { name: 'vitestConfig', tpl: vitestConfig, rel: 'vitest.config.ts' },
    { name: 'mainSpec', tpl: mainSpec, rel: 'src/main.spec.ts' },
    { name: 'tsconfigJson', tpl: tsconfigJson, rel: 'tsconfig.json' },
    { name: 'stylesIndex', tpl: stylesIndex, rel: 'src/styles/index.ts' },
  ]

  it('ctx-free statics are zero-arg SoT readers, not inline strings', () => {
    for (const { name, tpl } of readers) {
      expect(typeof tpl, `${name} must be a () => string reader`).toBe('function')
    }
  })

  it.each(readers)('renders $name byte-equal to apps/mirror-tenant-vue/$rel', ({ tpl, rel }) => {
    const rendered = typeof tpl === 'function' ? tpl() : tpl
    expect(rendered).toBe(readMirror(rel))
  })

  it('packageJson with mirror name equals mirror package.json (JSON equality)', () => {
    expect(JSON.parse(packageJson(ctx({ name: 'mirror-tenant' })))).toEqual(
      JSON.parse(readMirror('package.json')),
    )
  })
})
