import { describe, it, expect } from 'vitest'
import { createWhiteLabelApp } from 'white-label-vue/app'
import App from './App.vue'

describe('createWhiteLabelApp (tenant scaffold)', () => {
  it('creates app and router with zero overrides', async () => {
    const { app, router } = await createWhiteLabelApp({})
    expect(app).toBeDefined()
    expect(router).toBeDefined()
  })

  it('resolves tenant app shell when appShell provided', async () => {
    const { app } = await createWhiteLabelApp({
      appShell: () => Promise.resolve({ default: App }),
    })
    expect(app).toBeDefined()
    app.unmount()
  })

  it('exposes router with at least one route from shell defaults', async () => {
    const { router } = await createWhiteLabelApp({})
    expect(router.getRoutes().length).toBeGreaterThan(0)
  })
})
