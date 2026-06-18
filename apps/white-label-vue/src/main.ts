import '@repo/ui/styles'
import '@repo/ui/styles/themes/default'
import './styles'
import { createWhiteLabelApp } from './app'
import { routes } from './routes'

createWhiteLabelApp({ routes }).then(({ app }) => app.mount('#app'))
