import { describe, it, expect, vi, beforeEach } from 'vitest'
import { provideZonelessChangeDetection, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { ProductsPage } from './products-page.component'
import { ProductsService } from '../services/products.service'

const mockCatalog = {
  items: signal([]),
  loading: signal(true),
  error: signal<string | undefined>(undefined),
  hasValue: signal(false),
  reload: vi.fn(),
}

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
})
