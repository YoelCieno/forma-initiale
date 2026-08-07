import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

// Spy on msw's `delay` so we can assert handlers do NOT apply the dev delay
// when running under vitest (import.meta.env.MODE === 'test').
vi.mock('msw', async (importOriginal) => {
  const actual = await importOriginal<typeof import('msw')>()
  return {
    ...actual,
    delay: vi.fn(async () => {}),
  }
})

import { setupServer } from 'msw/node'
import { delay } from 'msw'
import type { Product } from '@repo/domain'
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
  it('does NOT invoke msw delay for GET /api/products in test mode', async () => {
    const res = await fetch(`${BASE_URL}/api/products`)
    expect(res.status).toBe(200)
    await res.json()

    expect(delaySpy).not.toHaveBeenCalled()
  })

  it('does NOT invoke msw delay for GET /api/products/:id in test mode', async () => {
    const listRes = await fetch(`${BASE_URL}/api/products`)
    const listBody = (await listRes.json()) as { data: Product[] }
    const knownId = listBody.data[0].id

    const res = await fetch(`${BASE_URL}/api/products/${knownId}`)
    expect(res.status).toBe(200)
    await res.json()

    expect(delaySpy).not.toHaveBeenCalled()
  })

  it('does NOT invoke msw delay for POST /api/products in test mode', async () => {
    const res = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'No Delay', price: 5, rate: 3 }),
    })
    expect(res.status).toBe(201)
    await res.json()

    expect(delaySpy).not.toHaveBeenCalled()
  })
})
