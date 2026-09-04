import { delay } from 'msw'
import { DEV_DELAY, PRODUCT_TENANT_CONFIGS } from './constants'
import type { TenantId } from './models'

const isValidTenant = (value: string): value is TenantId => value in PRODUCT_TENANT_CONFIGS

const mockOkResponse = (data: unknown) => {
  return { ok: true, json: () => Promise.resolve(data) }
}

const delayDev = async (): Promise<void> => {
  if (import.meta.env.MODE === 'test') return
  await delay(DEV_DELAY)
}

export { isValidTenant, mockOkResponse, delayDev }
