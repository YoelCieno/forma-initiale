import '@repo/ui/styles'
import '@repo/ui/styles/themes/default'
import './styles'
import { createWhiteLabelApp } from './app'
import { routes } from './routes'
import { frameworkMap } from '../metadata'

createWhiteLabelApp({ routes, metaMap: frameworkMap }).then(({ app }) => app.mount('#app'))
