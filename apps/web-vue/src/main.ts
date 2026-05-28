import '@repo/ui/styles';
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

async function bootstrap() {
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCKS === 'true') {
    const { worker } = await import('@repo/infra/mocks/browser')
    await worker.start({
      onUnhandledRequest: 'bypass',
    })
  }

  createApp(App).use(router).mount('#app')
}

bootstrap()
