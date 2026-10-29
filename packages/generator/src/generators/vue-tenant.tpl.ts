import { copyFileSync } from 'node:fs'
import {
  prompt,
  renderTemplate,
  toFile,
  when,
} from '@featherscloud/pinion'
import {
  caseTransform,
  findNextDevPort,
  infraMetadata,
  getLog,
  getMissingScaffoldFiles,
  outDir,
  inferFramework,
} from '../helpers'
import {
  packageJson,
  viteConfig,
  tsconfigJson,
  eslintrc,
  indexHtml,
  mainTs,
  stylesIndex,
  componentVue,
  vitestSetup,
  vitestConfig,
  mainSpec,
  env,
  envExample,
} from '../templates/vue'
import { gitkeep, tokensCss } from '../templates/common'
import { TenantContext } from '../models'
import { tenantPrompts } from '../prompts'
import { serviceWorker } from '../msw/copy-service-worker'
import { join } from 'node:path'

const assignDevPort = (ctx: TenantContext): TenantContext => {
  ctx.devPort = findNextDevPort(ctx.cwd, 'vue')
  return ctx
}

const assignFramework = (entryUrl: string) => (ctx: TenantContext): TenantContext => {
  ctx.framework = inferFramework(entryUrl)
  return ctx
}

export const renderSetup = (ctx: TenantContext): Promise<TenantContext> =>
  Promise.resolve(ctx)
    .then(renderTemplate(packageJson, toFile(outDir, 'package.json')))
    .then(renderTemplate(viteConfig, toFile(outDir, 'vite.config.ts')))
    .then(renderTemplate(tsconfigJson, toFile(outDir, 'tsconfig.json')))
    .then(renderTemplate(indexHtml, toFile(outDir, 'index.html')))
    .then(renderTemplate(eslintrc, toFile(outDir, '.eslintrc.cjs')))

export const renderSourceFiles = (ctx: TenantContext):  Promise<TenantContext> =>
  Promise.resolve(ctx)
    .then(renderTemplate(mainTs, toFile(outDir, 'src', 'main.ts')))
    .then(renderTemplate(tokensCss, toFile(outDir, 'src', 'styles', 'tokens.css')))
    .then(renderTemplate(stylesIndex, toFile(outDir, 'src', 'styles', 'index.ts')))
    .then((c) => {
      // Copy vite-env.d.ts from white-label-vue
      const sourcePath = join(c.cwd, 'apps/white-label-vue/src/vite-env.d.ts')
      const targetPath = join(c.cwd, outDir(c), 'src', 'vite-env.d.ts')
      copyFileSync(sourcePath, targetPath)
      return c
    })

export const renderConditionalAssets = (ctx: TenantContext): Promise<TenantContext> =>
  Promise.resolve(ctx).then(when(
    (c: TenantContext) => c.overrideComponent,
    renderTemplate(componentVue, toFile(outDir, 'src', 'components', (ctx) => `${ctx.overrideComponentName}.vue`)),
  )).then(when(
    (c: TenantContext) => !c.overrideComponent,
    renderTemplate(gitkeep, toFile(outDir, 'src', 'components', '.gitkeep')),
  ))

export const renderTestInfra = (ctx: TenantContext): Promise<TenantContext> =>
  Promise.resolve(ctx)
    .then(renderTemplate(gitkeep, toFile(outDir, 'src', 'pages', '.gitkeep')))
    .then(renderTemplate(vitestSetup, toFile(outDir, 'vitest.setup.ts')))
    .then(renderTemplate(vitestConfig, toFile(outDir, 'vitest.config.ts')))
    .then(renderTemplate(mainSpec, toFile(outDir, 'src', 'main.spec.ts')))
    .then(renderTemplate(env, toFile(outDir, '.env')))
    .then(renderTemplate(envExample, toFile(outDir, '.env.example')))

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
  const files = ['package.json', 'vite.config.ts', 'src/main.ts', 'vitest.setup.ts', '.eslintrc.cjs']
  const missingFiles = getMissingScaffoldFiles(ctx, files)
  getLog(ctx, missingFiles)

  return ctx
}

export const generate = (ctx: TenantContext): Promise<TenantContext> =>
  Promise.resolve(ctx)
    .then(prompt<TenantContext>(tenantPrompts))
    .then(assignFramework(import.meta.url))
    .then(caseTransform<TenantContext>())
    .then(assignDevPort)
    .then(renderSetup)
    .then(renderSourceFiles)
    .then(renderConditionalAssets)
    .then(renderTestInfra)
    .then(infraMetadata().writeInfraMetadata)
    .then(serviceWorker().copyServiceWorker)
    .then(installDeps)
    .then(verifyScaffold)
