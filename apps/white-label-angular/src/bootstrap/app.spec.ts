import { describe, it, expect } from 'vitest'
import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import type { ProductMeta } from '@repo/presenters'

// RED phase: these imports fail until bootstrap modules exist — that's the point
import { createWhiteLabelApp } from './app'
import { META_MAP_INJECTION_KEY } from './init'
import { App } from '../app/app'

class AboutCmp {}
class CustomCmp {}

describe('createWhiteLabelApp', () => {
  it('returns { root, config } where root is the base App component', async () => {
    const { root, config } = await createWhiteLabelApp({})
    expect(root).toBe(App)
    expect(Array.isArray(config.providers)).toBe(true)
  })

  it('appends extendRoutes to WL default routes', async () => {
    const { config } = await createWhiteLabelApp({
      extendRoutes: [{ path: 'about', component: AboutCmp }],
    })

    TestBed.configureTestingModule({ providers: config.providers })
    const router = TestBed.inject(Router)
    expect(router.config.map((r) => r.path)).toContain('about')
  })

  it('routes option replaces WL default routes entirely', async () => {
    const { config } = await createWhiteLabelApp({
      routes: [{ path: 'custom', component: CustomCmp }],
    })

    TestBed.configureTestingModule({ providers: config.providers })
    const router = TestBed.inject(Router)
    expect(router.config.map((r) => r.path)).toEqual(['custom'])
  })

  it('routes takes precedence over extendRoutes when both provided', async () => {
    const { config } = await createWhiteLabelApp({
      routes: [{ path: 'only', component: CustomCmp }],
      extendRoutes: [{ path: 'ignored', component: AboutCmp }],
    })

    TestBed.configureTestingModule({ providers: config.providers })
    const router = TestBed.inject(Router)
    expect(router.config.map((r) => r.path)).toEqual(['only'])
  })

  it('metaMap is injected when provided', async () => {
    const testMeta: ProductMeta = {
      title: 'Test',
      description: 'Test desc',
      image: 'test',
      imageFamily: 'classic',
    }

    const { config } = await createWhiteLabelApp({
      metaMap: { test: testMeta },
    })

    TestBed.configureTestingModule({ providers: config.providers })
    expect(TestBed.inject(META_MAP_INJECTION_KEY)).toEqual({ test: testMeta })
  })

  it('metaMap not provided when not set', async () => {
    const { config } = await createWhiteLabelApp({})

    TestBed.configureTestingModule({ providers: config.providers })
    expect(() => TestBed.inject(META_MAP_INJECTION_KEY)).toThrow()
  })
})
