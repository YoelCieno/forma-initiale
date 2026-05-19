import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue'],
      dirs: ['./src/composables'],
      dts: './src/auto-imports.d.ts',
    }),
    Components({
      dirs: ['./src/components'],
      dts: './src/components.d.ts',
    }),
  ],
})
