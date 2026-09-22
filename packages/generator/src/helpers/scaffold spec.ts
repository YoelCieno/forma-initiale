import { afterAll, expect, describe, it } from 'vitest';
import { renderSetup } from '../generators/vue-tenant.tpl';
import { VueTenantContext } from '../models';
import { rmSync } from 'node:fs';
import { createMockContext, tmpDirs } from './mocks';

afterAll(() => {
  for (const dir of tmpDirs) {
    rmSync(dir, { recursive: true, force: true })
  }
})

describe('helpers.scaffold', () => {
  it('renders package.json, main.ts, tokens.css, pages/, vitest.setup.ts, .eslintrc.cjs', async () => {
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
