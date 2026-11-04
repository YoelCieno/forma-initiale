import { describe, it, expect, afterAll } from 'vitest'
import { rmSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { TenantContext } from '../models'
import {
  renderSetup,
  renderSourceFiles,
  renderConditionalAssets,
  generate,
} from './angular-tenant.tpl'
import { createMockContext, tmpDirs } from '../helpers/mocks'

afterAll(() => {
  for (const dir of tmpDirs) {
    rmSync(dir, { recursive: true, force: true })
  }
})

const angularCtx = (overrides: Partial<TenantContext> = {}): TenantContext =>
  createMockContext<TenantContext>({ framework: 'angular', ...overrides })

function renderFiles(trace: TenantContext['pinion']['trace']): string[] {
  return trace
    .filter((t) => t.name === 'renderTemplate')
    .map((t) => (t.info as { fileName: string }).fileName)
}

describe('renderSetup', () => {
  it('renders package.json, angular.json, tsconfigs, index.html, eslintrc, gitignore', async () => {
    const result = await renderSetup(angularCtx())

    const files = renderFiles(result.pinion.trace)
    expect(files.some((f) => f.endsWith('package.json'))).toBe(true)
    expect(files.some((f) => f.endsWith('angular.json'))).toBe(true)
    expect(files.some((f) => f.endsWith('tsconfig.json'))).toBe(true)
    expect(files.some((f) => f.endsWith('tsconfig.app.json'))).toBe(true)
    expect(files.some((f) => f.endsWith('tsconfig.spec.json'))).toBe(true)
    expect(files.some((f) => f.endsWith('src/index.html'))).toBe(true)
    expect(files.some((f) => f.endsWith('.eslintrc.cjs'))).toBe(true)
    expect(files.some((f) => f.endsWith('.gitignore'))).toBe(true)
  })
})

describe('renderSourceFiles', () => {
  it('appShell=true: renders main.ts, app.component.ts, tokens.css, environments, import-meta-env.d.ts', async () => {
    const result = await renderSourceFiles(angularCtx({ appShell: true }))

    const files = renderFiles(result.pinion.trace)
    expect(files.some((f) => f.endsWith('src/main.ts'))).toBe(true)
    expect(files.some((f) => f.endsWith('src/app/app.component.ts'))).toBe(true)
    expect(files.some((f) => f.endsWith('src/main.spec.ts'))).toBe(true)
    expect(files.some((f) => f.endsWith('src/styles/tokens.css'))).toBe(true)
    expect(files.some((f) => f.endsWith('src/environments/environment.ts'))).toBe(true)
    expect(files.some((f) => f.endsWith('src/environments/environment.development.ts'))).toBe(true)
    expect(files.some((f) => f.endsWith('src/import-meta-env.d.ts'))).toBe(true)
  })

  it('appShell=false: shell root used — app.component.ts NOT emitted', async () => {
    const result = await renderSourceFiles(angularCtx({ appShell: false }))

    const files = renderFiles(result.pinion.trace)
    expect(files.some((f) => f.endsWith('src/app/app.component.ts'))).toBe(false)
    expect(files.some((f) => f.endsWith('src/main.ts'))).toBe(true)
  })
})

describe('renderConditionalAssets', () => {
  it('renders {kebab}.component.ts when overrideComponent is true', async () => {
    const result = await renderConditionalAssets(
      angularCtx({ overrideComponent: true, overrideComponentName: 'ProductCard' }),
    )

    const files = renderFiles(result.pinion.trace)
    expect(files.some((f) => f.endsWith('product-card.component.ts'))).toBe(true)
    expect(files.some((f) => f.endsWith('.gitkeep'))).toBe(false)
  })

  it('renders .gitkeep when overrideComponent is false', async () => {
    const result = await renderConditionalAssets(angularCtx({ overrideComponent: false }))

    const files = renderFiles(result.pinion.trace)
    expect(files.some((f) => f.endsWith('.gitkeep'))).toBe(true)
  })
})

describe('generate', () => {
  it('chains stages: prefix from naming, angular port, shell root, no app shell', async () => {
    const ctx = angularCtx({ name: 'zen-plants', metadataMode: 'fixture' })
    const result = await generate(ctx)

    // prefix derived via domain naming(): zen-plants -> zp
    expect(result.prefix).toBe('zpa')
    expect(result.framework).toBe('angular')
    // port allocated via findNextDevPort(cwd, 'angular') — no angular apps in tmp cwd
    expect(result.devPort).toBe(3200)

    const renderTraces = result.pinion.trace.filter((t) => t.name === 'renderTemplate')
    // 9 (setup + override-barrel pre-hook script) + 6 (source, app.component.ts gated off) + 1 (conditional: gitkeep) = 16
    expect(renderTraces).toHaveLength(16)

    const base = join(ctx.cwd, 'apps', 'zen-plants-angular')
    expect(existsSync(join(base, 'package.json'))).toBe(true)
    expect(existsSync(join(base, 'angular.json'))).toBe(true)
    expect(existsSync(join(base, 'src', 'index.html'))).toBe(true)
    expect(existsSync(join(base, 'src', 'main.ts'))).toBe(true)
    expect(existsSync(join(base, 'src', 'main.spec.ts'))).toBe(true)
    expect(existsSync(join(base, 'src', 'styles', 'tokens.css'))).toBe(true)
    expect(existsSync(join(base, 'src', 'components', '.gitkeep'))).toBe(true)
    expect(existsSync(join(base, 'scripts', 'gen-component-overrides.ts'))).toBe(true)

    // angular.json carries allocated port
    const angularJson = JSON.parse(
      readFileSync(join(base, 'angular.json'), 'utf8'),
    ) as {
      projects: Record<string, { architect: { serve: { options: { port: number } } } }>
    }
    const project = angularJson.projects['zen-plants-angular']
    expect(project.architect.serve.options.port).toBe(3200)

    // index.html hosts the shell's <app-root>, no tenant app shell
    expect(readFileSync(join(base, 'src', 'index.html'), 'utf8')).toContain('<app-root></app-root>')
    expect(existsSync(join(base, 'src', 'app', 'app.component.ts'))).toBe(false)

    // main.ts uses the shell root — no appShell wiring
    const mainTs = readFileSync(join(base, 'src', 'main.ts'), 'utf8')
    expect(mainTs).not.toContain('appShell:')

    // infra metadata (fixture mode) + barrel export line
    expect(existsSync(join(ctx.cwd, 'packages', 'infra', 'src', 'metadata', 'zen-plants.ts'))).toBe(true)
    const infraIndex = join(ctx.cwd, 'packages', 'infra', 'src', 'index.ts')
    expect(readFileSync(infraIndex, 'utf8')).toContain("export { zenPlantsMap } from './metadata/zen-plants'")
  })

  it('appShell=true: emits tenant shell — app.component.ts, <prefix-root> host, appShell wiring', async () => {
    const ctx = angularCtx({ name: 'zen-plants', metadataMode: 'fixture', appShell: true })
    const result = await generate(ctx)

    const renderTraces = result.pinion.trace.filter((t) => t.name === 'renderTemplate')
    // 9 (setup + override-barrel pre-hook script) + 7 (source incl. app.component.ts) + 1 (conditional: gitkeep) = 17
    expect(renderTraces).toHaveLength(17)

    const base = join(ctx.cwd, 'apps', 'zen-plants-angular')
    expect(existsSync(join(base, 'src', 'app', 'app.component.ts'))).toBe(true)
    expect(readFileSync(join(base, 'src', 'index.html'), 'utf8')).toContain('<zpa-root></zpa-root>')

    // main.ts wires tenant appShell — class derived from prefix (zpa -> ZpaApp)
    const mainTs = readFileSync(join(base, 'src', 'main.ts'), 'utf8')
    expect(mainTs).toContain("appShell: () => import('./app/app.component').then((m) => m.ZpaApp),")
  })
})
