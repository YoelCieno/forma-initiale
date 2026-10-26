import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { addTenantConfig } from './add-tenant'
import { readFileData, writeMockedData, copyMswWorker } from './file-io'
import type { MockedData, TenantContext } from '../models'
import { naming } from '@repo/domain'

interface ServiceWorker {
  getProductNames: (name: string) => string[]
  copyServiceWorker: (ctx: TenantContext) => TenantContext
}

export function serviceWorker(): ServiceWorker {
  const { getProductNames } = naming()

  const frameworkPaths = (ctx: TenantContext) => ({
    source: join(
      ctx.cwd,
      `apps/white-label-${ctx.framework}/public/mockServiceWorker.js`,
    ),
    target: join(
      ctx.cwd,
      `apps/${ctx.name}-${ctx.framework}/public/mockServiceWorker.js`,
    ),
    targetNotice: `apps/${ctx.name}-${ctx.framework}/public/`,
  })

  const noticeManualRegistration = (ctx: TenantContext): TenantContext => {
    const { source, targetNotice } = frameworkPaths(ctx)
    ctx.pinion.logger.notice(`To register MSW data, run:
  bun packages/generator/src/msw/register-tenant.ts --prefix ${ctx.prefix}

Then copy mockServiceWorker.js (or use registerMsw: true during generation):
  cp ${source} ${targetNotice}`)
    return ctx
  }

  const copyServiceWorker = (ctx: TenantContext): TenantContext => {
    if (!ctx.registerMsw) {
      return noticeManualRegistration(ctx)
    }

    const configPath = join(ctx.cwd, 'packages/infra/src/mocks/data/mocked-data.json')
    const updated = addTenantConfig(readFileData<MockedData>(configPath), ctx.prefix, getProductNames(ctx.name))
    writeMockedData(configPath, updated)

    const { source, target, targetNotice } = frameworkPaths(ctx)

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

  return { getProductNames, copyServiceWorker }
}
