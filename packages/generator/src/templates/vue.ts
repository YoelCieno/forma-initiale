import type { TenantContext } from '../models'
import { pascalToKebab } from '../helpers'

const packageJson = (ctx: TenantContext) => {
  // readFileData
  return `{
  "name": "${ctx.name}-vue",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vp dev",
    "build": "vp build",
    "preview": "vp preview",
    "lint": "eslint \\"src/**/*.{ts,vue}\\"",
    "test": "vp test"
  },
  "dependencies": {
    "white-label-vue": "workspace:*",
    "@repo/infra": "*",
    "@repo/presenters": "*",
    "@repo/ui": "*",
    "vue": "^3.5.34",
    "vue-router": "^4.6.4"
  },
  "devDependencies": {
    "@repo/eslint-config": "*",
    "@repo/typescript-config": "*",
    "@vitejs/plugin-vue": "^5.2.4",
    "@vue/test-utils": "^2.4.10",
    "eslint": "^8.57.1",
    "jsdom": "^29.1.1",
    "unplugin-auto-import": "^19.3.0",
    "unplugin-vue-components": "^28.8.0",
    "vite": "^0.1.24",
    "typescript": "5.9.3"
  }
}
`
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

/** Static — copied verbatim, no interpolation. */
const tsconfigJson: string = `{
  "extends": "@repo/typescript-config/vite.json",
  "include": ["src", "vite.config.ts", "vitest.config.ts", "vitest.setup.ts"],
  "compilerOptions": {
    "strictNullChecks": true
  }
}
`

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

/** Static — copied verbatim, no interpolation. */
const stylesIndex: string = `import './tokens.css'
`

/** Static — copied verbatim, no interpolation. */
const eslintrc: string = `/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@repo/eslint-config/vue.js"],
  rules: {
    // WA custom elements (fe-*) use native slot attr (not Vue virtual slots)
    "vue/no-deprecated-slot-attribute": "off",
    // fe-* elements are web components — explicit closing tags needed for Vite template compat
    "vue/html-self-closing": ["warn", {
      html: {
        void: "never",
        normal: "always",
        component: "always",
      },
      svg: "always",
      math: "always",
    }],
    // Allow inline attributes on custom elements
    "vue/max-attributes-per-line": "off",
    "vue/singleline-html-element-content-newline": "off",
  },
};
`

/** Static — copied verbatim, no interpolation. */
const vitestSetup: string = `import { vi } from 'vitest'
import { config } from '@vue/test-utils'

config.global.config.compilerOptions = {
  isCustomElement: (tag: string) => tag.startsWith('fe-'),
}

vi.mock('@repo/ui/fe-card', () => {
  return {}
})

vi.mock('@repo/ui/fe-rating', () => {
  return {}
})
`

/** Static — copied verbatim, no interpolation. */
const vitestConfig: string = `import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag: string) => tag.startsWith('fe-'),
        },
      },
    }),
    AutoImport({
      imports: ['vue', 'vue-router'],
      dts: './src/auto-imports.d.ts',
    }),
    Components({
      dirs: ['./src/components', './src/pages'],
      dts: './src/components.d.ts',
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.spec.ts'],
    env: {
      VITE_ENABLE_MOCKS: '',
    },
  },
})
`

/** Static — copied verbatim, no interpolation. */
const mainSpec: string = `import { describe, it, expect } from 'vitest'
import { createWhiteLabelApp } from 'white-label-vue/app'

describe('main', () => {
  it('creates app with createWhiteLabelApp', async () => {
    const { app } = await createWhiteLabelApp({
      extendRoutes: [],
    })
    expect(app).toBeDefined()
    app.unmount()
  })
})
`

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
