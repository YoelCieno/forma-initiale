import { describe, it, expect } from 'vitest'
import { TestBed } from '@angular/core/testing'
import { IconContainer } from './icon-container.component'

describe('IconContainer', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconContainer],
    }).compileComponents()
  })

  it('renders basic icons section', () => {
    const fixture = TestBed.createComponent(IconContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.textContent).toContain('Basic Icons')
    expect(el.querySelector('fe-icon[name="check"]')).toBeTruthy()
    expect(el.querySelector('fe-icon[name="star"]')).toBeTruthy()
    expect(el.querySelector('fe-icon[name="heart"]')).toBeTruthy()
  })

  it('renders animation variants', () => {
    const fixture = TestBed.createComponent(IconContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.textContent).toContain('Animations')
    expect(el.querySelector('fe-icon[animation="spin"]')).toBeTruthy()
    expect(el.querySelector('fe-icon[animation="pulse"]')).toBeTruthy()
    expect(el.querySelector('fe-icon[animation="bounce"]')).toBeTruthy()
  })

  it('renders size variants', () => {
    const fixture = TestBed.createComponent(IconContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.textContent).toContain('Sizes')
    const rockets = el.querySelectorAll('fe-icon[name="rocket"]')
    expect(rockets.length).toBeGreaterThanOrEqual(5)
  })

  it('has block class', () => {
    const fixture = TestBed.createComponent(IconContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.querySelector('.icon-container')).toBeTruthy()
  })

  it('renders fe-card wrappers', () => {
    const fixture = TestBed.createComponent(IconContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.querySelectorAll('fe-card').length).toBeGreaterThanOrEqual(3)
  })
})
