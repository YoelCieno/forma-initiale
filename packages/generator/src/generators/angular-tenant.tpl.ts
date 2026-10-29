import {
  prompt,
  renderTemplate,
  toFile,
  when,
} from '@featherscloud/pinion'
import {
  caseTransform,
  findNextDevPort,
  pascalToKebab,
  infraMetadata,
  getLog,
  getMissingScaffoldFiles,
  outDir,
  inferFramework,
} from '../helpers'
import {
  packageJson,
  angularJson,
  tsconfigJson,
  tsconfigAppJson,
  tsconfigSpecJson,
  eslintrc,
  gitignore,
  indexHtml,
  mainTs,
  mainSpec,
  environmentTs,
  environmentDevTs,
  importMetaEnvDts,
  overrideComponent,
  genComponentOverridesScript,
} from '../templates/angular'
import { gitkeep, tokensCss } from '../templates/common'
import { TenantContext } from '../models'
import { tenantPrompts } from '../prompts'
import { serviceWorker } from '../msw/copy-service-worker'
import { join } from 'node:path'

const assignAngularPort = (ctx: TenantContext): TenantContext => {
  ctx.devPort = findNextDevPort(ctx.cwd, 'angular')
  return ctx
}

const assignFramework = (entryUrl: string) => (ctx: TenantContext): TenantContext => {
  ctx.framework = inferFramework(entryUrl)
  return ctx
}

export const renderSetup = (ctx: TenantContext): Promise<TenantContext> =>
  Promise.resolve(ctx)
    .then(renderTemplate(packageJson, toFile(outDir, 'package.json')))
    .then(renderTemplate(angularJson, toFile(outDir, 'angular.json')))
    .then(renderTemplate(tsconfigJson, toFile(outDir, 'tsconfig.json')))
    .then(renderTemplate(tsconfigAppJson, toFile(outDir, 'tsconfig.app.json')))
    .then(renderTemplate(tsconfigSpecJson, toFile(outDir, 'tsconfig.spec.json')))
    .then(renderTemplate(indexHtml, toFile(outDir, 'src', 'index.html')))
    .then(renderTemplate(eslintrc, toFile(outDir, '.eslintrc.cjs')))
    .then(renderTemplate(gitignore, toFile(outDir, '.gitignore')))
    .then(
      renderTemplate(genComponentOverridesScript, toFile(outDir, 'scripts', 'gen-component-overrides.ts')),
    )

export const renderSourceFiles = (ctx: TenantContext): Promise<TenantContext> =>
  Promise.resolve(ctx)
    .then(renderTemplate(mainTs, toFile(outDir, 'src', 'main.ts')))
    .then(renderTemplate(tokensCss, toFile(outDir, 'src', 'styles', 'tokens.css')))
    .then(
      renderTemplate(environmentTs, toFile(outDir, 'src', 'environments', 'environment.ts')),
    )
    .then(
      renderTemplate(
        environmentDevTs,
        toFile(outDir, 'src', 'environments', 'environment.development.ts'),
      ),
    )
    .then(renderTemplate(importMetaEnvDts, toFile(outDir, 'src', 'import-meta-env.d.ts')))
    .then(renderTemplate(mainSpec, toFile(outDir, 'src', 'main.spec.ts')))

export const renderConditionalAssets = (ctx: TenantContext): Promise<TenantContext> =>
  Promise.resolve(ctx).then(when(
    (c: TenantContext) => c.overrideComponent,
    renderTemplate(
      overrideComponent,
      toFile(outDir, 'src', 'components', (c) =>
        `${pascalToKebab(c.overrideComponentName ?? '')}.component.ts`),
    ),
  )).then(when(
    (c: TenantContext) => !c.overrideComponent,
    renderTemplate(gitkeep, toFile(outDir, 'src', 'components', '.gitkeep')),
  ))

const installDeps = async (ctx: TenantContext): Promise<TenantContext> => {
  const appDir = outDir(ctx)
  ctx.pinion.logger.notice(`Installing dependencies for ${appDir}...`)
  const exitCode = await ctx.pinion.exec('bun', ['install'], { cwd: join(ctx.cwd, appDir) })
  if (exitCode !== 0) {
    ctx.pinion.logger.warn(`bun install exited with code ${exitCode} — run manually later`)
  }

  return ctx
}

const verifyScaffold = (ctx: TenantContext): TenantContext => {
  const files = ['package.json', 'angular.json', 'src/main.ts', 'src/main.spec.ts', '.eslintrc.cjs']
  const missingFiles = getMissingScaffoldFiles(ctx, files)
  getLog(ctx, missingFiles)

  return ctx
}

export const generate = (ctx: TenantContext): Promise<TenantContext> =>
  Promise.resolve(ctx)
    .then(prompt<TenantContext>(tenantPrompts))
    .then(assignFramework(import.meta.url))
    .then(caseTransform<TenantContext>())
    .then(assignAngularPort)
    .then(renderSetup)
    .then(renderSourceFiles)
    .then(renderConditionalAssets)
    .then(infraMetadata().writeInfraMetadata)
    .then(serviceWorker().copyServiceWorker)
    .then(installDeps)
    .then(verifyScaffold)
