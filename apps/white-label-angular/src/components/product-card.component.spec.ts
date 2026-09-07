import { describe, it, expect } from 'vitest'
import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { ProductCard } from './product-card.component'

describe('ProductCard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCard],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents()
  })

  const baseInputs = {
    title: 'Vue',
    description: 'Progressive framework',
    image: 'vuejs',
    imageFamily: 'brands',
    price: 'Free',
    rate: 4.5,
  }

  const setInputs = (
    fixture: { componentRef: { setInput: (k: string, v: unknown) => void } },
    inputs: Record<string, unknown>,
  ) => {
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value)
    }
  }

  it('renders title and description', async () => {
    const fixture = TestBed.createComponent(ProductCard)
    setInputs(fixture, baseInputs)
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.textContent).toContain('Vue')
    expect(el.textContent).toContain('Progressive framework')
  })

  it('renders fe-icon with correct attrs', async () => {
    const fixture = TestBed.createComponent(ProductCard)
    setInputs(fixture, baseInputs)
    fixture.detectChanges()
    const el = fixture.nativeElement
    const icon = el.querySelector('fe-icon') as Element & Record<string, unknown>
    expect(icon).toBeTruthy()
    // icon props are bound via [name]/[family] -> check JS properties, fallback to attrs
    const name = (icon as unknown as Record<string, unknown>)['name'] ?? icon.getAttribute('name')
    const family = (icon as unknown as Record<string, unknown>)['family'] ?? icon.getAttribute('family')
    expect(name).toBe('vuejs')
    expect(family).toBe('brands')
  })

  it('renders fe-rating readonly with value', async () => {
    const fixture = TestBed.createComponent(ProductCard)
    setInputs(fixture, baseInputs)
    fixture.detectChanges()
    const el = fixture.nativeElement
    const rating = el.querySelector('fe-rating') as Element & Record<string, unknown>
    expect(rating).toBeTruthy()
    const val = (rating as unknown as Record<string, unknown>)['value']
    expect(val).toBe(4.5)
    // Check JS property readonly, not just attribute
    expect((rating as unknown as Record<string, unknown>)['readonly']).toBe(true)
  })

  it('shows previousPrice when provided', async () => {
    const fixture = TestBed.createComponent(ProductCard)
    setInputs(fixture, { ...baseInputs, previousPrice: '$99' })
    fixture.detectChanges()
    const el = fixture.nativeElement
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
    const el = fixture.nativeElement
    expect(el.textContent).toContain('$29')
  })

  it('has product-card class', async () => {
    const fixture = TestBed.createComponent(ProductCard)
    setInputs(fixture, baseInputs)
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.querySelector('.product-card, fe-card.product-card')).toBeTruthy()
  })
})
