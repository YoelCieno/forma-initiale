import type { VueTenantContext } from '../models'
import { pascalToKebab } from '../helpers/cases'
import { formatThemeTokens, getThemeTokens } from '../helpers/palette'

const packageJson = (ctx: VueTenantContext) => `{
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

const viteConfig = (ctx: VueTenantContext) => {
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const tsconfigJson = (_ctx: VueTenantContext) => `{
  "extends": "@repo/typescript-config/vite.json",
  "include": ["src", "vite.config.ts", "vitest.config.ts", "vitest.setup.ts"],
  "compilerOptions": {
    "strictNullChecks": true
  }
}
`

const indexHtml = (ctx: VueTenantContext) => `<!DOCTYPE html>
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

const mainTs = (ctx: VueTenantContext) => {
  const metaImport =
    ctx.metadataMode === 'fixture'
      ? `import { ${ctx.camelName}Map } from '../metadata'\n`
      : ''
  const metaLine =
    ctx.metadataMode === 'fixture'
      ? `  metaMap: ${ctx.camelName}Map,`
      : '  // metaMap: myMap,'

  return `import '@repo/ui/styles'
import '@repo/ui/styles/themes/default'
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

const metadataTs = (ctx: VueTenantContext) => {
  const parts = ctx.name.split('-')
  const base = parts.slice(0, -1).join('-')
  const prefix = base ? `${base}-` : ''

  return `import type { ProductMeta } from '@repo/presenters'

export const ${ctx.camelName}Map: Record<string, ProductMeta> = {
  '${prefix}alpha': {
    title: 'Alpha Primum',
    description: 'The first of its kind, a pioneering specimen',
    image: 'plant',
    imageFamily: 'classic',
  },
  '${prefix}beta': {
    title: 'Beta Secundus',
    description: 'Follows the pattern with distinct characteristics',
    image: 'plant',
    imageFamily: 'classic',
  },
  '${prefix}gamma': {
    title: 'Gamma Tertius',
    description: 'Completes the triad with unique properties',
    image: 'plant',
    imageFamily: 'classic',
  },
}
`
}

const tokensCss = (ctx: VueTenantContext) => {
  // Custom gets inline brand override
  if (ctx.theme === 'custom') {
    return `/* ${ctx.Name} custom brand override */
:where(:root) {
  --brand-fill-normal: ${ctx.brandHex ?? '#16a34a'};

  /* WA cascade derives all other brand tokens from this one variable */
}
`
  }

  // Preset themes get inline token blocks
  const themeTokens = getThemeTokens(ctx.theme)
  if (Object.keys(themeTokens).length > 0) {
    return `/* ${ctx.Name} — ${ctx.theme} theme */
:where(:root) {
${formatThemeTokens(themeTokens)}
}`
  }

  // Fallback
  return `/* ${ctx.Name} — default theme */
:where(:root) {
  // --brand-fill-normal: #4f46e5;
}`
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const stylesIndex = (_ctx: VueTenantContext) => `import './tokens.css'
`
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const eslintrc = (_ctx: VueTenantContext) => `/** @type {import("eslint").Linter.Config} */
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const gitkeep = (_ctx: VueTenantContext) => ''

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const vitestSetup = (_ctx: VueTenantContext) => `import { vi } from 'vitest'
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const vitestConfig = (_ctx: VueTenantContext) => `import { defineConfig } from 'vitest/config'
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mainSpec = (_ctx: VueTenantContext) => `import { describe, it, expect } from 'vitest'
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

const env = (ctx: VueTenantContext) => `# Tenant id header
VITE_TENANT_ID=${ctx.prefix}
# API base URL (no trailing slash) — MSW intercepts in dev
VITE_API_URL=http://localhost:5174/api

# Enable MSW mock service worker in development
VITE_ENABLE_MOCKS=true
`

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const envExample = (_ctx: VueTenantContext) => `# Tenant id header
VITE_TENANT_ID=your-tenant-id
# API base URL (no trailing slash) — MSW intercepts in dev
VITE_API_URL=http://localhost:5174/api

# Enable MSW mock service worker in development
VITE_ENABLE_MOCKS=true
`

const componentVue = (ctx: VueTenantContext) => {
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
  gitkeep,
  indexHtml,
  mainTs,
  componentVue,
  stylesIndex,
  tokensCss,
  metadataTs,
  vitestSetup,
  vitestConfig,
  mainSpec,
  env,
  envExample,
}
