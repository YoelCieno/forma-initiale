import { describe, it, expect } from 'vitest'
import { TestBed } from '@angular/core/testing'
import { ButtonContainer } from './button-container.component'

describe('ButtonContainer', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonContainer],
    }).compileComponents()
  })

  it('renders all variant buttons', () => {
    const fixture = TestBed.createComponent(ButtonContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    const buttons: NodeListOf<Element> = el.querySelectorAll('fe-button')
    const variants = ['neutral', 'brand', 'success', 'warning', 'danger']
    variants.forEach((variant) => {
      const found = Array.from(buttons).some((b) => (b as unknown as Record<string, unknown>)['variant'] === variant)
      expect(found, `expected fe-button with variant="${variant}"`).toBe(true)
    })
  })

  it('renders all size variants', () => {
    const fixture = TestBed.createComponent(ButtonContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    const buttons: NodeListOf<Element> = el.querySelectorAll('fe-button')
    const sizes = ['xs', 's', 'm', 'l', 'xl']
    sizes.forEach((size) => {
      const found = Array.from(buttons).some((b) => (b as unknown as Record<string, unknown>)['size'] === size)
      expect(found, `expected fe-button with size="${size}"`).toBe(true)
    })
  })

  it('renders 16 fe-button elements', () => {
    const fixture = TestBed.createComponent(ButtonContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.querySelectorAll('fe-button').length).toBe(16)
  })

  it('renders section fe-card', () => {
    const fixture = TestBed.createComponent(ButtonContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.querySelectorAll('fe-card').length).toBe(4)
  })

  it('has block class on root element', () => {
    const fixture = TestBed.createComponent(ButtonContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.querySelector('.button-container')).toBeTruthy()
  })

  it('renders section headings', () => {
    const fixture = TestBed.createComponent(ButtonContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    const text = el.textContent ?? ''
    expect(text).toContain('Variants')
    expect(text).toContain('Sizes')
    expect(text).toContain('Appearances')
    expect(text).toContain('States')
  })
})
