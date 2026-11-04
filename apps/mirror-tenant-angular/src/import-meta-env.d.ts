// Ambient typing for `import.meta.env` — required by @repo/infra mocks helpers
// (`packages/infra/src/mocks/helpers.ts` reads `import.meta.env.MODE`).
// Vite is not a dependency of this app, so vite/client types are not available.
interface ImportMeta {
  env: {
    MODE?: string
    DEV?: boolean
    PROD?: boolean
    [key: string]: string | boolean | undefined
  }
}
