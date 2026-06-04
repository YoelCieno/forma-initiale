import { http, HttpResponse } from 'msw'
import type { Product } from '@repo/domain'
import { buildProduct, buildProductList, resetProductCounter } from '../factories/product.js'

resetProductCounter()
let products = buildProductList(5)

export const productHandlers = [
  http.get('*/api/products', () => {
    return HttpResponse.json({ data: products, total: products.length })
  }),

  http.get('*/api/products/:id', ({ params }) => {
    const { id } = params
    const product = products.find((p: Product) => p.id === id)

    if (!product) {
      return HttpResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: product })
  }),

  http.post('*/api/products', async ({ request }: { request: Request }) => {
    const body: Partial<Product> = await request.json()
    const newProduct = buildProduct({ name: body.name, previousPrice: body.previousPrice, price: body.price, rate: body.rate })
    products = [ ...products, newProduct]

    return HttpResponse.json({ data: newProduct }, { status: 201 })
  }),
]
