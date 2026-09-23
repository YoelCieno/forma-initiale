import { createApp, type InjectionKey } from 'vue'
import { useWhiteLabelApp } from './init'
import type { WhiteLabelAppOptions, WhiteLabelApp } from './init'
import type { ProductMeta } from '@repo/presenters'

export const META_MAP_INJECTION_KEY: InjectionKey<Record<string, ProductMeta>> = Symbol('metaMap')

export type { WhiteLabelAppOptions, WhiteLabelApp }

export async function createWhiteLabelApp(
  opts: WhiteLabelAppOptions,
): Promise<WhiteLabelApp> {
  const {
    setupMocks,
    resolveAppShell,
    createWlRouter,
    injectMetaMap
  } = useWhiteLabelApp()

  await setupMocks()
  const AppShell = await resolveAppShell(opts)
  const router = await createWlRouter(opts)

  const app = createApp(AppShell)
  app.use(router)
  injectMetaMap(app, opts.metaMap)

  return { app, router }
}
