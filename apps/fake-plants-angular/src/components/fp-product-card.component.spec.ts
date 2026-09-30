import { describe, it, expect, beforeEach } from 'vitest'
import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { getProductImageUrl } from '@repo/infra'
import { FpProductCard } from './fp-product-card.component'

const baseInputs = {
  id: 'monstera-deliciosa',
  title: 'Monstera Deliciosa',
  description: 'Swiss cheese plant',
  image: 'plant',
  imageFamily: 'classic',
  price: '$24',
  previousPrice: '$30',
  rate: 4.5,
}

describe('FpProductCard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FpProductCard],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents()
  })

  const setup = async (inputs: Partial<typeof baseInputs> = {}) => {
    const fixture = TestBed.createComponent(FpProductCard)
    Object.entries({ ...baseInputs, ...inputs }).forEach(([k, v]) =>
      fixture.componentRef.setInput(k as keyof typeof baseInputs, v),
    )
    fixture.detectChanges()
    await fixture.whenStable()
    await Promise.resolve()
    await Promise.resolve()
    fixture.detectChanges()
    return fixture
  }

  it('renders fe-img media from getProductImageUrl(id)', async () => {
    const fixture = await setup()
    const img = fixture.nativeElement.querySelector('fe-img')
    expect(img).toBeTruthy()
    expect(img.src).toBe(getProductImageUrl('monstera-deliciosa'))
    expect(img.alt).toBe('Monstera Deliciosa')
    expect(img.cacheKey).toBe('monstera-deliciosa')
  })

  it('renders header title and price', async () => {
    const fixture = await setup()
    const header = fixture.nativeElement.querySelector('.fp-product-card__header')
    expect(header).toBeTruthy()
    expect(header.textContent).toContain('Monstera Deliciosa')
    expect(header.textContent).toContain('$24')
  })

  it('renders description', async () => {
    const fixture = await setup()
    const desc = fixture.nativeElement.querySelector('.fp-product-card__description')
    expect(desc?.textContent?.trim()).toBe('Swiss cheese plant')
  })

  it('renders readonly footer rating with product rate', async () => {
    const fixture = await setup()
    const rating = fixture.nativeElement.querySelector('fe-rating')
    expect(rating).toBeTruthy()
    expect(rating.value).toBe(4.5)
    expect(rating.readonly).toBe(true)
  })

  it('accepts the full shell input surface (signal inputs)', async () => {
    const fixture = await setup({ previousPrice: undefined })
    expect(() => fixture.componentRef.setInput('image', 'plant')).not.toThrow()
    expect(() => fixture.componentRef.setInput('imageFamily', 'classic')).not.toThrow()
    expect(() => fixture.componentRef.setInput('previousPrice', undefined)).not.toThrow()
    expect(() => fixture.componentRef.setInput('rate', 3)).not.toThrow()
  })

  it('uses fp-product-card BEM root class', async () => {
    const fixture = await setup()
    const card = fixture.nativeElement.querySelector('.fp-product-card')
    expect(card).toBeTruthy()
  })
})
