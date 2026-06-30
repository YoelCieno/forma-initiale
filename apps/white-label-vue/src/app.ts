import { createApp, type Component } from 'vue'
import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from 'vue-router'
import type { ProductMeta } from '@repo/presenters'

export const META_MAP_INJECTION_KEY = 'metaMap'

export interface WhiteLabelAppOptions {
  /** FULL route override — replaces WL defaults entirely */
  routes?: RouteRecordRaw[]
  /** Additional routes MERGED with WL defaults. Simpler for most tenants */
  extendRoutes?: RouteRecordRaw[]
  /** Route path patterns to exclude from the final route list */
  omitRoutePaths?: string[]
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

  const wlRoutes = (await import('./routes')).routes
  const mergedRoutes = opts.routes
    ?? [...wlRoutes, ...(opts.extendRoutes ?? [])]
        .filter(r => !(opts.omitRoutePaths ?? []).includes(r.path ?? ''))

  const router = createRouter({
    history: createWebHashHistory(),
    routes: mergedRoutes,
	})

  const app = createApp(AppShell)
  app.use(router)

  if (opts.metaMap) {
    app.provide(META_MAP_INJECTION_KEY, opts.metaMap)
  }

  return { app, router }
}
