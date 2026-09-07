import { describe, it, expect } from 'vitest'
import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { ProductCard } from './product-card.component'
import { ProductView } from '@repo/presenters'

describe('ProductCard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCard],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents()
  })

  const baseInputs: Partial<ProductView> = {
    title: 'Vue',
    description: 'Progressive framework',
    image: 'vuejs',
    imageFamily: 'brands',
    price: 'Free',
    rate: 4.5,
  }

  const setInputs = (
    fixture: { componentRef: { setInput: (k: string, v: unknown) => void } },
    inputs: Partial<ProductView> ,
  ) => {
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value)
    }
  }

  it('renders title and description', async () => {
    const fixture = TestBed.createComponent(ProductCard)
    setInputs(fixture, baseInputs)
    fixture.detectChanges()
    const el: Element = fixture.nativeElement
    expect(el.textContent).toContain('Vue')
    expect(el.textContent).toContain('Progressive framework')
  })

  it('renders fe-icon with correct attrs', async () => {
    const fixture = TestBed.createComponent(ProductCard)
    setInputs(fixture, baseInputs)
    fixture.detectChanges()
    const el = fixture.nativeElement
    const icon: Element = el.querySelector('fe-icon')
    expect(icon).toBeTruthy()
    // icon props are bound via [name]/[family] -> check JS properties, fallback to attrs
    const name = (icon)['name' as keyof Element] ?? icon.getAttribute('name')
    const family = (icon)['family' as keyof Element] ?? icon.getAttribute('family')
    expect(name).toBe('vuejs')
    expect(family).toBe('brands')
  })

  it('renders fe-rating readonly with value', async () => {
    const fixture = TestBed.createComponent(ProductCard)
    setInputs(fixture, baseInputs)
    fixture.detectChanges()
    const el = fixture.nativeElement
    const rating: Element = el.querySelector('fe-rating')
    expect(rating).toBeTruthy()
    const val = (rating)['value' as keyof Element]
    expect(val).toBe(4.5)
    // Check JS property readonly, not just attribute
    expect((rating)['readonly' as keyof Element]).toBe(true)
  })

  it('shows previousPrice when provided', async () => {
    const fixture = TestBed.createComponent(ProductCard)
    setInputs(fixture, { ...baseInputs, previousPrice: '$99' })
    fixture.detectChanges()
    const el: Element = fixture.nativeElement
    expect(el.textContent).toContain('$99')
    expect(el.querySelector('.product-card__price--previous')).toBeTruthy()
  })

  it('does NOT show previousPrice when absent', async () => {
    const fixture = TestBed.createComponent(ProductCard)
    setInputs(fixture, baseInputs)
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.querySelector('.product-card__price--previous')).toBeFalsy()
  })

  it('shows price', async () => {
    const fixture = TestBed.createComponent(ProductCard)
    setInputs(fixture, { ...baseInputs, price: '$29' })
    fixture.detectChanges()
    const el: Element = fixture.nativeElement
    expect(el.textContent).toContain('$29')
  })

  it('has product-card class', async () => {
    const fixture = TestBed.createComponent(ProductCard)
    setInputs(fixture, baseInputs)
    fixture.detectChanges()
    const el: Element = fixture.nativeElement
    expect(el.querySelector('.product-card, fe-card.product-card')).toBeTruthy()
  })
})
