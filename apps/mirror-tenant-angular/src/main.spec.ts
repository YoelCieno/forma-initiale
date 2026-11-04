import { describe, expect, it } from 'vitest'
import { createWhiteLabelApp } from 'white-label-angular/app'

describe('createWhiteLabelApp (tenant scaffold)', () => {
  it('returns shell root and config', async () => {
    const { root, config } = await createWhiteLabelApp({})
    expect(root).toBeTruthy()
    expect(config).toBeTruthy()
  })
})
