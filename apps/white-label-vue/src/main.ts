import '@repo/ui/styles'
import '@repo/ui/styles/themes/default'
import './styles'
import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import { routes } from './routes'

async function bootstrap() {
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCKS === 'true') {
    const { worker } = await import('@repo/infra/mocks/browser')
    await worker.start({
      onUnhandledRequest: 'bypass',
    })
  }

  const router = createRouter({
    history: createWebHashHistory(),
    routes,
  })

  createApp(App).use(router).mount('#app')
}

bootstrap()
