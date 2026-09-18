import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { VueTenantContext } from '../models'

const outDir = (ctx: VueTenantContext): string => `apps/${ctx.name}-vue`

const getMissingScaffoldFiles = (ctx: VueTenantContext): string[] => {
  const base =  join(ctx.cwd, outDir(ctx))
  const checks = [
    join(base, 'package.json'),
    join(base, 'vite.config.ts'),
    join(base, 'src/main.ts'),
    join(base, 'src/styles/tokens.css'),
    join(base, 'src/pages/.gitkeep'),
    join(base, 'vitest.setup.ts'),
    join(base, '.eslintrc.cjs')
  ]
  return checks.filter((file) => !existsSync(file))
}

const getLog = (ctx: VueTenantContext, missingFiles: string[]) => {
  if (missingFiles.length < 0) {
		return ctx.pinion.logger.notice(`✅ Tenant '${ctx.name}-vue' created successfully`)
  }
  return ctx.pinion.logger.warn(`⚠️  ${missingFiles} file(s) missing — check generator output`)
}

export {
  getMissingScaffoldFiles,
  getLog,
  outDir,
}