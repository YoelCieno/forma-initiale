import { describe, it, expect } from 'vitest'
import { TestBed } from '@angular/core/testing'
import { ProductCard } from './product-card.component'

describe('ProductCard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCard],
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

  it('renders title and description', async () => {
    const fixture = TestBed.createComponent(ProductCard)
    Object.assign(fixture.componentInstance, baseInputs)
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.textContent).toContain('Vue')
    expect(el.textContent).toContain('Progressive framework')
  })

  it('renders fe-icon with correct attrs', async () => {
    const fixture = TestBed.createComponent(ProductCard)
    Object.assign(fixture.componentInstance, baseInputs)
    fixture.detectChanges()
    const el = fixture.nativeElement
    const icon = el.querySelector('fe-icon')
    expect(icon).toBeTruthy()
    expect(icon.getAttribute('name')).toBe('vuejs')
    expect(icon.getAttribute('family')).toBe('brands')
  })

  it('renders fe-rating readonly with value', async () => {
    const fixture = TestBed.createComponent(ProductCard)
    Object.assign(fixture.componentInstance, baseInputs)
    fixture.detectChanges()
    const el = fixture.nativeElement
    const rating = el.querySelector('fe-rating')
    expect(rating).toBeTruthy()
    expect(rating.getAttribute('value')).toBe('4.5')
    expect(rating.hasAttribute('readonly')).toBe(true)
  })

  it('shows previousPrice when provided', async () => {
    const fixture = TestBed.createComponent(ProductCard)
    Object.assign(fixture.componentInstance, { ...baseInputs, previousPrice: '$99' })
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.textContent).toContain('$99')
    expect(el.querySelector('.product-card__price--previous')).toBeTruthy()
  })

  it('does NOT show previousPrice when absent', async () => {
    const fixture = TestBed.createComponent(ProductCard)
    Object.assign(fixture.componentInstance, baseInputs)
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.querySelector('.product-card__price--previous')).toBeFalsy()
  })

  it('shows price', async () => {
    const fixture = TestBed.createComponent(ProductCard)
    Object.assign(fixture.componentInstance, { ...baseInputs, price: '$29' })
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.textContent).toContain('$29')
  })

  it('has product-card class', async () => {
    const fixture = TestBed.createComponent(ProductCard)
    Object.assign(fixture.componentInstance, baseInputs)
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.querySelector('.product-card, fe-card.product-card')).toBeTruthy()
  })
})
