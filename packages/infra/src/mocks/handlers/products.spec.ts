import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import type { Product } from '@repo/domain'
import { handlers } from './index.js'

const BASE_URL = 'http://localhost'
const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('products API handlers', () => {
  it('GET /api/products returns a list of products', async () => {
    const res = await fetch(`${BASE_URL}/api/products`)
    expect(res.status).toBe(200)

    const body = (await res.json()) as { data: Product[]; total: number }

    expect(body.data).toBeInstanceOf(Array)
    expect(body.data.length).toBeGreaterThan(0)
    expect(body.data[0]).toHaveProperty('id')
    expect(body.data[0]).toHaveProperty('title')
    expect(body.data[0]).toHaveProperty('price')
    expect(body.total).toBe(body.data.length)
  })

  it('GET /api/products/:id returns a single product with correct ID', async () => {
    // First get a known product ID from the list
    const listRes = await fetch(`${BASE_URL}/api/products`)
    const listBody = (await listRes.json()) as { data: Product[] }
    const knownId = listBody.data[0].id

    const res = await fetch(`${BASE_URL}/api/products/${knownId}`)
    expect(res.status).toBe(200)

    const body = (await res.json()) as { data: Product }
    expect(body.data.id).toBe(knownId)
    expect(body.data).toHaveProperty('title')
    expect(body.data).toHaveProperty('price')
  })

  it('GET /api/products/:id returns 404 for unknown ID', async () => {
    const res = await fetch(`${BASE_URL}/api/products/non-existent-id`)
    expect(res.status).toBe(404)

    const body = (await res.json()) as { error: string }
    expect(body).toHaveProperty('error')
  })

  it('POST /api/products creates and returns a new product', async () => {
    const newProduct = { title: 'Test Product', price: 29.99 }

    const res = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    })

    expect(res.status).toBe(201)

    const body = (await res.json()) as { data: Product }
    expect(body.data.title).toBe('Test Product')
    expect(body.data.price).toBe(29.99)
    expect(body.data).toHaveProperty('id')
    expect(body.data.id).toMatch(/^prod-\d+$/)
  })
})
