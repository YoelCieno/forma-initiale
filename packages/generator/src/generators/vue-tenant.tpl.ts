import { copyFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import {
  prompt,
  renderTemplate,
  toFile,
  when,
} from '@featherscloud/pinion'
import { caseTransform } from '../helpers/cases.js'
import {
  packageJson,
  viteConfig,
  tsconfigJson,
  indexHtml,
  mainTs,
  metadataTs,
  tokensCss,
  stylesIndex,
  componentVue,
  gitkeep,
  vitestSetup,
  env,
  envExample,
} from '../templates'
import { VueTenantContext } from '../models'
import { tenantPrompts } from '../prompts'
import { addTenantConfig } from '../msw/add-tenant.js'
import { readMockedData, writeMockedData, copyMswWorker } from '../msw/file-io'

const outDir = (ctx: VueTenantContext) => `apps/${ctx.name}-vue`

export const renderSetup = (ctx: VueTenantContext) =>
  Promise.resolve(ctx)
    .then(renderTemplate(packageJson, toFile(outDir, 'package.json')))
    .then(renderTemplate(viteConfig, toFile(outDir, 'vite.config.ts')))
    .then(renderTemplate(tsconfigJson, toFile(outDir, 'tsconfig.json')))
    .then(renderTemplate(indexHtml, toFile(outDir, 'index.html')))

export const renderSourceFiles = (ctx: VueTenantContext) =>
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

export const renderConditionalAssets = (ctx: VueTenantContext) =>
  Promise.resolve(ctx)
    .then(when(
      (c: VueTenantContext) => c.metadataMode === 'fixture',
      renderTemplate(metadataTs, toFile(outDir, 'metadata.ts')),
    ))
    .then(when(
      (c: VueTenantContext) => c.overrideComponent,
      renderTemplate(componentVue, toFile(outDir, 'src', 'components', (ctx) => `${ctx.overrideComponentName}.vue`)),
    ))
    .then(when(
      (c: VueTenantContext) => !c.overrideComponent,
      renderTemplate(gitkeep, toFile(outDir, 'src', 'components', '.gitkeep')),
    ))

export const renderTestInfra = (ctx: VueTenantContext) =>
  Promise.resolve(ctx)
    .then(renderTemplate(gitkeep, toFile(outDir, 'src', 'pages', '.gitkeep')))
    .then(renderTemplate(vitestSetup, toFile(outDir, 'vitest.setup.ts')))
    .then(renderTemplate(env, toFile(outDir, '.env')))
    .then(renderTemplate(envExample, toFile(outDir, '.env.example')))

function deriveMswNames(name: string): string[] {
  return [`${name}-alpha`, `${name}-beta`, `${name}-gamma`]
}

export const mswRegistration = (ctx: VueTenantContext): VueTenantContext => {
  if (!ctx.registerMsw) {
    ctx.pinion.logger.notice(`To register MSW data, run:
  bun packages/generator/src/msw/register-tenant.ts --prefix ${ctx.prefix}

Then copy mockServiceWorker.js (or use registerMsw: true during generation):
  cp apps/white-label-vue/public/mockServiceWorker.js apps/${ctx.name}-vue/public/`)
    return ctx
  }

  const configPath = join(ctx.cwd, 'packages/infra/src/mocks/data/mocked-data.json')
  const raw = readMockedData(configPath)
  const names = deriveMswNames(ctx.name)
  const updated = addTenantConfig(raw, ctx.prefix, names)
  writeMockedData(configPath, updated)

  // Copy MSW mockServiceWorker.js to the generated app
  const sourceWorker = join(ctx.cwd, 'apps/white-label-vue/public/mockServiceWorker.js')
  const targetWorker = join(ctx.cwd, `apps/${ctx.name}-vue/public/mockServiceWorker.js`)
  try {
    copyMswWorker(sourceWorker, targetWorker)
    ctx.pinion.logger.notice(`Copied mockServiceWorker.js to apps/${ctx.name}-vue/public/`)
  } catch (err) {
    if (err instanceof Error && err.message.includes('not found')) {
			ctx.pinion.logger.warn(`MSW worker not found: ${sourceWorker}`)
			return ctx
    }
    throw err
  }

  ctx.pinion.logger.notice(`Registered MSW config for prefix "${ctx.prefix}"`)
  return ctx
}

export const installDeps = async (ctx: VueTenantContext): Promise<VueTenantContext> => {
  const appDir = outDir(ctx)
  ctx.pinion.logger.notice(`Installing dependencies for ${appDir}...`)
  const exitCode = await ctx.pinion.exec('bun', ['install'], { cwd: join(ctx.cwd, appDir) })
  if (exitCode !== 0) {
    ctx.pinion.logger.warn(`bun install exited with code ${exitCode} — run manually later`)
  }
  return ctx
}

export const verifyScaffold = (ctx: VueTenantContext): VueTenantContext => {
  const base = join(ctx.cwd, outDir(ctx))
  const checks = [
    join(base, 'package.json'),
    join(base, 'vite.config.ts'),
    join(base, 'src/main.ts'),
    join(base, 'src/styles/tokens.css'),
    join(base, 'src/pages/.gitkeep'),
    join(base, 'vitest.setup.ts'),
  ]
  let missing = 0
  for (const file of checks) {
    if (!existsSync(file)) {
      ctx.pinion.logger.warn(`Missing expected file: ${file}`)
      missing++
    }
  }
  if (missing === 0) {
		ctx.pinion.logger.notice(`✅ Tenant "${ctx.name}-vue" created successfully`)
		return ctx;
  }
  ctx.pinion.logger.warn(`⚠️  ${missing} file(s) missing — check generator output`)
  return ctx
}

export const generate = (ctx: VueTenantContext) =>
  Promise.resolve(ctx)
    .then(prompt<VueTenantContext>(tenantPrompts))
    .then(caseTransform<VueTenantContext>())
    .then(renderSetup)
    .then(renderSourceFiles)
    .then(renderConditionalAssets)
    .then(renderTestInfra)
    .then(mswRegistration)
    .then(installDeps)
    .then(verifyScaffold)
