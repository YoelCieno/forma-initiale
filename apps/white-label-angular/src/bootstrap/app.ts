import { routes as wlRoutes } from '../routes'
import { useWhiteLabelApp, type WhiteLabelApp, type WhiteLabelAppOptions } from './init'

export const createWhiteLabelApp = async (
  opts: WhiteLabelAppOptions,
): Promise<WhiteLabelApp> => {
  const { mergeRoutes, buildAppConfig, resolveAppShell } = useWhiteLabelApp()
  const merged = mergeRoutes(wlRoutes, opts)
  return {
    root: await resolveAppShell(opts),
    config: buildAppConfig(merged, opts.metaMap),
  }
}
