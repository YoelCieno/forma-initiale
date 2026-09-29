import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import type { Routes } from '@angular/router'
import type { ProductMeta } from '@repo/presenters'

// RED phase: these imports fail until init.ts exists — that's the point
import { useWhiteLabelApp, META_MAP_INJECTION_KEY, APP_ENV } from './init'
import { App } from '../app/app'

// environment module created by coder (Phase 4.2 impl); gate toggled below
import { environment } from '../environments/environment'

// ── Module-level mocks ──────────────────────────────────────────
const mockWorkerStart = vi.fn()
vi.mock('@repo/infra/mocks/browser', () => ({
  worker: { start: mockWorkerStart },
}))

// ── Route fixtures ──────────────────────────────────────────────
// Angular convention: root path is '' (no leading slashes — the Router rejects
// paths starting with '/', NG04014). Filter semantics still match vue's
// mergeRoutes (string match of r.path against omitRoutePaths).
class HomeCmp {}
class ProductsCmp {}
class ExtraCmp {}
class OverrideCmp {}
class AboutCmp {}
class TenantShellCmp {}

// ══════════════════════════════════════════════════════════════════
// mergeRoutes — pure sync, no mocking needed
// ══════════════════════════════════════════════════════════════════
describe('useWhiteLabelApp — mergeRoutes', () => {
  const wlRoutes: Routes = [
    { path: '', component: HomeCmp },
    { path: 'products', component: ProductsCmp },
  ]
  const extra = { path: 'extra', component: ExtraCmp }

  it('merges wlRoutes with extendRoutes', () => {
    const { mergeRoutes } = useWhiteLabelApp()
    const result = mergeRoutes(wlRoutes, { extendRoutes: [extra] })
    expect(result).toHaveLength(3)
    expect(result.map((r) => r.path)).toEqual(['', 'products', 'extra'])
  })

  it('uses wlRoutes only when no extendRoutes/routes provided', () => {
    const { mergeRoutes } = useWhiteLabelApp()
    const result = mergeRoutes(wlRoutes, {})
    expect(result).toHaveLength(2)
    expect(result.map((r) => r.path)).toEqual(['', 'products'])
  })

  it('routes replaces wlRoutes and extendRoutes', () => {
    const { mergeRoutes } = useWhiteLabelApp()
    const result = mergeRoutes(wlRoutes, {
      routes: [extra],
      extendRoutes: [
        {
          path: 'ignored',
          component: OverrideCmp,
        },
      ],
    })
    expect(result).toHaveLength(1)
    expect(result[0].path).toBe('extra')
  })

  it('omitRoutePaths filters matching paths from wlRoutes', () => {
    const { mergeRoutes } = useWhiteLabelApp()
    const result = mergeRoutes(wlRoutes, { omitRoutePaths: ['products'] })
    expect(result).toHaveLength(1)
    expect(result[0].path).toBe('')
  })

  it('omitRoutePaths also filters matching paths from extendRoutes', () => {
    const { mergeRoutes } = useWhiteLabelApp()
    const result = mergeRoutes(wlRoutes, {
      extendRoutes: [extra],
      omitRoutePaths: ['products', 'extra'],
    })
    expect(result).toHaveLength(1)
    expect(result[0].path).toBe('')
  })

  it('routes takes precedence — omitRoutePaths ignored when routes set', () => {
    const { mergeRoutes } = useWhiteLabelApp()
    const result = mergeRoutes(wlRoutes, {
      routes: [
        {
          path: 'override',
          component: OverrideCmp,
        },
      ],
      omitRoutePaths: ['override'],
    })
    expect(result).toHaveLength(1)
    expect(result[0].path).toBe('override')
  })

  it('non-omitted path in extendRoutes survives omitRoutePaths filter', () => {
    const { mergeRoutes } = useWhiteLabelApp()
    const result = mergeRoutes(wlRoutes, {
      extendRoutes: [
        {
          path: 'nopath',
          component: ExtraCmp,
        },
      ],
      omitRoutePaths: ['products'],
    })
    expect(result).toHaveLength(2)
    expect(result.map((r) => r.path)).toContain('nopath')
  })
})

// ══════════════════════════════════════════════════════════════════
// setupMocks — env-dependent, environment.enableMocks gate
// ══════════════════════════════════════════════════════════════════
describe('useWhiteLabelApp — setupMocks', () => {
  beforeEach(() => {
    environment.enableMocks = false
    mockWorkerStart.mockClear()
  })

  it('does not start worker when enableMocks is false', async () => {
    const { setupMocks } = useWhiteLabelApp()
    await setupMocks()

    expect(mockWorkerStart).not.toHaveBeenCalled()
  })

  it('starts worker with { onUnhandledRequest: "bypass" } when enableMocks is true', async () => {
    environment.enableMocks = true

    const { setupMocks } = useWhiteLabelApp()
    await setupMocks()

    expect(mockWorkerStart).toHaveBeenCalledTimes(1)
    expect(mockWorkerStart).toHaveBeenCalledWith({
      onUnhandledRequest: 'bypass',
    })
  })

  it('starts worker from passed env even when shell environment has mocks off', async () => {
    environment.enableMocks = false

    const { setupMocks } = useWhiteLabelApp()
    await setupMocks({
      apiUrl: 'https://api.example.com/api',
      tenantId: 'fp',
      enableMocks: true,
    })

    expect(mockWorkerStart).toHaveBeenCalledTimes(1)
  })

  it('does not start worker when passed env has mocks off despite shell environment on', async () => {
    environment.enableMocks = true

    const { setupMocks } = useWhiteLabelApp()
    await setupMocks({
      apiUrl: 'https://api.example.com/api',
      tenantId: 'fp',
      enableMocks: false,
    })

    expect(mockWorkerStart).not.toHaveBeenCalled()
  })
})

// ══════════════════════════════════════════════════════════════════
// buildAppConfig — merged routes + optional metaMap provider
// ══════════════════════════════════════════════════════════════════
describe('useWhiteLabelApp — buildAppConfig', () => {
  it('returns ApplicationConfig routing the merged routes', () => {
    const { buildAppConfig } = useWhiteLabelApp()
    const merged: Routes = [
      { path: '', component: HomeCmp },
      { path: 'extra', component: ExtraCmp },
    ]

    const config = buildAppConfig(merged)
    expect(config.providers).toHaveLength(4)

    TestBed.configureTestingModule({ providers: config.providers })
    const router = TestBed.inject(Router)
    expect(router.config.map((r) => r.path)).toEqual(['', 'extra'])
  })

  it('adds metaMap provider when metaMap provided', () => {
    const { buildAppConfig } = useWhiteLabelApp()
    const meta: Record<string, ProductMeta> = {
      test: {
        title: 'T',
        description: 'D',
        image: 'I',
        imageFamily: 'classic',
      },
    }

    const config = buildAppConfig([], { metaMap: meta })
    expect(config.providers).toHaveLength(5)

    TestBed.configureTestingModule({ providers: config.providers })
    expect(TestBed.inject(META_MAP_INJECTION_KEY)).toEqual(meta)
  })
})

// ══════════════════════════════════════════════════════════════════
// injectMetaMap — provider builder
// ══════════════════════════════════════════════════════════════════
describe('useWhiteLabelApp — injectMetaMap', () => {
  it('returns META_MAP_INJECTION_KEY provider when metaMap set', () => {
    const { injectMetaMap } = useWhiteLabelApp()
    const meta: Record<string, ProductMeta> = {
      test: {
        title: 'T',
        description: 'D',
        image: 'I',
        imageFamily: 'classic',
      },
    }

    const providers = injectMetaMap(meta)
    expect(providers).toHaveLength(1)
    expect(providers[0]).toEqual({
      provide: META_MAP_INJECTION_KEY,
      useValue: meta,
    })
  })

  it('returns empty array when metaMap is undefined', () => {
    const { injectMetaMap } = useWhiteLabelApp()
    expect(injectMetaMap(undefined)).toEqual([])
  })
})

// ══════════════════════════════════════════════════════════════════
// resolveAppShell — tenant override w/ static App default
// ══════════════════════════════════════════════════════════════════
describe('useWhiteLabelApp — resolveAppShell', () => {
  it('returns shell App component when no appShell option', async () => {
    const { resolveAppShell } = useWhiteLabelApp()
    const shell = await resolveAppShell({})
    expect(shell).toBe(App)
  })

  it('returns tenant component when appShell option provided', async () => {
    const { resolveAppShell } = useWhiteLabelApp()
    const shell = await resolveAppShell({
      appShell: () => Promise.resolve(TenantShellCmp),
    })
    expect(shell).toBe(TenantShellCmp)
  })

  it('resolves appShell independently of routes/metaMap options', async () => {
    const { resolveAppShell } = useWhiteLabelApp()
    const shell = await resolveAppShell({
      appShell: () => Promise.resolve(TenantShellCmp),
      extendRoutes: [{ path: 'about', component: AboutCmp }],
      omitRoutePaths: ['products'],
      metaMap: {},
    })
    expect(shell).toBe(TenantShellCmp)
  })
})

// ══════════════════════════════════════════════════════════════════
// APP_ENV provider — env option, shell environment default
// ══════════════════════════════════════════════════════════════════
describe('useWhiteLabelApp — buildAppConfig APP_ENV', () => {
  it('provides APP_ENV with the passed env', () => {
    const { buildAppConfig } = useWhiteLabelApp()
    const env = {
      apiUrl: 'https://api.example.com/api',
      tenantId: 'fp',
      enableMocks: true,
    }

    const config = buildAppConfig([], { env })
    TestBed.configureTestingModule({ providers: config.providers })
    expect(TestBed.inject(APP_ENV)).toEqual(env)
  })

  it('falls back to shell environment defaults when env omitted', () => {
    const { buildAppConfig } = useWhiteLabelApp()
    const config = buildAppConfig([])
    TestBed.configureTestingModule({ providers: config.providers })
    expect(TestBed.inject(APP_ENV)).toEqual(environment)
  })
})
