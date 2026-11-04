import { bootstrapApplication } from '@angular/platform-browser'
import { createWhiteLabelApp, useWhiteLabelApp } from 'white-label-angular/app'
import { mirrorTenantMap } from '@repo/infra'

import { componentOverrides } from './components/overrides.gen'
import { environment } from './environments/environment'

const { setupMocks } = useWhiteLabelApp()

await setupMocks(environment)
const { root, config } = await createWhiteLabelApp({
  env: environment,
  metaMap: mirrorTenantMap,

  // filename-key registry: generated from src/components/*.component.ts by pre-hooks
  componentOverrides,
})
bootstrapApplication(root, config).catch((err) => console.error(err))
