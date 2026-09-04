import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

vi.mock('msw', async (importOriginal) => {
  const actual = await importOriginal<typeof import('msw')>()
  return {
    ...actual,
    delay: vi.fn(async () => {}),
  }
})

import { setupServer } from 'msw/node'
import { delay } from 'msw'
import { productHandlers } from './products'

const BASE_URL = 'http://localhost'
const server = setupServer(...productHandlers)

const delaySpy = delay as unknown as ReturnType<typeof vi.fn>

beforeAll(() => server.listen())
afterEach(() => {
  delaySpy.mockClear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('product handlers test-mode gating', () => {
  it('does NOT invoke msw delay for GET /api/wl/products in test mode', async () => {
    const res = await fetch(`${BASE_URL}/api/wl/products`, {
      headers: { 'x-tenant-id': 'wl' },
    })
    expect(res.status).toBe(200)
    await res.json()

    expect(delaySpy).not.toHaveBeenCalled()
  })
})
