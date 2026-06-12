import { defineConfig } from 'vite'
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
      dirs: ['./src/composables'],
      dts: './src/auto-imports.d.ts',
    }),
    Components({
      dirs: ['./src/components', './src/pages'],
      dts: './src/components.d.ts',
    }),
  ],
})
