import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'products', component: { template: '<div>Products page</div>' } },
    { path: '/about', name: 'about', component: { template: '<div>About page</div>' } },
  ],
})

describe('App', () => {
  it('renders nav with RouterLink to /', async () => {
    router.push('/')
    await router.isReady()
    const wrapper = mount(App, {
      global: { plugins: [router] },
    })
    expect(wrapper.text()).toContain('Products')
    const links = wrapper.findAll('a')
    const productsLink = links.find(l => l.text() === 'Products')
    expect(productsLink).toBeDefined()
    expect(productsLink?.attributes('href')).toBe('#/')
  })

  it('renders nav with RouterLink to /about', async () => {
    router.push('/')
    await router.isReady()
    const wrapper = mount(App, {
      global: { plugins: [router] },
    })
    expect(wrapper.text()).toContain('About')
    const links = wrapper.findAll('a')
    const aboutLink = links.find(l => l.text() === 'About')
    expect(aboutLink).toBeDefined()
    expect(aboutLink?.attributes('href')).toBe('#/about')
  })

  it('renders RouterView', async () => {
    router.push('/')
    await router.isReady()
    const wrapper = mount(App, {
      global: { plugins: [router] },
    })
    expect(wrapper.findComponent({ name: 'RouterView' }).exists()).toBe(true)
  })
})
