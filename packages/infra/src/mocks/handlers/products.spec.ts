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

  it('GET /api/products returns a list of products', async () => {
    const res = await fetch(`${BASE_URL}/api/products`)
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

  it('GET /api/products/:id returns a single product with correct ID', async () => {
    const listRes = await fetch(`${BASE_URL}/api/products`)
    const listBody = (await listRes.json()) as { data: Product[] }
    const knownId = listBody.data[0].id

    const res = await fetch(`${BASE_URL}/api/products/${knownId}`)
    expect(res.status).toBe(200)

    const body = (await res.json()) as { data: Product }
    expect(body.data.id).toBe(knownId)
    expect(body.data).toHaveProperty('name')
    expect(body.data).toHaveProperty('previousPrice')
    expect(body.data).toHaveProperty('price')
    expect(body.data).toHaveProperty('rate')
  })

  it('GET /api/products/:id returns 404 for unknown ID', async () => {
    const res = await fetch(`${BASE_URL}/api/products/non-existent-id`)
    expect(res.status).toBe(404)

    const body = (await res.json()) as { error: string }
    expect(body).toHaveProperty('error')
  })

  it('POST /api/products creates and returns a new product', async () => {
    const newProduct = {
      name: 'Test Product',
      previousPrice: 49.99,
      price: 0,
      rate: 4,
    }

    const res = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    })

    expect(res.status).toBe(201)

    const body = (await res.json()) as { data: Product }
    expect(body.data.name).toBe('Test Product')
    expect(body.data.previousPrice).toBe(49.99)
    expect(body.data.price).toBe(0)
    expect(body.data.rate).toBe(4)
    expect(body.data).toHaveProperty('id')
    expect(body.data.id).toMatch(/^prod-\d+$/)
  })

  describe('tenant-aware products', () => {
    it('GET /api/products with x-tenant-id: wl returns price=0, previousPrice>0', async () => {
      const res = await fetch(`${BASE_URL}/api/products`, {
        headers: { 'x-tenant-id': 'wl' },
      })
      expect(res.status).toBe(200)

      const body = (await res.json()) as { data: Product[] }
      for (const product of body.data) {
        expect(product.price).toBe(0)
        expect(product.previousPrice).toBeGreaterThan(0)
      }
    })

    it('GET /api/products with x-tenant-id: fp returns price>0, previousPrice=0', async () => {
      const res = await fetch(`${BASE_URL}/api/products`, {
        headers: { 'x-tenant-id': 'fp' },
      })
      expect(res.status).toBe(200)

      const body = (await res.json()) as { data: Product[] }
      for (const product of body.data) {
        expect(product.price).toBeGreaterThan(0)
        expect(product.previousPrice).toBe(0)
      }
    })

    it('GET /api/products without header defaults to wl', async () => {
      const res = await fetch(`${BASE_URL}/api/products`)
      expect(res.status).toBe(200)

      const body = (await res.json()) as { data: Product[] }
      for (const product of body.data) {
        expect(product.price).toBe(0)
        expect(product.previousPrice).toBeGreaterThan(0)
      }
    })

    it('GET /api/products/:id with fp tenant returns fp-shaped product', async () => {
      const listRes = await fetch(`${BASE_URL}/api/products`, {
        headers: { 'x-tenant-id': 'fp' },
      })
      const listBody = (await listRes.json()) as { data: Product[] }
      const knownId = listBody.data[0].id

      const res = await fetch(`${BASE_URL}/api/products/${knownId}`, {
        headers: { 'x-tenant-id': 'fp' },
      })
      expect(res.status).toBe(200)

      const body = (await res.json()) as { data: Product }
      expect(body.data.price).toBeGreaterThan(0)
      expect(body.data.previousPrice).toBe(0)
    })

    it('404 with tenant header still works', async () => {
      const res = await fetch(`${BASE_URL}/api/products/non-existent-id`, {
        headers: { 'x-tenant-id': 'fp' },
      })
      expect(res.status).toBe(404)
    })

    it('POST respects x-tenant-id header', async () => {
      const newProduct = {
        name: 'FP Item',
        previousPrice: 0,
        price: 39.99,
        rate: 3,
      }

      const res = await fetch(`${BASE_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'fp',
        },
        body: JSON.stringify(newProduct),
      })

      expect(res.status).toBe(201)

      const body = (await res.json()) as { data: Product }
      // POST overrides with provided body, but check shape
      expect(body.data.price).toBe(39.99)
      expect(body.data.previousPrice).toBe(0)
    })
  })
})
