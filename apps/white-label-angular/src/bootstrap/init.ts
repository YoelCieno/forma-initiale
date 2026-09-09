import {
  InjectionToken,
  provideZonelessChangeDetection,
  type ApplicationConfig,
  type Provider,
  type Type,
} from '@angular/core'
import { provideHttpClient } from '@angular/common/http'
import { provideRouter, type Routes } from '@angular/router'
import type { ProductMeta } from '@repo/presenters'
import { environment } from '../environments/environment'

export const META_MAP_INJECTION_KEY = new InjectionToken<Record<string, ProductMeta>>(
  'META_MAP_INJECTION_KEY',
)

export interface WhiteLabelAppOptions {
  /** FULL route override — replaces WL defaults entirely */
  routes?: Routes
  /** Additional routes MERGED with WL defaults. Simpler for most tenants */
  extendRoutes?: Routes
  /** Route path patterns to exclude from the final route list */
  omitRoutePaths?: string[]
  /** Per-product metadata overrides keyed by product name */
  metaMap?: Record<string, ProductMeta>
}

export interface WhiteLabelApp {
  root: Type<unknown>
  config: ApplicationConfig
}

export function useWhiteLabelApp() {
  const setupMocks = async (): Promise<void> => {
    if (environment.enableMocks) {
      const { worker } = await import('@repo/infra/mocks/browser')
      await worker.start({ onUnhandledRequest: 'bypass' })
    }
  }

  const mergeRoutes = (wlRoutes: Routes, opts: WhiteLabelAppOptions): Routes => {
    if (opts.routes) {
      return opts.routes
    }

    const routes = [...wlRoutes, ...(opts.extendRoutes ?? [])]
    return routes.filter((r) => !(opts.omitRoutePaths ?? []).includes(r.path ?? ''))
  }

  const injectMetaMap = (metaMap?: Record<string, ProductMeta>): Provider[] => {
    if (!metaMap) {
      return []
    }
    return [{ provide: META_MAP_INJECTION_KEY, useValue: metaMap }]
  }

  const buildAppConfig = (
    routes: Routes,
    metaMap?: Record<string, ProductMeta>,
  ): ApplicationConfig => ({
    providers: [provideZonelessChangeDetection(), provideRouter(routes), provideHttpClient(), ...injectMetaMap(metaMap)],
  })

  return {
    setupMocks,
    mergeRoutes,
    buildAppConfig,
    injectMetaMap,
  }
}
