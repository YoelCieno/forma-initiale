import { describe, it, expect, afterAll } from 'vitest'
import { mkdtempSync, rmSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import type { VueTenantContext } from '../models'
import {
  renderSetup,
  renderSourceFiles,
  renderConditionalAssets,
  renderTestInfra,
  generate,
} from './vue-tenant.tpl'

const tmpDirs: string[] = []

afterAll(() => {
  for (const dir of tmpDirs) {
    rmSync(dir, { recursive: true, force: true })
  }
})

function createMockContext<T>(
  overrides: Partial<VueTenantContext> = {},
): T {
  const tmpDir = mkdtempSync(join(tmpdir(), 'gen-test-'))
  tmpDirs.push(tmpDir)
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
    registerMsw: false,
    prefix: 'te',
    cwd: tmpDir,
    argv: [],
    pinion: {
      cwd: tmpDir,
      force: true,
      logger: {
        notice: () => {},
        warn: () => {},
        error: () => {},
        log: () => {},
      },
      prompt: (() => Promise.resolve({})),
      trace: [],
      exec: async () => 0,
    },
    ...overrides,
  } as T
}

function renderFiles(
  trace: VueTenantContext['pinion']['trace'],
): string[] {
  return trace
    .filter((t) => t.name === 'renderTemplate')
    .map((t) => (t.info as { fileName: string }).fileName)
}

describe('renderSetup', () => {
  it('renders package.json, vite.config.ts, tsconfig.json, index.html, .eslintrc.cjs', async () => {
    const ctx: VueTenantContext = createMockContext()
    const result = await renderSetup(ctx)

    const trace = result.pinion.trace
    expect(trace).toHaveLength(5)
    expect(trace.every((t) => t.name === 'renderTemplate')).toBe(true)

    const files = trace.map(
      (t) => (t.info as { fileName: string }).fileName,
    )
    expect(files.some((f) => f.endsWith('package.json'))).toBe(true)
    expect(files.some((f) => f.endsWith('vite.config.ts'))).toBe(true)
    expect(files.some((f) => f.endsWith('tsconfig.json'))).toBe(true)
    expect(files.some((f) => f.endsWith('index.html'))).toBe(true)
    expect(files.some((f) => f.endsWith('.eslintrc.cjs'))).toBe(true)
  })
})

describe('renderSourceFiles', () => {
  it('renders main.ts, tokens.css, styles/index.ts and copies vite-env.d.ts', async () => {
    const ctx: VueTenantContext = createMockContext()
    // Create source vite-env.d.ts for copy operation
    const sourceDir = join(ctx.cwd, 'apps/white-label-vue/src')
    mkdirSync(sourceDir, { recursive: true })
    writeFileSync(join(sourceDir, 'vite-env.d.ts'), '/// <reference types="vite/client" />')

    const result = await renderSourceFiles(ctx)

    const trace = result.pinion.trace
    expect(trace).toHaveLength(3)
    expect(trace.every((t) => t.name === 'renderTemplate')).toBe(true)

    const files = trace.map(
      (t) => (t.info as { fileName: string }).fileName,
    )
    expect(files.some((f) => f.endsWith('src/main.ts'))).toBe(true)
    expect(files.some((f) => f.endsWith('src/styles/tokens.css'))).toBe(true)
    expect(files.some((f) => f.endsWith('src/styles/index.ts'))).toBe(true)

    // Verify vite-env.d.ts was copied
    expect(existsSync(join(ctx.cwd, 'apps/test-vue/src/vite-env.d.ts'))).toBe(true)
  })
})

describe('renderConditionalAssets', () => {
  it('renders metadata.ts when metadataMode is fixture', async () => {
    const ctx: VueTenantContext = createMockContext({ metadataMode: 'fixture' })
    const result = await renderConditionalAssets(ctx)

    const files = renderFiles(result.pinion.trace)
    expect(files.some((f) => f.endsWith('metadata.ts'))).toBe(true)
  })

  it('skips metadata.ts when metadataMode is none', async () => {
    const ctx: VueTenantContext = createMockContext({ metadataMode: 'none' })
    const result = await renderConditionalAssets(ctx)

    const files = renderFiles(result.pinion.trace)
    expect(files.some((f) => f.endsWith('metadata.ts'))).toBe(false)
  })

  it('renders component .vue when overrideComponent is true', async () => {
    const ctx: VueTenantContext = createMockContext({
      overrideComponent: true,
      overrideComponentName: 'ProductCard',
    })
    const result = await renderConditionalAssets(ctx)

    const files = renderFiles(result.pinion.trace)
    expect(files.some((f) => f.endsWith('ProductCard.vue'))).toBe(true)
    expect(files.some((f) => f.endsWith('.gitkeep'))).toBe(false)
  })

  it('renders .gitkeep when overrideComponent is false', async () => {
    const ctx: VueTenantContext = createMockContext({ overrideComponent: false })
    const result = await renderConditionalAssets(ctx)

    const files = renderFiles(result.pinion.trace)
    expect(files.some((f) => f.endsWith('.gitkeep'))).toBe(true)
    expect(files.some((f) => f.endsWith('.vue'))).toBe(false)
  })
})

describe('renderTestInfra', () => {
  it('renders vitest.setup.ts, vitest.config.ts, main.spec.ts, .env, .env.example, and pages .gitkeep', async () => {
    const ctx: VueTenantContext = createMockContext()
    const result = await renderTestInfra(ctx)

    const trace = result.pinion.trace
    expect(trace).toHaveLength(6)
    expect(trace.every((t) => t.name === 'renderTemplate')).toBe(true)

    const files = trace.map(
      (t) => (t.info as { fileName: string }).fileName,
    )
    expect(files.some((f) => f.endsWith('src/pages/.gitkeep'))).toBe(true)
    expect(files.some((f) => f.endsWith('vitest.setup.ts'))).toBe(true)
    expect(files.some((f) => f.endsWith('vitest.config.ts'))).toBe(true)
    expect(files.some((f) => f.endsWith('src/main.spec.ts'))).toBe(true)
    expect(files.some((f) => f.endsWith('.env'))).toBe(true)
    expect(files.some((f) => f.endsWith('.env.example'))).toBe(true)
  })
})

describe('generate', () => {
  it('chains all sub-fns and writes files to disk', async () => {
    const ctx: VueTenantContext = createMockContext({
      metadataMode: 'fixture',
      overrideComponent: false,
    })
    // Create source vite-env.d.ts for copy operation
    const sourceDir = join(ctx.cwd, 'apps/white-label-vue/src')
    mkdirSync(sourceDir, { recursive: true })
    writeFileSync(join(sourceDir, 'vite-env.d.ts'), '/// <reference types="vite/client" />')

    const result = await generate(ctx)

    // All renderTemplate calls should have trace entries
    const renderTraces = result.pinion.trace.filter(
      (t) => t.name === 'renderTemplate',
    )
    // 5 (setup + eslintrc) + 3 (source) + 2 (conditional: metadata + gitkeep) + 6 (test infra: gitkeep, vitest.setup, vitest.config, main.spec, .env, .env.example) = 16
    expect(renderTraces).toHaveLength(16)

    // Verify prompt was called
    const promptTraces = result.pinion.trace.filter((t) => t.name === 'prompt')
    expect(promptTraces).toHaveLength(1)

    // Check files exist on disk
    const base = join(ctx.cwd, 'apps', 'test-vue')

    // renderSetup
    expect(existsSync(join(base, 'package.json'))).toBe(true)
    expect(existsSync(join(base, 'vite.config.ts'))).toBe(true)
    expect(existsSync(join(base, 'tsconfig.json'))).toBe(true)
    expect(existsSync(join(base, 'index.html'))).toBe(true)
    expect(existsSync(join(base, '.eslintrc.cjs'))).toBe(true)

    // renderSourceFiles
    expect(existsSync(join(base, 'src', 'main.ts'))).toBe(true)
    expect(existsSync(join(base, 'src', 'styles', 'tokens.css'))).toBe(true)
    expect(existsSync(join(base, 'src', 'styles', 'index.ts'))).toBe(true)
    expect(existsSync(join(base, 'src', 'vite-env.d.ts'))).toBe(true)

    // renderConditionalAssets (metadataMode=fixture => metadata.ts, overrideComponent=false => .gitkeep)
    expect(existsSync(join(base, 'metadata.ts'))).toBe(true)
    expect(existsSync(join(base, 'src', 'components', '.gitkeep'))).toBe(true)

    // renderTestInfra
    expect(existsSync(join(base, 'src', 'pages', '.gitkeep'))).toBe(true)
    expect(existsSync(join(base, 'vitest.setup.ts'))).toBe(true)
    expect(existsSync(join(base, 'vitest.config.ts'))).toBe(true)
    expect(existsSync(join(base, 'src', 'main.spec.ts'))).toBe(true)
    expect(existsSync(join(base, '.env'))).toBe(true)
    expect(existsSync(join(base, '.env.example'))).toBe(true)
  })
})
