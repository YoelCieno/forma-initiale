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
    expect(el.querySelector('fe-rating[value="3"]')).toBeTruthy()
  })

  it('renders readonly rating', () => {
    const fixture = TestBed.createComponent(RatingContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.querySelector('fe-rating[readonly]')).toBeTruthy()
  })

  it('renders disabled rating', () => {
    const fixture = TestBed.createComponent(RatingContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.querySelector('fe-rating[disabled]')).toBeTruthy()
  })

  it('renders rating with different max', () => {
    const fixture = TestBed.createComponent(RatingContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.querySelector('fe-rating[max="3"]')).toBeTruthy()
  })

  it('renders half-star precision', () => {
    const fixture = TestBed.createComponent(RatingContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.textContent).toContain('Half-Star Precision')
    expect(el.querySelector('fe-rating[precision="0.5"]')).toBeTruthy()
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
