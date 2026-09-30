import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { createWhiteLabelApp } from 'white-label-angular/app'
import { plantsMap } from '@repo/infra'
import { FpProductCard } from '../components/fp-product-card.component'

const sevenPlants = [
  'light-bearer',
  'misty-biter',
  'silent-trumpet',
  'dancing-box',
  'little-shade',
  'crimson-veil',
  'ember-leaf',
].map((name, i) => ({
  id: `fp-product-${i + 1}`,
  name,
  price: 9.99 + i,
  previousPrice: 0,
  rate: (i % 5) + 1,
}))

const settle = async (n = 8): Promise<void> => {
  for (let i = 0; i < n; i++) await Promise.resolve()
}

describe('tenant Products page — fp-product-card integration', () => {
  beforeEach(() => {
    TestBed.resetTestingModule()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: sevenPlants, total: sevenPlants.length }),
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders 7 fp-product-card elements, no shell app-product-card', async () => {
    const { root, config } = await createWhiteLabelApp({
      env: { apiUrl: 'https://mock.api', tenantId: 'fp', enableMocks: false },
      metaMap: plantsMap,
      componentOverrides: { 'product-card': FpProductCard },
      // mirrors main.ts — shell default App uses templateUrl (JIT-unresolved in tests)
      appShell: () => import('../app/app.component').then((m) => m.FpApp),
    })

    await TestBed.configureTestingModule({
      imports: [root],
      providers: [provideZonelessChangeDetection(), ...config.providers],
    }).compileComponents()

    const fixture = TestBed.createComponent(root)
    fixture.detectChanges()

    const router = TestBed.inject(Router)
    await router.navigateByUrl('/')
    await settle()
    fixture.detectChanges()
    await fixture.whenStable()
    await settle()
    fixture.detectChanges()

    const el = fixture.nativeElement as HTMLElement
    expect(el.querySelectorAll('fp-product-card').length).toBe(7)
    expect(el.querySelectorAll('app-product-card').length).toBe(0)
    expect(fetch).toHaveBeenCalledWith(
      'https://mock.api/fp/products',
      expect.objectContaining({ headers: { 'x-tenant-id': 'fp' } }),
    )
  })
})
