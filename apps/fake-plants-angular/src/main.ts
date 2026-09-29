import { bootstrapApplication } from '@angular/platform-browser'
import { createWhiteLabelApp, useWhiteLabelApp } from 'white-label-angular/app'
import { plantsMap } from '@repo/infra'
import { environment } from './environments/environment'

const { setupMocks } = useWhiteLabelApp()

await setupMocks(environment)
const { root, config } = await createWhiteLabelApp({
  env: environment,
  metaMap: plantsMap,
  extendRoutes: [
    {
      path: 'about',
      loadComponent: () => import('./pages/about-page.component').then((m) => m.AboutPage),
    },
  ],
  // Angular route paths are slash-less ('components', not '/components') —
  // mergeRoutes filters by exact route.path match, a leading slash silently no-ops.
  omitRoutePaths: ['components'],
  appShell: () => import('./app/app.component').then((m) => m.FpApp),
})
bootstrapApplication(root, config).catch((err) => console.error(err))
