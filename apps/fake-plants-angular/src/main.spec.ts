import { createWhiteLabelApp } from 'white-label-angular/app'

describe('createWhiteLabelApp (tenant scaffold)', () => {
  it('returns shell root and config with zero overrides', async () => {
    const { root, config } = await createWhiteLabelApp({})
    expect(root).toBeTruthy()
    expect(config).toBeTruthy()
  })

  it('provides router providers from shell defaults', async () => {
    const { config } = await createWhiteLabelApp({})
    expect(config.providers?.length).toBeGreaterThan(0)
  })
})
