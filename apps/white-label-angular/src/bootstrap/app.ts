import { App } from '../app/app'
import { routes as wlRoutes } from '../routes'
import { useWhiteLabelApp, type WhiteLabelApp, type WhiteLabelAppOptions } from './init'

export { feComponent } from '../factories/create-custom-elements'

export const createWhiteLabelApp = async (
  opts: WhiteLabelAppOptions,
): Promise<WhiteLabelApp> => {
  const { mergeRoutes, buildAppConfig } = useWhiteLabelApp()
  const merged = mergeRoutes(wlRoutes, opts)
  return {
    root: App,
    config: buildAppConfig(merged, opts.metaMap),
  }
}
