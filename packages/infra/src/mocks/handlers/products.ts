import { http, HttpResponse, delay } from 'msw'
import type { Product } from '@repo/domain'
import {
  buildProduct,
  buildProductList,
  resetProductCounter,
} from '../factories/product'


const DEV_DELAY = 1000

export const productHandlers = [
  http.get('*/api/products', async ({ request }) => {
		await delay(DEV_DELAY)
    const tenantId = request.headers.get('x-tenant-id') || 'wl'
    resetProductCounter()
    const products = buildProductList(tenantId)
    return HttpResponse.json({ data: products, total: products.length })
  }),

  http.get('*/api/products/:id', async ({ params, request }) => {
    await delay(DEV_DELAY)
    const tenantId = request.headers.get('x-tenant-id') || 'wl'
    resetProductCounter()
    const products = buildProductList(tenantId)
    const { id } = params
    const product = products.find((p: Product) => p.id === id)

    if (!product) {
      return HttpResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: product })
  }),

  http.post('*/api/products', async ({ request }) => {
    await delay(DEV_DELAY)
    const tenantId = request.headers.get('x-tenant-id') || 'wl'
    const body = (await request.json()) as Partial<Product>
    const newProduct = buildProduct(tenantId, {
      name: body.name,
      previousPrice: body.previousPrice,
      price: body.price,
      rate: body.rate,
    })

    return HttpResponse.json({ data: newProduct }, { status: 201 })
  }),
]
