import type { Component, App } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
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

export function useWhiteLabelApp() {
  const setupMocks = async (): Promise<void> => {
    if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCKS === 'true') {
      const { worker } = await import('@repo/infra/mocks/browser')
      await worker.start({ onUnhandledRequest: 'bypass' })
    }
  }

  const resolveAppShell = async (opts: WhiteLabelAppOptions): Promise<Component> => {
    if (opts.appShell) {
      return (await opts.appShell()).default
    }

    return (await import('../App.vue')).default
  }

  const mergeRoutes = (wlRoutes: RouteRecordRaw[], opts: WhiteLabelAppOptions): RouteRecordRaw[] => {
    if (opts.routes) {
      return opts.routes
    }

    const routes = [...wlRoutes, ...(opts.extendRoutes ?? [])]
    return routes.filter((r) => !(opts.omitRoutePaths ?? []).includes(r.path ?? ''))
  }

  const createWlRouter = async (
    opts: WhiteLabelAppOptions,
  ): Promise<ReturnType<typeof createRouter>> => {
    const { routes: wlRoutes } = await import('../routes')
    const mergedRoutes = mergeRoutes(wlRoutes, opts)
    return createRouter({
      history: createWebHashHistory(),
      routes: mergedRoutes,
    })
  }

  const injectMetaMap = (app: App<Element>, metaMap?: Record<string, ProductMeta>): void => {
    if (metaMap) {
      app.provide(META_MAP_INJECTION_KEY, metaMap)
    }
  }

  return {
    setupMocks,
    resolveAppShell,
    mergeRoutes,
    createWlRouter,
    injectMetaMap,
  }
}
