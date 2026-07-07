import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs'
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
  bun scripts/register-msw-tenant.ts --prefix ${ctx.prefix} --public-dir apps/${ctx.name}-vue/public`)
    return ctx
  }

  const configPath = join(ctx.cwd, 'packages/infra/src/mocks/data/mocked-data.json')
  const raw = JSON.parse(readFileSync(configPath, 'utf-8'))
  const names = deriveMswNames(ctx.name)
  const updated = addTenantConfig(raw, ctx.prefix, names)
  writeFileSync(configPath, JSON.stringify(updated, null, 2) + '\n')

  // Copy MSW mockServiceWorker.js to the generated app
  const sourceWorker = join(ctx.cwd, 'apps/white-label-vue/public/mockServiceWorker.js')
  const targetDir = join(ctx.cwd, `apps/${ctx.name}-vue/public`)
  const targetWorker = join(targetDir, 'mockServiceWorker.js')
  if (existsSync(sourceWorker) && sourceWorker !== targetWorker) {
    if (!existsSync(targetDir)) mkdirSync(targetDir, { recursive: true })
    copyFileSync(sourceWorker, targetWorker)
    ctx.pinion.logger.notice(`Copied mockServiceWorker.js to apps/${ctx.name}-vue/public/`)
  }

  ctx.pinion.logger.notice(`Registered MSW config for prefix "${ctx.prefix}"`)
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
