import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { addTenantConfig } from './add-tenant'
import { readMockedData, writeMockedData, copyMswWorker } from './file-io'
import type { VueTenantContext } from '../models'

export type Framework = 'vue' | 'angular'

const getProductNames = (name: string): string[] => {
  return [`${name}-alpha`, `${name}-beta`, `${name}-gamma`]
}

const frameworkPaths = (ctx: VueTenantContext, framework: Framework) => ({
  source: join(ctx.cwd, `apps/white-label-${framework}/public/mockServiceWorker.js`),
  target: join(ctx.cwd, `apps/${ctx.name}-${framework}/public/mockServiceWorker.js`),
  targetNotice: `apps/${ctx.name}-${framework}/public/`,
})

const noticeManualRegistration = (
  ctx: VueTenantContext,
  framework: Framework,
): VueTenantContext => {
  const { source, targetNotice } = frameworkPaths(ctx, framework)
  ctx.pinion.logger.notice(`To register MSW data, run:
  bun packages/generator/src/msw/register-tenant.ts --prefix ${ctx.prefix}

Then copy mockServiceWorker.js (or use registerMsw: true during generation):
  cp ${source} ${targetNotice}`)
  return ctx
}

const copyServiceWorker = (
  ctx: VueTenantContext,
  framework: Framework,
): VueTenantContext => {
  if (!ctx.registerMsw) {
    return noticeManualRegistration(ctx, framework)
  }

  const configPath = join(ctx.cwd, 'packages/infra/src/mocks/data/mocked-data.json')
  const updated = addTenantConfig(readMockedData(configPath), ctx.prefix, getProductNames(ctx.name))
  writeMockedData(configPath, updated)

  const { source, target, targetNotice } = frameworkPaths(ctx, framework)

  if (!existsSync(source)) {
    throw new Error(`MSW worker not found: ${source}`)
  }
  if (source === target) {
    throw new Error(`source: ${source} cannot be copied to the same target: ${target}`)
  }

  copyMswWorker(source, target)

  ctx.pinion.logger.notice(`Copied mockServiceWorker.js to ${targetNotice}`)
  ctx.pinion.logger.notice(`Registered MSW config for prefix "${ctx.prefix}"`)

  return ctx
}

export {
  getProductNames, copyServiceWorker,
}
