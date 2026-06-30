import { createApp } from 'vue'
import { useWhiteLabelApp, META_MAP_INJECTION_KEY } from './init'
import type { WhiteLabelAppOptions, WhiteLabelApp } from './init'

export { META_MAP_INJECTION_KEY }
export type { WhiteLabelAppOptions, WhiteLabelApp }

export async function createWhiteLabelApp(
  opts: WhiteLabelAppOptions,
): Promise<WhiteLabelApp> {
  const { setupMocks, resolveAppShell, createWlRouter, injectMetaMap } =
    useWhiteLabelApp()

  await setupMocks()
  const AppShell = await resolveAppShell(opts)
  const router = await createWlRouter(opts)
  const app = createApp(AppShell)
  app.use(router)
  injectMetaMap(app, opts.metaMap)

  return { app, router }
}
