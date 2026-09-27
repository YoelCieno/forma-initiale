import { setupServer } from 'msw/node'
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  beforeEach,
} from 'vitest'
import type { Product } from '@repo/domain'
import { handlers } from './'
import { resetProductCounter } from '../factories/product'

const BASE_URL = 'http://localhost'
const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('products API handlers', () => {
  beforeEach(() => {
    resetProductCounter()
  })

  it('GET /api/wl/products returns a list of products', async () => {
    const res = await fetch(`${BASE_URL}/api/wl/products`, {
      headers: { 'x-tenant-id': 'wl' },
    })
    expect(res.status).toBe(200)

    const body = (await res.json()) as { data: Product[]; total: number }

    expect(body.data).toBeInstanceOf(Array)
    expect(body.data.length).toBeGreaterThan(0)
    expect(body.data[0]).toHaveProperty('id')
    expect(body.data[0]).toHaveProperty('name')
    expect(body.data[0]).toHaveProperty('previousPrice')
    expect(body.data[0]).toHaveProperty('price')
    expect(body.data[0]).toHaveProperty('rate')
    expect(body.total).toBe(body.data.length)
  })

  describe('tenant-aware products', () => {
    it('GET /api/wl/products returns price=0, previousPrice>0', async () => {
      const res = await fetch(`${BASE_URL}/api/wl/products`, {
        headers: { 'x-tenant-id': 'wl' },
      })
      expect(res.status).toBe(200)

      const body: { data: Product[] } = await res.json()
      for (const product of body.data) {
        expect(product.price).toBe(0)
        expect(product.previousPrice).toBeGreaterThan(0)
      }
    })

    it('GET /api/fp/products returns price>0, previousPrice=0', async () => {
      const res = await fetch(`${BASE_URL}/api/fp/products`, {
        headers: { 'x-tenant-id': 'fp' },
      })
      expect(res.status).toBe(200)

      const body: { data: Product[] } = await res.json()
      for (const product of body.data) {
        expect(product.price).toBeGreaterThan(0)
        expect(product.previousPrice).toBe(0)
      }
    })
  })
})
