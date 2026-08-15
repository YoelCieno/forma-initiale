import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { addTenantConfig } from './add-tenant'
import { readMockedData, writeMockedData, copyMswWorker } from './file-io'
import type { VueTenantContext } from '../models'

const getProductNames = (name: string): string[] => {
  return [`${name}-alpha`, `${name}-beta`, `${name}-gamma`]
}

const noticeManualRegistration = (ctx: VueTenantContext): VueTenantContext => {
  ctx.pinion.logger.notice(`To register MSW data, run:
  bun packages/generator/src/msw/register-tenant.ts --prefix ${ctx.prefix}

Then copy mockServiceWorker.js (or use registerMsw: true during generation):
  cp apps/white-label-vue/public/mockServiceWorker.js apps/${ctx.name}-vue/public/`)
  return ctx
}


const copyServiceWorker = (ctx: VueTenantContext): VueTenantContext => {
  if (!ctx.registerMsw) {
     return noticeManualRegistration(ctx)
  }

  const configPath = join(ctx.cwd, 'packages/infra/src/mocks/data/mocked-data.json')
  const updated = addTenantConfig(readMockedData(configPath), ctx.prefix, getProductNames(ctx.name))
  writeMockedData(configPath, updated)

  const source = join(ctx.cwd, 'apps/white-label-vue/public/mockServiceWorker.js')
  const target = join(ctx.cwd, `apps/${ctx.name}-vue/public/mockServiceWorker.js`)

  if (!existsSync(source)) {
    throw new Error(`MSW worker not found: ${source}`)
	}
	if (source === target) {
  	throw new Error(`source: ${source} cannot be copied to the same target: ${target}`)
  }

  copyMswWorker(source, target)

	ctx.pinion.logger.notice(`Copied mockServiceWorker.js to apps/${ctx.name}-vue/public/`)
	ctx.pinion.logger.notice(`Registered MSW config for prefix "${ctx.prefix}"`)

  return ctx
}


export {
  getProductNames, copyServiceWorker
}
