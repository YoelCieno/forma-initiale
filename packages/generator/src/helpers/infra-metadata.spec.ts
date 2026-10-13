import { describe, it, expect, afterAll } from 'vitest'
import { rmSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import type { TenantContext } from '../models'
import { infraMetadata } from './infra-metadata'
import { createMockContext, tmpDirs } from './mocks'

afterAll(() => {
  for (const dir of tmpDirs) {
    rmSync(dir, { recursive: true, force: true })
  }
})

const { writeInfraMetadata } = infraMetadata()

const infraPaths = (ctx: TenantContext) => ({
  metaFile: join(ctx.cwd, 'packages', 'infra', 'src', 'metadata', `${ctx.name}.ts`),
  barrel: join(ctx.cwd, 'packages', 'infra', 'src', 'index.ts'),
})

const seedBarrel = (ctx: TenantContext, content = "export { getProducts } from './adapters/get-products.adapter'\n") => {
  const { barrel } = infraPaths(ctx)
  mkdirSync(dirname(barrel), { recursive: true })
  writeFileSync(barrel, content)
}

describe('writeInfraMetadata', () => {
  it('fixture mode: writes packages/infra/src/metadata/<name>.ts with keys matching getProductNames', () => {
    const ctx: TenantContext = createMockContext({ name: 'zen-plants', camelName: 'zenPlants' })
    seedBarrel(ctx)

    writeInfraMetadata(ctx)

    const { metaFile, barrel } = infraPaths(ctx)
    const content = readFileSync(metaFile, 'utf8')
    expect(content).toContain('export const zenPlantsMap')
    expect(content).toContain("'zen-plants-alpha':")
    expect(content).toContain("'zen-plants-beta':")
    expect(content).toContain("'zen-plants-gamma':")
    expect(readFileSync(barrel, 'utf8')).toContain("export { zenPlantsMap } from './metadata/zen-plants'")
  })

  it('appends barrel export line exactly once on repeated runs (idempotent)', () => {
    const ctx: TenantContext = createMockContext({ name: 'zen-plants', camelName: 'zenPlants' })
    seedBarrel(ctx)

    writeInfraMetadata(ctx)
    writeInfraMetadata(ctx)

    const { barrel } = infraPaths(ctx)
    const lines = readFileSync(barrel, 'utf8')
      .split('\n')
      .filter((l) => l.includes("from './metadata/zen-plants'"))
    expect(lines).toHaveLength(1)
  })

  it('existing metadata file: skips content write, preserves curated bytes, still ensures barrel line', () => {
    const ctx: TenantContext = createMockContext({ name: 'fake-plants', camelName: 'fakePlants' })
    seedBarrel(ctx)
    const { metaFile } = infraPaths(ctx)
    mkdirSync(dirname(metaFile), { recursive: true })
    const curated = "// curated by hand\nexport const fakePlantsMap = {}\n"
    writeFileSync(metaFile, curated)

    writeInfraMetadata(ctx)

    expect(readFileSync(metaFile, 'utf8')).toBe(curated)
    expect(readFileSync(infraPaths(ctx).barrel, 'utf8')).toContain(
      "export { fakePlantsMap } from './metadata/fake-plants'",
    )
  })

  it('none mode: writes nothing', () => {
    const ctx: TenantContext = createMockContext({ name: 'zen-plants', metadataMode: 'none' })
    seedBarrel(ctx)
    const before = readFileSync(infraPaths(ctx).barrel, 'utf8')

    writeInfraMetadata(ctx)

    expect(existsSync(infraPaths(ctx).metaFile)).toBe(false)
    expect(readFileSync(infraPaths(ctx).barrel, 'utf8')).toBe(before)
  })

  it('creates barrel when index.ts is missing', () => {
    const ctx: TenantContext = createMockContext({ name: 'zen-plants', camelName: 'zenPlants' })

    writeInfraMetadata(ctx)

    const { barrel } = infraPaths(ctx)
    expect(readFileSync(barrel, 'utf8')).toContain("export { zenPlantsMap } from './metadata/zen-plants'")
  })
})
