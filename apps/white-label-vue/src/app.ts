import { createApp, type Component } from 'vue'
import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from 'vue-router'
import type { ProductMeta } from '@repo/presenters'

export const META_MAP_INJECTION_KEY = 'metaMap'

export interface WhiteLabelAppOptions {
  /** Route definitions (tenant + white-label merged) */
  routes: RouteRecordRaw[]
  /** Optional override for the root App.vue shell */
  appShell?: () => Promise<{ default: Component }>
  /** Per-product metadata overrides keyed by product name */
  metaMap?: Record<string, ProductMeta>
}

export interface WhiteLabelApp {
  app: ReturnType<typeof createApp>
  router: ReturnType<typeof createRouter>
}

/**
 * Creates a Vue app with hash-router, MSW bootstrap (dev + VITE_ENABLE_MOCKS),
 * and optional App.vue override.
 */
export async function createWhiteLabelApp(
  opts: WhiteLabelAppOptions,
): Promise<WhiteLabelApp> {
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCKS === 'true') {
    const { worker } = await import('@repo/infra/mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }

  const AppShell = opts.appShell
    ? (await opts.appShell()).default
    : (await import('./App.vue')).default

  const router = createRouter({
    history: createWebHashHistory(),
    routes: opts.routes,
  })

  const app = createApp(AppShell)
  app.use(router)

  if (opts.metaMap) {
    app.provide(META_MAP_INJECTION_KEY, opts.metaMap)
  }

  return { app, router }
}
