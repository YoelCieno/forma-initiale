import { describe, it, expect, vi, beforeEach } from 'vitest'
import { provideZonelessChangeDetection, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { ProductsPage } from './products-page.component'
import { ProductsService } from '../services/products.service'
import type { ProductView } from '@repo/presenters'

const mockCatalog = {
  items: signal<ProductView[]>([]),
  loading: signal(true),
  error: signal<string | undefined>(undefined),
  hasValue: signal(false),
  reload: vi.fn(),
}

const mockProduct = (overrides: Partial<ProductView> = {}): ProductView => ({
  id: '1',
  name: 'vue',
  title: 'Vue',
  description: 'Progressive framework',
  image: 'vuejs',
  imageFamily: 'brands',
  price: 'Free',
  rate: 4.5,
  ...overrides,
})

describe('ProductsPage', () => {
  beforeEach(() => {
    TestBed.resetTestingModule()
    vi.clearAllMocks()
    mockCatalog.items.set([])
    mockCatalog.loading.set(true)
    mockCatalog.error.set(undefined)
    mockCatalog.hasValue.set(false)
  })

  const setup = async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsPage],
      providers: [provideZonelessChangeDetection(), { provide: ProductsService, useValue: mockCatalog }],
    }).compileComponents()
    return TestBed.createComponent(ProductsPage)
  }

  it('renders fe-async-content and fe-loader', async () => {
    const fixture = await setup()
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.querySelector('fe-async-content')).toBeTruthy()
    expect(el.querySelector('fe-loader')).toBeTruthy()
  })

  it('renders page title', async () => {
    const fixture = await setup()
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.textContent).toContain('List of Products')
    expect(el.querySelector('.products-page__title')).toBeTruthy()
  })

  it('renders grid container', async () => {
    const fixture = await setup()
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.querySelector('.products-page__grid')).toBeTruthy()
  })

  it('has products-page block class', async () => {
    const fixture = await setup()
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.querySelector('.products-page')).toBeTruthy()
  })

  // ── signal-driven state transitions ──

  it('loading state: shows loader, no product cards', async () => {
    mockCatalog.loading.set(true)
    mockCatalog.items.set([])
    mockCatalog.error.set(undefined)
    const fixture = await setup()
    fixture.detectChanges()
    await fixture.whenStable()
    await Promise.resolve()
    await Promise.resolve()

    const el = fixture.nativeElement
    const asyncContent = el.querySelector('fe-async-content') as unknown as { loading: boolean; error: string | undefined }
    // verify signal-driven props on fe-async-content (JS properties, not attributes)
    expect(asyncContent.loading).toBe(true)
    expect(asyncContent.error).toBeFalsy()
    expect(el.querySelector('fe-loader')).toBeTruthy()
    expect(el.querySelectorAll('app-product-card').length).toBe(0)
  })

  it('loaded state: shows product cards, loader not active', async () => {
    mockCatalog.loading.set(false)
    mockCatalog.items.set([mockProduct()])
    mockCatalog.error.set(undefined)
    const fixture = await setup()
    fixture.detectChanges()
    await fixture.whenStable()
    await Promise.resolve()
    await Promise.resolve()

    const el = fixture.nativeElement
    const asyncContent = el.querySelector('fe-async-content') as unknown as { loading: boolean; error: string | undefined }
    expect(asyncContent.loading).toBe(false)
    expect(asyncContent.error).toBeFalsy()
    expect(el.querySelectorAll('app-product-card').length).toBe(1)
    // fe-loader element stays in light DOM but async-content reports not loading
    expect(asyncContent.loading).toBe(false)
  })

  it('loaded state: product card receives correct inputs via signal', async () => {
    mockCatalog.loading.set(false)
    mockCatalog.items.set([mockProduct({ id: '42', title: 'Vue', price: '$99' })])
    mockCatalog.error.set(undefined)
    const fixture = await setup()
    fixture.detectChanges()
    await fixture.whenStable()

    const el = fixture.nativeElement
    const cards = el.querySelectorAll('app-product-card')
    expect(cards.length).toBe(1)
    // verify host element exists and content rendered via ProductCard
    expect(fixture.nativeElement.textContent).toContain('Vue')
  })

  it('error state: shows error text, loader not active', async () => {
    mockCatalog.loading.set(false)
    mockCatalog.items.set([])
    mockCatalog.error.set('Failed to load')
    const fixture = await setup()
    fixture.detectChanges()
    await fixture.whenStable()
    await Promise.resolve()
    await Promise.resolve()

    const el = fixture.nativeElement
    const asyncContent = el.querySelector('fe-async-content') as unknown as { loading: boolean; error: string | undefined }
    expect(asyncContent.loading).toBe(false)
    expect(asyncContent.error).toBe('Failed to load')
    const errorEl = el.querySelector('.products-page__error')
    expect(errorEl).toBeTruthy()
    expect(errorEl.textContent).toContain('Failed to load')
    expect(el.querySelectorAll('app-product-card').length).toBe(0)
  })

  it('transitions from loading to loaded when signals change', async () => {
    mockCatalog.loading.set(true)
    mockCatalog.items.set([])
    mockCatalog.error.set(undefined)
    const fixture = await setup()
    fixture.detectChanges()
    await fixture.whenStable()
    expect(fixture.nativeElement.querySelectorAll('app-product-card').length).toBe(0)
    expect((fixture.nativeElement.querySelector('fe-async-content') as unknown as { loading: boolean }).loading).toBe(true)

    // simulate service resolving
    mockCatalog.loading.set(false)
    mockCatalog.items.set([mockProduct(), mockProduct({ id: '2', title: 'Angular' })])
    fixture.detectChanges()
    await fixture.whenStable()
    await Promise.resolve()

    expect((fixture.nativeElement.querySelector('fe-async-content') as unknown as { loading: boolean }).loading).toBe(false)
    expect(fixture.nativeElement.querySelectorAll('app-product-card').length).toBe(2)
  })

  it('transitions from loading to error when signals change', async () => {
    mockCatalog.loading.set(true)
    mockCatalog.error.set(undefined)
    const fixture = await setup()
    fixture.detectChanges()
    await fixture.whenStable()

    mockCatalog.loading.set(false)
    mockCatalog.error.set('Failed to load')
    fixture.detectChanges()
    await fixture.whenStable()
    await Promise.resolve()

    const el = fixture.nativeElement
    const asyncContent = el.querySelector('fe-async-content') as unknown as { loading: boolean; error: string | undefined }
    expect(asyncContent.loading).toBe(false)
    expect(asyncContent.error).toBe('Failed to load')
    expect(el.querySelector('.products-page__error')?.textContent).toContain('Failed to load')
  })
})
