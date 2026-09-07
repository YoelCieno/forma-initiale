import { describe, it, expect } from 'vitest'
import { TestBed } from '@angular/core/testing'
import { RatingContainer } from './rating-container.component'

describe('RatingContainer', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatingContainer],
    }).compileComponents()
  })

  it('renders basic heading', () => {
    const fixture = TestBed.createComponent(RatingContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.textContent).toContain('Basic')
  })

  it('renders rating with initial value', () => {
    const fixture = TestBed.createComponent(RatingContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    const ratings = el.querySelectorAll('fe-rating')
    expect(Array.from(ratings as unknown as Element[]).some((r: Element) => (r as unknown as Record<string, unknown>)['value'] === 3)).toBeTruthy()
  })

  it('renders readonly rating', () => {
    const fixture = TestBed.createComponent(RatingContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    const ratings = el.querySelectorAll('fe-rating')
    // Check JS property, not just HTML attribute — directive ensures lowercase readonly prop set
    expect(Array.from(ratings as unknown as Element[]).some((r: Element) => (r as unknown as Record<string, unknown>)['readonly'] === true)).toBeTruthy()
  })

  it('renders disabled rating', () => {
    const fixture = TestBed.createComponent(RatingContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    const ratings = el.querySelectorAll('fe-rating')
    expect(Array.from(ratings as unknown as Element[]).some((r: Element) => (r as unknown as Record<string, unknown>)['disabled'] === true)).toBeTruthy()
  })

  it('renders rating with different max', () => {
    const fixture = TestBed.createComponent(RatingContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    const ratings = el.querySelectorAll('fe-rating')
    expect(Array.from(ratings as unknown as Element[]).some((r: Element) => (r as unknown as Record<string, unknown>)['max'] === 3)).toBeTruthy()
  })

  it('renders half-star precision', () => {
    const fixture = TestBed.createComponent(RatingContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.textContent).toContain('Half-Star Precision')
    const ratings = el.querySelectorAll('fe-rating')
    expect(Array.from(ratings as unknown as Element[]).some((r: Element) => (r as unknown as Record<string, unknown>)['precision'] === 0.5)).toBeTruthy()
  })

  it('renders all 5 sizes', () => {
    const fixture = TestBed.createComponent(RatingContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    const sizes = ['xs', 's', 'm', 'l', 'xl']
    sizes.forEach((size) => {
      expect(el.querySelector(`fe-rating[size="${size}"]`), `size ${size}`).toBeTruthy()
    })
  })

  it('has block class', () => {
    const fixture = TestBed.createComponent(RatingContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.querySelector('.rating-container')).toBeTruthy()
  })
})
