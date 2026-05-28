/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_ENABLE_MOCKS: string
}

// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../packages/ui/node_modules/@awesome.me/webawesome/dist/types/vue/index.d.ts" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}
