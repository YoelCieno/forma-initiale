import {
  prompt,
  renderTemplate,
  toFile,
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
  appSpec,
  env,
  envExample,
} from '../templates'
import { VueTenantContext } from '../models'
import { tenantPrompts } from '../prompts'

const outDir = (ctx: VueTenantContext) => `apps/${ctx.name}-vue`

export const generate = (ctx: VueTenantContext) => {
  return Promise.resolve(ctx)
    .then(prompt<VueTenantContext>(tenantPrompts))
    .then(caseTransform<VueTenantContext>())
    .then(renderTemplate(packageJson, toFile(outDir, 'package.json')))
    .then(renderTemplate(viteConfig, toFile(outDir, 'vite.config.ts')))
    .then(renderTemplate(tsconfigJson, toFile(outDir, 'tsconfig.json')))
    .then(renderTemplate(indexHtml, toFile(outDir, 'index.html')))
    .then(renderTemplate(mainTs, toFile(outDir, 'src', 'main.ts')))
    .then((ctx: VueTenantContext) => {
      if (ctx.metadataMode === 'fixture') {
      return renderTemplate(metadataTs, toFile(outDir, 'metadata.ts'))(ctx)
      }
      return ctx
    })
    .then(
      renderTemplate(tokensCss, toFile(outDir, 'src', 'styles', 'tokens.css')),
    )
    .then(
      renderTemplate(stylesIndex, toFile(outDir, 'src', 'styles', 'index.ts')),
    )
    .then((ctx: VueTenantContext) => {
      if (ctx.overrideComponent) {
      const name = ctx.overrideComponentName!
        return renderTemplate(
          componentVue,
          toFile(outDir, 'src', 'components', `${name}.vue`),
        )(ctx)
      }
      return ctx
    })
    .then((ctx: VueTenantContext) => {
      if (ctx.overrideComponent) {
      return ctx
      }
      return renderTemplate(
        gitkeep,
        toFile(outDir, 'src', 'components', '.gitkeep'),
      )(ctx)
    })
    .then(renderTemplate(gitkeep, toFile(outDir, 'src', 'pages', '.gitkeep')))
    .then(renderTemplate(vitestSetup, toFile(outDir, 'vitest.setup.ts')))
    .then(renderTemplate(appSpec, toFile(outDir, 'src', 'App.spec.ts')))
    .then(renderTemplate(env, toFile(outDir, '.env')))
    .then(renderTemplate(envExample, toFile(outDir, '.env.example')))
}
