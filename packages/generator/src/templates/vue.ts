import type { TenantContext } from '../models'
import { pascalToKebab } from '../helpers'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileData } from '../msw/file-io'

/** Repo-root mirror SoT — design decision 8 (workspace-internal, always in-repo). */
const MIRROR_DIR = fileURLToPath(
  new URL('../../../../apps/mirror-tenant-vue', import.meta.url),
)
const readMirror = (rel: string): string => readFileSync(join(MIRROR_DIR, rel), 'utf8')

const packageJson = (ctx: TenantContext): string => {
  const pkg = readFileData<Record<string, unknown>>(join(MIRROR_DIR, 'package.json'))
  return `${JSON.stringify({ ...pkg, name: `${ctx.name}-vue` }, null, 2)}\n`
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

/** Zero-arg SoT reader — apps/mirror-tenant-vue/tsconfig.json (design decision 8). */
const tsconfigJson = (): string => readMirror('tsconfig.json')

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

/** Zero-arg SoT reader — apps/mirror-tenant-vue/src/styles/index.ts (design decision 8). */
const stylesIndex = (): string => readMirror('src/styles/index.ts')

/** Zero-arg SoT reader — apps/mirror-tenant-vue/.eslintrc.cjs (design decision 8). */
const eslintrc = (): string => readMirror('.eslintrc.cjs')

/** Zero-arg SoT reader — apps/mirror-tenant-vue/vitest.setup.ts (design decision 8). */
const vitestSetup = (): string => readMirror('vitest.setup.ts')

/** Zero-arg SoT reader — apps/mirror-tenant-vue/vitest.config.ts (design decision 8). */
const vitestConfig = (): string => readMirror('vitest.config.ts')

/** Zero-arg SoT reader — apps/mirror-tenant-vue/src/main.spec.ts (design decision 8). */
const mainSpec = (): string => readMirror('src/main.spec.ts')

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
