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

// ── component override registry (plan 4.6.5, task 2.4) ──

import { Component, input } from '@angular/core'
import { COMPONENT_OVERRIDES } from '../bootstrap/init'

@Component({
  selector: 'dummy-product-card',
  template: `<span
    class="dummy-card"
    [attr.data-id]="id()"
    [attr.data-title]="title()"
    [attr.data-description]="description()"
    [attr.data-image]="image()"
    [attr.data-image-family]="imageFamily()"
    [attr.data-price]="price()"
    [attr.data-previous-price]="previousPrice()"
    [attr.data-rate]="rate()"
  ></span>`,
})
class DummyProductCard {
  readonly id = input.required<string>()
  readonly title = input('')
  readonly description = input('')
  readonly image = input('')
  readonly imageFamily = input('')
  readonly price = input('')
  readonly previousPrice = input<string | undefined>(undefined)
  readonly rate = input(0)
}

describe('ProductsPage — componentOverrides registry', () => {
  beforeEach(() => {
    TestBed.resetTestingModule()
    vi.clearAllMocks()
    mockCatalog.items.set([mockProduct({ id: 'p1', previousPrice: '$9' })])
    mockCatalog.loading.set(false)
    mockCatalog.error.set(undefined)
    mockCatalog.hasValue.set(true)
  })

  const setupWithOverride = async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsPage],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ProductsService, useValue: mockCatalog },
        { provide: COMPONENT_OVERRIDES, useValue: { 'product-card': DummyProductCard } },
      ],
    }).compileComponents()
    return TestBed.createComponent(ProductsPage)
  }

  it('renders tenant dummy instead of shell ProductCard when key registered', async () => {
    const fixture = await setupWithOverride()
    fixture.detectChanges()
    await fixture.whenStable()

    const el = fixture.nativeElement
    expect(el.querySelectorAll('dummy-product-card').length).toBe(1)
    expect(el.querySelectorAll('app-product-card').length).toBe(0)
  })

  it('binds all 7 inputs through the outlet', async () => {
    const fixture = await setupWithOverride()
    fixture.detectChanges()
    await fixture.whenStable()
    // hybridJS/zoneless settle: outlet applies setInput on a later microtask
    await Promise.resolve()
    await Promise.resolve()
    fixture.detectChanges()

    const card = fixture.nativeElement.querySelector('dummy-product-card .dummy-card')
    expect(card.getAttribute('data-id')).toBe('p1')
    expect(card.getAttribute('data-title')).toBe('Vue')
    expect(card.getAttribute('data-description')).toBe('Progressive framework')
    expect(card.getAttribute('data-image')).toBe('vuejs')
    expect(card.getAttribute('data-image-family')).toBe('brands')
    expect(card.getAttribute('data-price')).toBe('Free')
    expect(card.getAttribute('data-previous-price')).toBe('$9')
    expect(card.getAttribute('data-rate')).toBe('4.5')
  })
})
