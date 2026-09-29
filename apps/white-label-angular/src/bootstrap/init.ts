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
import { App } from '../app/app'

export const META_MAP_INJECTION_KEY = new InjectionToken<Record<string, ProductMeta>>(
  'META_MAP_INJECTION_KEY',
)

/** Runtime env config injected into app services (API base URL, tenant, mocks gate) */
export interface AppEnv {
  apiUrl: string
  tenantId: string
  enableMocks: boolean
}

export const APP_ENV = new InjectionToken<AppEnv>('APP_ENV')

export interface WhiteLabelAppOptions {
  /** FULL route override — replaces WL defaults entirely */
  routes?: Routes
  /** Additional routes MERGED with WL defaults. Simpler for most tenants */
  extendRoutes?: Routes
  /** Route path patterns to exclude from the final route list */
  omitRoutePaths?: string[]
  /** Per-product metadata overrides keyed by product name */
  metaMap?: Record<string, ProductMeta>
  /** Optional override for the root App component (tenant-owned shell) */
  appShell?: () => Promise<Type<unknown>>
  /** Runtime env config; defaults to shell environment when omitted */
  env?: AppEnv
}

export interface WhiteLabelApp {
  root: Type<unknown>
  config: ApplicationConfig
}

export function useWhiteLabelApp() {
  const setupMocks = async (env?: AppEnv): Promise<void> => {
    if ((env ?? environment).enableMocks) {
      const { worker } = await import('@repo/infra/mocks/browser')
      await worker.start({ onUnhandledRequest: 'bypass' })
    }
  }

  const resolveAppShell = async (opts: WhiteLabelAppOptions): Promise<Type<unknown>> => {
    if (opts.appShell) {
      return opts.appShell()
    }

    return App
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

  const buildAppConfig = (routes: Routes, opts?: WhiteLabelAppOptions): ApplicationConfig => ({
    providers: [
      provideZonelessChangeDetection(),
      provideRouter(routes),
      provideHttpClient(),
      { provide: APP_ENV, useValue: opts?.env ?? environment },
      ...injectMetaMap(opts?.metaMap),
    ],
  })

  return {
    setupMocks,
    resolveAppShell,
    mergeRoutes,
    buildAppConfig,
    injectMetaMap,
  }
}
