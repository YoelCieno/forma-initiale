import '@repo/ui/styles/main.css'
import '@repo/ui/styles/themes/default.css'
import './styles'
import { createWhiteLabelApp } from './bootstrap/app'
import { routes } from './routes'
import { frameworkMap } from '../metadata'

createWhiteLabelApp({ routes, metaMap: frameworkMap }).then(({ app }) =>
  app.mount('#app'),
)
