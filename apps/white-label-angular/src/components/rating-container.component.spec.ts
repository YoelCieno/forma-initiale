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
    const ratings: Element[] = el.querySelectorAll('fe-rating')
    expect(Array.from(ratings).some((r) => (r)['value' as keyof Element] === 3)).toBeTruthy()
  })

  it('renders readonly rating', () => {
    const fixture = TestBed.createComponent(RatingContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    const ratings: Element[] = el.querySelectorAll('fe-rating')
    // Check JS property, not just HTML attribute — directive ensures lowercase readonly prop set
    expect(Array.from(ratings).some((r: Element) => (r)['readonly' as keyof Element] === true)).toBeTruthy()
  })

  it('renders disabled rating', () => {
    const fixture = TestBed.createComponent(RatingContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    const ratings: Element[] = el.querySelectorAll('fe-rating')
    expect(Array.from(ratings).some((r: Element) => (r)['disabled' as keyof Element] === true)).toBeTruthy()
  })

  it('renders rating with different max', () => {
    const fixture = TestBed.createComponent(RatingContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    const ratings: Element[] = el.querySelectorAll('fe-rating')
    expect(Array.from(ratings).some((r: Element) => (r)['max' as keyof Element] === 3)).toBeTruthy()
  })

  it('renders half-star precision', () => {
    const fixture = TestBed.createComponent(RatingContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.textContent).toContain('Half-Star Precision')
    const ratings: Element[] = el.querySelectorAll('fe-rating')
    expect(Array.from(ratings).some((r: Element) => (r)['precision' as keyof Element] === 0.5)).toBeTruthy()
  })

  it('renders all 5 sizes', () => {
    const fixture = TestBed.createComponent(RatingContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    const sizes = ['xs', 's', 'm', 'l', 'xl']
    const ratings: Element[] = Array.from(el.querySelectorAll('fe-rating') as NodeListOf<Element>)
    const getProp = (r: Element, key: string) => (r)[key as keyof Element]
    sizes.forEach((size) => {
      expect(ratings.some((r) => getProp(r, 'size') === size), `size ${size}`).toBeTruthy()
    })
  })

  it('has block class', () => {
    const fixture = TestBed.createComponent(RatingContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.querySelector('.rating-container')).toBeTruthy()
  })
})
