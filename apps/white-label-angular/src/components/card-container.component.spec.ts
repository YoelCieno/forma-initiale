import { describe, it, expect } from 'vitest'
import { TestBed } from '@angular/core/testing'
import { CardContainer } from './card-container.component'

describe('CardContainer', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardContainer],
    }).compileComponents()
  })

  it('renders default card', () => {
    const fixture = TestBed.createComponent(CardContainer)
    fixture.detectChanges()
    const el: Element = fixture.nativeElement
    const cards = el.querySelectorAll('fe-card')
    expect(cards.length).toBeGreaterThanOrEqual(1)
    const first = cards[0]
    expect(first).toBeTruthy()
    expect(first.getAttribute('appearance')).toBeNull()
  })

  it('renders all 3 appearances', () => {
    const fixture = TestBed.createComponent(CardContainer)
    fixture.detectChanges()
    const el: Element = fixture.nativeElement
    const cards: Element[] = Array.from(el.querySelectorAll('fe-card'))
    const getProp = (card: Element, key: string) => (card)[key as keyof Element]
    expect(cards.some((c) => getProp(c, 'appearance') === 'outlined')).toBeTruthy()
    expect(cards.some((c) => getProp(c, 'appearance') === 'filled')).toBeTruthy()
    expect(cards.some((c) => getProp(c, 'appearance') === 'accent')).toBeTruthy()
  })

  it('renders card with header slot', () => {
    const fixture = TestBed.createComponent(CardContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    const header: Element = el.querySelector('h4[slot="header"]')
    expect(header).toBeTruthy()
    expect(header.textContent).toBe('Card Title')
  })

  it('renders horizontal card', () => {
    const fixture = TestBed.createComponent(CardContainer)
    fixture.detectChanges()
    const el: Element = fixture.nativeElement
    const cards: Element[] = Array.from(el.querySelectorAll('fe-card'))
    expect(cards.some((c) => (c)['orientation' as keyof Element] === 'horizontal')).toBeTruthy()
  })

  it('renders product-card inside', () => {
    const fixture = TestBed.createComponent(CardContainer)
    fixture.detectChanges()
    const el: Element = fixture.nativeElement
    expect(el.querySelector('app-product-card')).toBeTruthy()
  })

  it('has block class', () => {
    const fixture = TestBed.createComponent(CardContainer)
    fixture.detectChanges()
    const el: Element = fixture.nativeElement
    expect(el.querySelector('.card-container')).toBeTruthy()
  })
})
