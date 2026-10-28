import { describe, it, expect } from 'vitest'
import { createWhiteLabelApp } from 'white-label-vue/app'

describe('main', () => {
  it('creates app with createWhiteLabelApp', async () => {
    const { app } = await createWhiteLabelApp({
      extendRoutes: [],
    })
    expect(app).toBeDefined()
    app.unmount()
  })
})
