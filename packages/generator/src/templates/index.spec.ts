import { describe, it, expect } from 'vitest'
import type { VueTenantContext } from '../models'
import {
  packageJson,
  viteConfig,
  tsconfigJson,
  indexHtml,
  mainTs,
  tokensCss,
  stylesIndex,
  componentVue,
  gitkeep,
  vitestSetup,
  appSpec,
  env,
  envExample,
} from './index'

function ctx(overrides: Partial<VueTenantContext> = {}): VueTenantContext {
  return {
    name: 'test',
    Name: 'Test',
    camelName: 'test',
    description: 'Test tenant',
    metadataMode: 'fixture',
    theme: 'default',
    brandHex: undefined,
    overrideComponent: false,
    overrideComponentName: undefined,
    prefix: 'te',
    cwd: '/tmp',
    argv: [],
    pinion: {} as VueTenantContext['pinion'],
    ...overrides,
  }
}

describe('packageJson', () => {
  it('contains tenant name and scripts/deps', () => {
    const result = packageJson(ctx())
    expect(result).toContain('"name": "tenant-test-vue"')
    expect(result).toContain('"dev": "vp dev"')
    expect(result).toContain('"build": "vp build"')
    expect(result).toContain('"test": "vp test"')
    expect(result).toContain('"white-label-vue": "workspace:*"')
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
    const result = tsconfigJson(ctx())
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
    expect(result).toContain("import '@repo/ui/styles'")
    expect(result).toContain("import { testMap } from '../metadata'")
  })

  it('does not import metadata when metadataMode is none', () => {
    const result = mainTs(ctx({ metadataMode: 'none', theme: 'default' }))
    expect(result).toContain("import '@repo/ui/styles'")
    expect(result).not.toContain("from '../metadata'")
  })
})

describe('tokensCss', () => {
  it('contains brand hex when theme is custom', () => {
    const result = tokensCss(ctx({ theme: 'custom', brandHex: '#ff6600' }))
    expect(result).toContain('--brand-fill-normal: #ff6600')
  })

  it('contains theme tokens for cyberpunk theme', () => {
    const result = tokensCss(ctx({ theme: 'cyberpunk' }))
    expect(result).toContain('--brand-fill-normal')
    expect(result).toContain('--color-text-body')
    expect(result).toContain('--fs-xl')
  })

  it('contains theme tokens for coffeecup theme', () => {
    const result = tokensCss(ctx({ theme: 'coffeecup' }))
    expect(result).toContain('--brand-fill-normal')
    expect(result).toContain('--color-text-body')
    expect(result).toContain('--fs-xl')
  })

  it('contains theme tokens for silk theme', () => {
    const result = tokensCss(ctx({ theme: 'silk' }))
    expect(result).toContain('--brand-fill-normal')
    expect(result).toContain('--color-text-body')
    expect(result).toContain('--fs-xl')
  })
})

describe('stylesIndex', () => {
  it('imports tokens.css', () => {
    const result = stylesIndex(ctx())
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

describe('gitkeep', () => {
  it('returns empty string', () => {
    const result = gitkeep(ctx())
    expect(result).toBe('')
  })
})

describe('vitestSetup', () => {
  it('imports vitest and @vue/test-utils', () => {
    const result = vitestSetup(ctx())
    expect(result).toContain("import { vi } from 'vitest'")
    expect(result).toContain("import { config } from '@vue/test-utils'")
  })

  it('configures isCustomElement for fe- prefix', () => {
    const result = vitestSetup(ctx())
    expect(result).toContain("tag.startsWith('fe-')")
  })
})

describe('appSpec', () => {
  it('imports createWhiteLabelApp', () => {
    const result = appSpec(ctx())
    expect(result).toContain("import { createWhiteLabelApp } from 'white-label-vue/app'")
  })

  it('tests app creation with createWhiteLabelApp', () => {
    const result = appSpec(ctx())
    expect(result).toContain('createWhiteLabelApp')
    expect(result).toContain('expect')
    expect(result).toContain('app.unmount()')
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
    const result = envExample(ctx())
    expect(result).toContain('VITE_TENANT_ID=')
  })

  it('contains VITE_API_URL and VITE_ENABLE_MOCKS', () => {
    const result = envExample(ctx())
    expect(result).toContain('VITE_API_URL')
    expect(result).toContain('VITE_ENABLE_MOCKS')
  })
})
