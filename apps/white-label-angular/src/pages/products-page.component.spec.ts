import { describe, it, expect, vi, beforeEach } from 'vitest'
import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { ProductsPage } from './products-page.component'

vi.mock('@repo/infra', () => ({
  getProducts: vi.fn().mockResolvedValue({ data: [], total: 0 }),
}))

describe('ProductsPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsPage],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents()
  })

  it('renders fe-async-content and fe-loader', () => {
    const fixture = TestBed.createComponent(ProductsPage)
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.querySelector('fe-async-content')).toBeTruthy()
    expect(el.querySelector('fe-loader')).toBeTruthy()
  })

  it('renders page title', () => {
    const fixture = TestBed.createComponent(ProductsPage)
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.textContent).toContain('List of Products')
    expect(el.querySelector('.products-page__title')).toBeTruthy()
  })

  it('renders grid container', () => {
    const fixture = TestBed.createComponent(ProductsPage)
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.querySelector('.products-page__grid')).toBeTruthy()
  })

  it('has products-page block class', () => {
    const fixture = TestBed.createComponent(ProductsPage)
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.querySelector('.products-page')).toBeTruthy()
  })
})
