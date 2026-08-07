import { delay } from 'msw'
import { DEV_DELAY } from './constants'

const mockOkResponse = (data: unknown) => {
  return { ok: true, json: () => Promise.resolve(data) }
}

const delayDev = async (): Promise<void> => {
  if (import.meta.env.MODE === 'test') return
  await delay(DEV_DELAY)
}

export { mockOkResponse, delayDev }
