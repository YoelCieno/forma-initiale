import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { TenantContext } from '../models'

const outDir = (ctx: TenantContext): string => `apps/${ctx.name}-${ctx.framework}`

const getMissingScaffoldFiles = (ctx: TenantContext, files: string[]): string[] => {
  const base =  join(ctx.cwd, outDir(ctx))

  return files
    .map((file) => join(base, file))
    .filter((path) => !existsSync(path))
}

const getLog = (ctx: TenantContext, missingFiles: string[]) => {
  if (missingFiles.length === 0) {
		return ctx.pinion.logger.notice(`✅ Tenant '${ctx.name}-${ctx.framework}' created successfully`)
  }
  return ctx.pinion.logger.warn(`⚠️  ${missingFiles.length} file(s) missing — check generator output`)
}

export {
  getMissingScaffoldFiles,
  getLog,
  outDir,
}