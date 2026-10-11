import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { VueTenantContext } from '../models'
import { metadataTs } from '../templates'

/**
 * Writes fixture tenant metadata into packages/infra (single source of truth
 * since 2ca6d82) and ensures the barrel export line in packages/infra/src/index.ts.
 * Idempotent: existing metadata file is never overwritten (curated content wins);
 * barrel line is appended at most once.
 */
export function infraMetadata() {
  const metaFilePath = (ctx: VueTenantContext): string =>
    join(ctx.cwd, 'packages', 'infra', 'src', 'metadata', `${ctx.name}.ts`)

  const barrelPath = (ctx: VueTenantContext): string =>
    join(ctx.cwd, 'packages', 'infra', 'src', 'index.ts')

  const barrelLine = (ctx: VueTenantContext): string =>
    `export { ${ctx.camelName}Map } from './metadata/${ctx.name}'`

  const ensureBarrelExport = (ctx: VueTenantContext): void => {
    const barrel = barrelPath(ctx)
    const line = barrelLine(ctx)
    const current = existsSync(barrel) ? readFileSync(barrel, 'utf8') : ''
    if (current.includes(line)) {
      return
    }
    mkdirSync(dirname(barrel), { recursive: true })
    const next = current === '' ? `${line}\n` : `${current.replace(/\n?$/, '\n')}${line}\n`
    writeFileSync(barrel, next)
  }

  const writeInfraMetadata = (ctx: VueTenantContext): VueTenantContext => {
    if (ctx.metadataMode !== 'fixture') {
      return ctx
    }
    const metaFile = metaFilePath(ctx)
    if (!existsSync(metaFile)) {
      mkdirSync(dirname(metaFile), { recursive: true })
      writeFileSync(metaFile, metadataTs(ctx))
    }
    ensureBarrelExport(ctx)
    ctx.pinion.logger.notice(`Metadata wired in packages/infra/src/metadata/${ctx.name}.ts`)
    return ctx
  }

  return { writeInfraMetadata }
}
