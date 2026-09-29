import { createWhiteLabelApp } from 'white-label-angular/app'
import { FpApp } from './app/app.component'

describe('createWhiteLabelApp (tenant scaffold)', () => {
  it('returns shell root and config with zero overrides', async () => {
    const { root, config } = await createWhiteLabelApp({})
    expect(root).toBeTruthy()
    expect(config).toBeTruthy()
  })

  it('resolves tenant root component when appShell provided', async () => {
    const { root } = await createWhiteLabelApp({
      appShell: () => Promise.resolve(FpApp),
    })
    expect(root).toBe(FpApp)
  })

  it('provides router providers from shell defaults', async () => {
    const { config } = await createWhiteLabelApp({})
    expect(config.providers?.length).toBeGreaterThan(0)
  })
})
