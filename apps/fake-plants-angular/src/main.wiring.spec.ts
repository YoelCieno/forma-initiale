import { describe, it, expect, vi, beforeEach } from 'vitest'
import { plantsMap } from '@repo/infra'
import { environment } from './environments/environment'

const { createWhiteLabelAppMock, setupMocksMock, bootstrapMock } = vi.hoisted(() => ({
  createWhiteLabelAppMock: vi.fn(),
  setupMocksMock: vi.fn(),
  bootstrapMock: vi.fn(),
}))

vi.mock('white-label-angular/app', () => ({
  createWhiteLabelApp: createWhiteLabelAppMock,
  useWhiteLabelApp: () => ({ setupMocks: setupMocksMock }),
}))
vi.mock('@angular/platform-browser', () => ({
  bootstrapApplication: bootstrapMock,
}))

describe('tenant main bootstrap wiring', () => {
  beforeEach(() => {
    vi.resetModules()
    createWhiteLabelAppMock.mockReset().mockResolvedValue({ root: 'ROOT', config: 'CONFIG' })
    setupMocksMock.mockReset().mockResolvedValue(undefined)
    bootstrapMock.mockReset().mockResolvedValue(undefined)
  })

  it('passes tenant env and plantsMap to the factory', async () => {
    await import('./main')

    expect(environment.tenantId).toBe('fp')
    expect(createWhiteLabelAppMock).toHaveBeenCalledTimes(1)
    expect(createWhiteLabelAppMock).toHaveBeenCalledWith(
      expect.objectContaining({
        env: environment,
        metaMap: plantsMap,
      }),
    )
  })

  it('starts MSW mocks with tenant env before the factory call', async () => {
    await import('./main')

    expect(setupMocksMock).toHaveBeenCalledTimes(1)
    expect(setupMocksMock).toHaveBeenCalledWith(environment)
    expect(setupMocksMock.mock.invocationCallOrder[0]).toBeLessThan(
      createWhiteLabelAppMock.mock.invocationCallOrder[0],
    )
  })
})

describe('tenant componentOverrides wiring', () => {
  beforeEach(() => {
    vi.resetModules()
    createWhiteLabelAppMock.mockReset().mockResolvedValue({ root: 'ROOT', config: 'CONFIG' })
    setupMocksMock.mockReset().mockResolvedValue(undefined)
    bootstrapMock.mockReset().mockResolvedValue(undefined)
  })

  it('registers FpProductCard under the product-card key', async () => {
    const { FpProductCard } = await import('./components/fp-product-card.component')

    await import('./main')

    expect(createWhiteLabelAppMock).toHaveBeenCalledWith(
      expect.objectContaining({
        componentOverrides: { 'product-card': FpProductCard },
      }),
    )
  })
})
