import { http, HttpResponse } from 'msw'
import {
  buildProductList,
  resetProductCounter,
} from '../factories/product'
import { delayDev, isValidTenant } from '../helpers'
import type { TenantId } from '../models'

const resolveTenant = (request: Request): TenantId => {
  const rawHeader = request.headers.get('x-tenant-id')
  if (rawHeader && isValidTenant(rawHeader)) return rawHeader

  throw new Error(`ERROR: [INFRA] Invalid tenant => ${rawHeader}`)
}

export const productHandlers = [
  http.get('*/api/:tenant/products', async ({ request }) => {
    await delayDev()
    resetProductCounter()
    const tenantId = resolveTenant(request)
    const products = buildProductList(tenantId)
    return HttpResponse.json({ data: products, total: products.length })
  }),
]
