import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { TenantContext } from '../models'
import { REPO_ROOT } from './file-io'

const outDir = (ctx: TenantContext): string => `apps/${ctx.name}-${ctx.framework}`

/** Mirror SoT carries the favicon — copy it into the scaffolded tenant's public/. */
const faviconFile = (framework: TenantContext['framework']): string =>
  framework === 'angular' ? 'favicon.ico' : 'vite.svg'

const copyFavicon = (ctx: TenantContext): TenantContext => {
  const file = faviconFile(ctx.framework)
  const source = join(REPO_ROOT, `apps/mirror-tenant-${ctx.framework}/public/${file}`)
  const targetDir = join(ctx.cwd, outDir(ctx), 'public')
  if (!existsSync(source)) {
    throw new Error(`Favicon not found: ${source}`)
  }
  mkdirSync(targetDir, { recursive: true })
  copyFileSync(source, join(targetDir, file))
  return ctx
}

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
  copyFavicon,
  getMissingScaffoldFiles,
  getLog,
  outDir,
}