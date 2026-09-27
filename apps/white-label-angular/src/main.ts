import { bootstrapApplication } from '@angular/platform-browser'
import { createWhiteLabelApp } from './bootstrap/app'
import { useWhiteLabelApp } from './bootstrap/init'
import { routes } from './routes'
import { frameworkMap } from '@repo/infra'

const { setupMocks } = useWhiteLabelApp()

await setupMocks()
const { root, config } = await createWhiteLabelApp({ routes, metaMap: frameworkMap })
bootstrapApplication(root, config).catch((err) => console.error(err))
