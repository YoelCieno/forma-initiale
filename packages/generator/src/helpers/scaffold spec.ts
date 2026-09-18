import { afterAll, expect, describe, it } from 'vitest';
import { renderSetup } from '../generators/vue-tenant.tpl';
import { VueTenantContext } from '../models';
import { tmpdir } from 'node:os';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';

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


describe('helpers.scaffold', () => {
  it('renders package.json, vite.config.ts, tsconfig.json, index.html, .eslintrc.cjs', async () => {
    const ctx: VueTenantContext = createMockContext()
    const result = await renderSetup(ctx)

    const trace = result.pinion.trace
    expect(trace).toHaveLength(6)
    expect(trace.every((t) => t.name === 'renderTemplate')).toBe(true)

    const files = trace.map(
      (t) => (t.info as { fileName: string }).fileName,
    )
    expect(files.some((f) => f.endsWith('package.json'))).toBe(true)
    expect(files.some((f) => f.endsWith('src/main.ts'))).toBe(true)
    expect(files.some((f) => f.endsWith('src/styles/tokens.css'))).toBe(true)
    expect(files.some((f) => f.endsWith('src/pages/.gitkeep'))).toBe(true)
    expect(files.some((f) => f.endsWith('vitest.setup.ts'))).toBe(true)
    expect(files.some((f) => f.endsWith('.eslintrc.cjs'))).toBe(true)
  })
})