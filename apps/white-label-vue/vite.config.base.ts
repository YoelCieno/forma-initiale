import { defineConfig, type UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const _dirname = dirname(fileURLToPath(import.meta.url))
const layerSrc = resolve(_dirname, 'src')

export interface WhiteLabelViteOptions {
  /** Tenant component directories — scanned BEFORE white-label defaults, so they win on name clash */
  componentDirs?: string[]
  /** Tenant auto-import directories (e.g., ['./src/composables']) */
  autoImportDirs?: string[]
}

/**
 * Creates a Vite UserConfig pre-configured with Vue plugin, AutoImport, and Components.
 * Tenant apps call this instead of duplicating the plugin setup.
 */
export function defineWhiteLabelViteConfig(
  opts: WhiteLabelViteOptions = {},
): UserConfig {
  return defineConfig({
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
        dirs: [
          ...(opts.autoImportDirs ?? []),
          resolve(layerSrc, 'composables'),
        ],
        dts: './src/auto-imports.d.ts',
      }),
      Components({
        dirs: [
          ...(opts.componentDirs ?? []),
          resolve(layerSrc, 'components'),
          resolve(layerSrc, 'pages'),
        ],
        dts: './src/components.d.ts',
      }),
    ],
  })
}
