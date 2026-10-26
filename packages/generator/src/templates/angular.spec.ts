import { describe, it, expect } from 'vitest'
import type { TenantContext } from '../models'
import {
  packageJson,
  angularJson,
  indexHtml,
  mainTs,
  overrideComponent,
} from './angular'

/** angular.json architect → target → config block → value. */
type Architect = Record<string, Record<string, Record<string, Record<string, unknown>>>>

function ctx(overrides: Partial<TenantContext> = {}): TenantContext {
  return {
    name: 'zen-plants',
    Name: 'ZenPlants',
    camelName: 'zenPlants',
    description: 'Zen plants tenant',
    metadataMode: 'fixture',
    theme: 'default',
    brandHex: undefined,
    overrideComponent: false,
    overrideComponentName: undefined,
    prefix: 'zp',
    framework: 'angular',
    devPort: 3202,
    cwd: '/tmp',
    argv: [],
    pinion: {} as TenantContext['pinion'],
    ...overrides,
  }
}

describe('packageJson', () => {
  it('is named <name>-angular and carries the ng script set from SoT', () => {
    const pkg = JSON.parse(packageJson(ctx())) as {
      name: string
      scripts: Record<string, string>
    }
    expect(pkg.name).toBe('zen-plants-angular')
    expect(pkg.scripts.dev).toBe('ng serve')
    expect(pkg.scripts.build).toBe('ng build')
    expect(pkg.scripts.test).toBe('ng test --watch=false')
  })

  it('carries the predev/prebuild/pretest override-barrel trio', () => {
    const pkg = JSON.parse(packageJson(ctx())) as { scripts: Record<string, string> }
    for (const hook of ['predev', 'prebuild', 'pretest']) {
      expect(pkg.scripts[hook]).toContain('scripts/gen-component-overrides.ts')
    }
  })

  it.skip('depends on white-label-angular workspace + repo packages, but NOT @repo/domain', () => {
    const pkg = JSON.parse(packageJson(ctx())) as {
      dependencies: Record<string, string>
      exports?: unknown
    }
    expect(pkg.dependencies['white-label-angular']).toBe('workspace:*')
    expect(pkg.dependencies['@repo/infra']).toBe('*')
    // Tenant must NOT depend on @repo/domain (user directive)
    expect(pkg.dependencies['@repo/domain']).toBeUndefined()
    // Shell exports dropped in tenant
    expect(pkg.exports).toBeUndefined()
  })
})

describe('angularJson', () => {
  const config = () => JSON.parse(angularJson(ctx())) as Record<string, unknown>

  it('declares the tenant project by name and rewrites serve buildTargets', () => {
    const json = config()
    const projects = (json.projects as Record<string, unknown>) ?? {}
    expect(Object.keys(projects)).toEqual(['zen-plants-angular'])

    const architect = (projects['zen-plants-angular'] as Record<string, unknown>).architect as Architect
    expect(architect.serve.configurations.production.buildTarget).toBe('zen-plants-angular:build:production')
    expect(architect.serve.configurations.development.buildTarget).toBe('zen-plants-angular:build:development')
  })

  it('carries the 5-entry deep-ref styles array', () => {
    const json = config()
    const projects = json.projects as Record<string, Record<string, unknown>>
    const architect = projects['zen-plants-angular'].architect as Architect
    const styles = architect.build.options.styles
    expect(styles).toEqual([
      '../../packages/ui/styles/main.css',
      '../../packages/ui/styles/themes/default.css',
      '../white-label-angular/src/styles/tokens.css',
      'src/styles/tokens.css',
      '../white-label-angular/src/styles/base.css',
    ])
  })

  it('allocates serve port from ctx and disables prebundle', () => {
    const json = config()
    const projects = json.projects as Record<string, Record<string, unknown>>
    const architect = projects['zen-plants-angular'].architect as Architect
    expect(architect.serve.options.port).toBe(3202)
    expect(architect.serve.options.prebundle).toBe(false)
  })

  it('wires environment fileReplacements + element-internals setupFiles', () => {
    const json = config()
    const projects = json.projects as Record<string, Record<string, unknown>>
    const architect = projects['zen-plants-angular'].architect as Architect
    const dev = architect.build.configurations.development
    expect(dev.fileReplacements).toEqual([
      { replace: 'src/environments/environment.ts', with: 'src/environments/environment.development.ts' },
    ])
    expect(architect.test.options.setupFiles).toEqual([
      '../../packages/infra/src/testing/element-internals.ts',
    ])
  })
})

describe('indexHtml', () => {
  it('defaults to the shell host tag <app-root>', () => {
    const html = indexHtml(ctx())
    expect(html).toContain('<app-root></app-root>')
    expect(html).not.toContain('<zp-root>')
  })

  it('titles from tenant Name', () => {
    expect(indexHtml(ctx())).toContain('<title>ZenPlants — Tenant</title>')
  })
})

describe('overrideComponent', () => {
  it('emits product-card file shape: FpProductCard class + fp-product-card selector', () => {
    const out = overrideComponent(
      ctx({ overrideComponent: true, overrideComponentName: 'ProductCard', prefix: 'fp' }),
    )
    expect(out).toContain("selector: 'fp-product-card'")
    expect(out).toContain('export class FpProductCard')
  })

  it('uses classic @Input, never signal inputs (JIT gotcha)', () => {
    const out = overrideComponent(
      ctx({ overrideComponent: true, overrideComponentName: 'ProductCard', prefix: 'fp' }),
    )
    expect(out).toContain('@Input()')
    expect(out).not.toContain('input.required')
    expect(out).not.toContain('input(')
  })
})

describe('mainTs', () => {
  it('fixture mode: infra metaMap + generated overrides barrel + slash-less omit', () => {
    const out = mainTs(ctx())
    expect(out).toContain("import { zenPlantsMap } from '@repo/infra'")
    expect(out).toContain('metaMap: zenPlantsMap,')
    expect(out).toContain("import { componentOverrides } from './components/overrides.gen'")
    expect(out).toContain("componentOverrides,")
    expect(out).toContain("omitRoutePaths: ['components']")
  })

  it('none mode: no metaMap import, commented hint only', () => {
    const out = mainTs(ctx({ metadataMode: 'none' }))
    expect(out).not.toContain('zenPlantsMap')
    expect(out).toContain('// metaMap: myMap,')
  })

  it('never wires appShell — tenant always uses shell <app-root>', () => {
    expect(mainTs(ctx())).not.toContain('appShell:')
  })
})
