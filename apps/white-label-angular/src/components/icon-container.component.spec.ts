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
    const el: Element = fixture.nativeElement
    expect(el.textContent).toContain('Basic Icons')
    const icons: Element[] = Array.from(el.querySelectorAll('fe-icon'))
    const getProp = (icon: Element, key: string) => (icon)[key as keyof Element]
    expect(icons.some((i) => getProp(i, 'name') === 'check')).toBeTruthy()
    expect(icons.some((i) => getProp(i, 'name') === 'star')).toBeTruthy()
    expect(icons.some((i) => getProp(i, 'name') === 'heart')).toBeTruthy()
  })

  it('renders animation variants', () => {
    const fixture = TestBed.createComponent(IconContainer)
    fixture.detectChanges()
    const el: Element = fixture.nativeElement
    expect(el.textContent).toContain('Animations')
    const icons: Element[] = Array.from(el.querySelectorAll('fe-icon'))
    const getProp = (icon: Element, key: string) => (icon)[key as keyof Element]
    expect(icons.some((i) => getProp(i, 'animation') === 'spin')).toBeTruthy()
    expect(icons.some((i) => getProp(i, 'animation') === 'pulse')).toBeTruthy()
    expect(icons.some((i) => getProp(i, 'animation') === 'bounce')).toBeTruthy()
  })

  it('renders size variants', () => {
    const fixture = TestBed.createComponent(IconContainer)
    fixture.detectChanges()
    const el: Element = fixture.nativeElement
    expect(el.textContent).toContain('Sizes')
    const icons: Element[] = Array.from(el.querySelectorAll('fe-icon'))
    const rockets = icons.filter((i) => (i)['name' as keyof Element] === 'rocket')
    expect(rockets.length).toBeGreaterThanOrEqual(5)
  })

  it('has block class', () => {
    const fixture = TestBed.createComponent(IconContainer)
    fixture.detectChanges()
    const el: Element = fixture.nativeElement
    expect(el.querySelector('.icon-container')).toBeTruthy()
  })

  it('renders fe-card wrappers', () => {
    const fixture = TestBed.createComponent(IconContainer)
    fixture.detectChanges()
    const el: Element = fixture.nativeElement
    expect(el.querySelectorAll('fe-card').length).toBeGreaterThanOrEqual(3)
  })
})
