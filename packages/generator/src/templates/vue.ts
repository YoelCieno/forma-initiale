import type { TenantContext } from '../models'
import { pascalToKebab } from '../helpers'
import { join } from 'node:path'
import { fileIo, REPO_ROOT } from '../helpers/file-io'

const { readFileData, readMirrorFiles } = fileIo()


const packageJson = (ctx: TenantContext): string => {
  const pkgJSON = readFileData<Record<string, unknown>>(join(REPO_ROOT, MIRROR_DIR, 'package.json'))
  return `${JSON.stringify({ ...pkgJSON, name: `${ctx.name}-vue` }, null, 2)}\n`
}

const viteConfig = (ctx: TenantContext) => {
  const componentDir = ctx.overrideComponent
    ? "  componentDirs: ['./src/components'],"
    : "  // componentDirs: ['./src/components'],  // uncomment when adding local components"

  return `import { defineWhiteLabelViteConfig } from 'white-label-vue/vite.config.base'

export default defineWhiteLabelViteConfig({
  devPort: ${ctx.devPort},
${componentDir}
})
`
}

const indexHtml = (ctx: TenantContext) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${ctx.Name} — Tenant</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`

const mainTs = (ctx: TenantContext) => {
  const metaImport =
    ctx.metadataMode === 'fixture'
      ? `import { ${ctx.camelName}Map } from '@repo/infra'\n`
      : ''
  const metaLine =
    ctx.metadataMode === 'fixture'
      ? `  metaMap: ${ctx.camelName}Map,`
      : '  // metaMap: myMap,'

  return `import '@repo/ui/styles/main.css'
import '@repo/ui/styles/themes/default.css'
import './styles'
import { createWhiteLabelApp } from 'white-label-vue/app'
${metaImport}
createWhiteLabelApp({
  extendRoutes: [
    // Add tenant-specific routes here:
    // {
    //   path: '/about',
    //   name: 'about',
    //   component: () => import('./pages/AboutPage.vue'),
    // },
  ],
  // omitRoutePaths: ['/components'],
  // For full route override (advanced), use \`routes\` instead:
  // routes: [...],
${metaLine}
}).then(({ app }) => {
  app.mount('#app')
})
`
}

/** Single source for .env / .env.example body — only the tenant id differs. */
const envFile = (tenantId: string): string => `# Tenant id header
VITE_TENANT_ID=${tenantId}
# API base URL (no trailing slash) — MSW intercepts in dev
VITE_API_URL=http://localhost:5174/api

# Enable MSW mock service worker in development
VITE_ENABLE_MOCKS=true
`

/** Static — copied verbatim, no interpolation. */
const envExample = envFile('your-tenant-id')

const env = (ctx: TenantContext): string => envFile(ctx.prefix)

const componentVue = (ctx: TenantContext) => {
  const name = ctx.overrideComponentName!
  const className = pascalToKebab(name)

  return `<script setup lang="ts">
// ${name} component — tenant-specific override
</script>

<template>
  <div class="c-${className}">
    <p>${name} component placeholder</p>
  </div>
</template>

<style scoped>
.c-${className} {
  /* Tenant-specific styles here */
}
</style>
`
}

/** Mirror SoT — (workspace-internal, always in-repo). */
const MIRROR_DIR = 'apps/mirror-tenant-vue'

/** Zero-arg SoT readers — apps/mirror-tenant-vue/* */
const {
  'tsconfig.json': tsconfigJson,
  'src/styles/index.ts': stylesIndex,
  '.eslintrc.cjs': eslintrc,
  'vitest.setup.ts': vitestSetup,
  'vitest.config.ts': vitestConfig,
  'src/main.spec.ts': mainSpec,
} = readMirrorFiles(
  [
    'tsconfig.json',
    'src/styles/index.ts',
    '.eslintrc.cjs',
    'vitest.setup.ts',
    'vitest.config.ts',
    'src/main.spec.ts',
  ],
  MIRROR_DIR,
)

export {
  packageJson,
  viteConfig,
  tsconfigJson,
  eslintrc,
  indexHtml,
  mainTs,
  componentVue,
  stylesIndex,
  vitestSetup,
  vitestConfig,
  mainSpec,
  env,
  envExample,
}
