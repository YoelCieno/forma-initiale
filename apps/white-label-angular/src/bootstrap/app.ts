import { routes as wlRoutes } from '../routes'
import {
  useWhiteLabelApp,
  APP_ENV,
  type AppEnv,
  type WhiteLabelApp,
  type WhiteLabelAppOptions,
} from './init'

export { useWhiteLabelApp, APP_ENV }
export type { AppEnv }

export const createWhiteLabelApp = async (
  opts: WhiteLabelAppOptions,
): Promise<WhiteLabelApp> => {
  const { mergeRoutes, buildAppConfig, resolveAppShell } = useWhiteLabelApp()
  const merged = mergeRoutes(wlRoutes, opts)
  return {
    root: await resolveAppShell(opts),
    config: buildAppConfig(merged, opts),
  }
}
