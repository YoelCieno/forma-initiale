/* eslint-disable vue/one-component-per-file */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent, createApp } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

// RED phase: these imports fail until init.ts exists — that's the point
import { useWhiteLabelApp, META_MAP_INJECTION_KEY } from './init'

// ── Module-level mocks ──────────────────────────────────────────

// Controlled routes for createWlRouter to consume via dynamic import
vi.mock('../routes', () => ({
  routes: [
    {
      path: '/',
      name: 'home',
      component: defineComponent({ template: '<div>Home</div>' }),
    },
    {
      path: '/about',
      name: 'about',
      component: defineComponent({ template: '<div>About</div>' }),
    },
  ],
}))

// Known default shell for resolveAppShell default path
vi.mock('../App.vue', () => ({
  default: { name: 'DefaultApp', template: '<div>Default Shell</div>' },
}))

// Spy on worker.start for setupMocks assertions
const mockWorkerStart = vi.fn()
vi.mock('@repo/infra/mocks/browser', () => ({
  worker: { start: mockWorkerStart },
}))

// ══════════════════════════════════════════════════════════════════
// mergeRoutes — pure sync, no mocking needed
// ══════════════════════════════════════════════════════════════════
describe('useWhiteLabelApp — mergeRoutes', () => {
  const wlRoutes: RouteRecordRaw[] = [
    { path: '/', name: 'home', component: defineComponent({ template: '' }) },
    {
      path: '/products',
      name: 'products',
      component: defineComponent({ template: '' }),
    },
  ]
  const extra = {
    path: '/extra',
    name: 'extra',
    component: defineComponent({ template: '' }),
  }

  it('merges wlRoutes with extendRoutes', () => {
    const { mergeRoutes } = useWhiteLabelApp()
    const result = mergeRoutes(wlRoutes, { extendRoutes: [extra] })
    expect(result).toHaveLength(3)
    expect(result.map((r) => r.name)).toEqual(['home', 'products', 'extra'])
  })

  it('uses wlRoutes only when no extendRoutes/routes provided', () => {
    const { mergeRoutes } = useWhiteLabelApp()
    const result = mergeRoutes(wlRoutes, {})
    expect(result).toHaveLength(2)
    expect(result.map((r) => r.name)).toEqual(['home', 'products'])
  })

  it('routes replaces wlRoutes and extendRoutes', () => {
    const { mergeRoutes } = useWhiteLabelApp()
    const result = mergeRoutes(wlRoutes, {
      routes: [extra],
      extendRoutes: [
        {
          path: '/ignored',
          name: 'ignored',
          component: defineComponent({ template: '' }),
        },
      ],
    })
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('extra')
  })

  it('omitRoutePaths filters matching paths from wlRoutes', () => {
    const { mergeRoutes } = useWhiteLabelApp()
    const result = mergeRoutes(wlRoutes, { omitRoutePaths: ['/products'] })
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('home')
  })

  it('omitRoutePaths also filters matching paths from extendRoutes', () => {
    const { mergeRoutes } = useWhiteLabelApp()
    const result = mergeRoutes(wlRoutes, {
      extendRoutes: [extra],
      omitRoutePaths: ['/products', '/extra'],
    })
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('home')
  })

  it('routes takes precedence — omitRoutePaths ignored when routes set', () => {
    const { mergeRoutes } = useWhiteLabelApp()
    const result = mergeRoutes(wlRoutes, {
      routes: [
        {
          path: '/override',
          name: 'override',
          component: defineComponent({ template: '' }),
        },
      ],
      omitRoutePaths: ['/override'],
    })
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('override')
  })

  it('non-omitted path in extendRoutes survives omitRoutePaths filter', () => {
    const { mergeRoutes } = useWhiteLabelApp()
    const result = mergeRoutes(wlRoutes, {
      extendRoutes: [
        {
          path: '/nopath',
          name: 'nopath',
          component: defineComponent({ template: '' }),
        },
      ],
      omitRoutePaths: ['/products'],
    })
    expect(result).toHaveLength(2)
    expect(result.map((r) => r.name)).toContain('nopath')
  })
})

// ══════════════════════════════════════════════════════════════════
// setupMocks — env-dependent, needs import.meta.env mutation
// ══════════════════════════════════════════════════════════════════
describe('useWhiteLabelApp — setupMocks', () => {
  beforeEach(() => {
    mockWorkerStart.mockClear()
  })

  it('does not start worker when DEV is false', async () => {
    const prevDev = import.meta.env.DEV
    const prevMocks = import.meta.env.VITE_ENABLE_MOCKS
    try {
      import.meta.env.DEV = false
      // @ts-expect-error VITE_ENABLE_MOCKS is readonly per Vite types
      import.meta.env.VITE_ENABLE_MOCKS = 'true'

      const { setupMocks } = useWhiteLabelApp()
      await setupMocks()

      expect(mockWorkerStart).not.toHaveBeenCalled()
    } finally {
      import.meta.env.DEV = prevDev
      // @ts-expect-error VITE_ENABLE_MOCKS is readonly per Vite types
      import.meta.env.VITE_ENABLE_MOCKS = prevMocks
    }
  })

  it('does not start worker when VITE_ENABLE_MOCKS is not true', async () => {
    // DEV defaults to true in Vitest; VITE_ENABLE_MOCKS is undefined by default
    const { setupMocks } = useWhiteLabelApp()
    await setupMocks()

    expect(mockWorkerStart).not.toHaveBeenCalled()
  })

  it('starts worker with { onUnhandledRequest: "bypass" } when DEV and VITE_ENABLE_MOCKS both truthy', async () => {
    const prevMocks = import.meta.env.VITE_ENABLE_MOCKS
    try {
      // @ts-expect-error VITE_ENABLE_MOCKS is readonly per Vite types
      import.meta.env.VITE_ENABLE_MOCKS = 'true'

      const { setupMocks } = useWhiteLabelApp()
      await setupMocks()

      expect(mockWorkerStart).toHaveBeenCalledTimes(1)
      expect(mockWorkerStart).toHaveBeenCalledWith({
        onUnhandledRequest: 'bypass',
      })
    } finally {
      // @ts-expect-error VITE_ENABLE_MOCKS is readonly per Vite types
      import.meta.env.VITE_ENABLE_MOCKS = prevMocks
    }
  })
})

// ══════════════════════════════════════════════════════════════════
// resolveAppShell — needs mocked dynamic imports
// ══════════════════════════════════════════════════════════════════
describe('useWhiteLabelApp — resolveAppShell', () => {
  it('returns default App.vue component when no appShell option', async () => {
    const { resolveAppShell } = useWhiteLabelApp()
    const shell = await resolveAppShell({})
    expect(shell).toBeDefined()
    // ../App.vue is mocked to export { default: { name: 'DefaultApp' } }
    expect(shell).toHaveProperty('name', 'DefaultApp')
  })

  it('returns custom component when appShell option provided', async () => {
    const { resolveAppShell } = useWhiteLabelApp()
    const custom = defineComponent({ template: '<div>Custom</div>' })
    const shell = await resolveAppShell({
      appShell: () => Promise.resolve({ default: custom }),
    })
    expect(shell).toBe(custom)
  })
})

// ══════════════════════════════════════════════════════════════════
// injectMetaMap
// ══════════════════════════════════════════════════════════════════
describe('useWhiteLabelApp — injectMetaMap', () => {
  it('calls app.provide with META_MAP_INJECTION_KEY when metaMap set', () => {
    const app = createApp(defineComponent({ template: '<div></div>' }))
    const provideSpy = vi.spyOn(app, 'provide')
    const meta = {
      test: {
        title: 'T',
        description: 'D',
        image: 'I',
        imageFamily: 'classic',
      },
    }
    const { injectMetaMap } = useWhiteLabelApp()
    injectMetaMap(app, meta)
    expect(provideSpy).toHaveBeenCalledWith(META_MAP_INJECTION_KEY, meta)
  })

  it('does nothing when metaMap is undefined', () => {
    const app = createApp(defineComponent({ template: '<div></div>' }))
    const provideSpy = vi.spyOn(app, 'provide')
    const { injectMetaMap } = useWhiteLabelApp()
    injectMetaMap(app, undefined)
    expect(provideSpy).not.toHaveBeenCalled()
  })
})

// ══════════════════════════════════════════════════════════════════
// createWlRouter — integration-level, needs mocked ../routes
// ══════════════════════════════════════════════════════════════════
describe('useWhiteLabelApp — createWlRouter', () => {
  it('creates a router with merged routes using mocked wlRoutes', async () => {
    const { createWlRouter } = useWhiteLabelApp()
    const router = await createWlRouter({
      extendRoutes: [
        {
          path: '/custom',
          name: 'custom',
          component: defineComponent({ template: '' }),
        },
      ],
    })
    const names = router
      .getRoutes()
      .map((r) => r.name)
      .filter(Boolean)
    expect(names).toContain('home')
    expect(names).toContain('about')
    expect(names).toContain('custom')
  })

  it('routes option takes precedence in createWlRouter', async () => {
    const { createWlRouter } = useWhiteLabelApp()
    const router = await createWlRouter({
      routes: [
        {
          path: '/only',
          name: 'only',
          component: defineComponent({ template: '' }),
        },
      ],
    })
    const names = router
      .getRoutes()
      .map((r) => r.name)
      .filter(Boolean)
    expect(names).toEqual(['only'])
  })

  it('omitRoutePaths is applied to merged result', async () => {
    const { createWlRouter } = useWhiteLabelApp()
    const router = await createWlRouter({ omitRoutePaths: ['/about'] })
    const names = router
      .getRoutes()
      .map((r) => r.name)
      .filter(Boolean)
    expect(names).toContain('home')
    expect(names).not.toContain('about')
  })

  it('router uses hash history', async () => {
    const { createWlRouter } = useWhiteLabelApp()
    const router = await createWlRouter({})
    // Hash history prepends #/ to resolved paths
    const resolved = router.resolve('/test')
    expect(resolved.href).toMatch(/^#\//)
  })
})
