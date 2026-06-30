/* eslint-disable vue/one-component-per-file */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent } from 'vue'
import type { AppContext } from 'vue'
import { createWhiteLabelApp, META_MAP_INJECTION_KEY } from './app'
import type { ProductMeta } from '@repo/presenters'

vi.mock('@repo/infra/mocks/browser', () => ({
  worker: { start: vi.fn() },
}))

vi.mock('@repo/ui/fe-button', () => ({}))
vi.mock('@repo/ui/fe-icon', () => ({}))
vi.mock('@repo/ui/fe-card', () => ({}))

describe('createWhiteLabelApp — route merging', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('uses WL default routes when no routes/extendRoutes provided', async () => {
    const { router } = await createWhiteLabelApp({})
    const names = router.getRoutes().map((r) => r.name).filter(Boolean)
    expect(names).toContain('products')
    expect(names).toContain('components')
    expect(names).toHaveLength(2)
  })

  it('appends extendRoutes to WL defaults', async () => {
    const { router } = await createWhiteLabelApp({
      extendRoutes: [
        { path: '/about', name: 'about', component: defineComponent({}) },
      ],
    })
    const names = router.getRoutes().map((r) => r.name).filter(Boolean)
    expect(names).toContain('products')
    expect(names).toContain('components')
    expect(names).toContain('about')
    expect(names).toHaveLength(3)
  })

  it('routes option replaces WL defaults entirely (backwards compat)', async () => {
    const { router } = await createWhiteLabelApp({
      routes: [
        { path: '/custom', name: 'custom', component: defineComponent({}) },
      ],
    })
    const names = router.getRoutes().map((r) => r.name).filter(Boolean)
    expect(names).toEqual(['custom'])
    expect(names).not.toContain('products')
  })

  it('routes takes precedence over extendRoutes when both provided', async () => {
    const { router } = await createWhiteLabelApp({
      routes: [
        { path: '/only', name: 'only', component: defineComponent({}) },
      ],
      extendRoutes: [
        { path: '/ignored', name: 'ignored', component: defineComponent({}) },
      ],
    })
    const names = router.getRoutes().map((r) => r.name).filter(Boolean)
    expect(names).toEqual(['only'])
  })

  it('metaMap is injected when provided alongside extendRoutes', async () => {
    const testMeta: ProductMeta = {
      title: 'Test',
      description: 'Test desc',
      image: 'test',
      imageFamily: 'classic',
    }
    const { app } = await createWhiteLabelApp({
      extendRoutes: [],
      metaMap: { test: testMeta },
    })
    const provides = (app as unknown as { _context: AppContext })._context.provides
    expect(provides[META_MAP_INJECTION_KEY]).toEqual({ test: testMeta })
  })

  it('metaMap not provided when not set', async () => {
    const { app } = await createWhiteLabelApp({})
    const provides = (app as unknown as { _context: AppContext })._context.provides
    expect(provides[META_MAP_INJECTION_KEY]).toBeUndefined()
  })

  it('appShell override works with extendRoutes', async () => {
    const { app, router } = await createWhiteLabelApp({
      extendRoutes: [],
      appShell: () => Promise.resolve({ default: { template: '<div>Custom Shell</div>' } }),
    })
    expect(app).toBeDefined()
    expect(router).toBeDefined()
    // Mount and verify custom shell renders
    const el = document.createElement('div')
    app.mount(el)
    expect(el.innerHTML).toContain('Custom Shell')
    app.unmount()
  })

describe('createWhiteLabelApp — omitRoutePaths', () => {
  it('omitRoutePaths excludes matching routes from WL defaults', async () => {
    const { router } = await createWhiteLabelApp({
      omitRoutePaths: ['/components'],
    })
    const names = router.getRoutes().map((r) => r.name).filter(Boolean)
    expect(names).toContain('products')
    expect(names).not.toContain('components')
    expect(names).toHaveLength(1)
  })

  it('omitRoutePaths works with extendRoutes', async () => {
    const { router } = await createWhiteLabelApp({
      extendRoutes: [
        { path: '/about', name: 'about', component: defineComponent({}) },
      ],
      omitRoutePaths: ['/components'],
    })
    const names = router.getRoutes().map((r) => r.name).filter(Boolean)
    expect(names).toContain('products')
    expect(names).toContain('about')
    expect(names).not.toContain('components')
    expect(names).toHaveLength(2)
  })

  it('routes takes precedence, omitRoutePaths ignored', async () => {
    const { router } = await createWhiteLabelApp({
      routes: [
        { path: '/custom', name: 'custom', component: defineComponent({}) },
      ],
      omitRoutePaths: ['/components'],
    })
    const names = router.getRoutes().map((r) => r.name).filter(Boolean)
    expect(names).toEqual(['custom'])
    expect(names).not.toContain('components')
  })

  it('route without path not accidentally filtered', async () => {
    const { router } = await createWhiteLabelApp({
      omitRoutePaths: ['/components'],
      extendRoutes: [
        { path: undefined as unknown as string, name: 'nopath', component: defineComponent({}) },
      ],
    })
    const names = router.getRoutes().map((r) => r.name).filter(Boolean)
    expect(names).toContain('nopath')
  })
})
})
