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
    const el = fixture.nativeElement
    const cards = el.querySelectorAll('fe-card')
    expect(cards.length).toBeGreaterThanOrEqual(1)
    const first = cards[0]
    expect(first).toBeTruthy()
    expect(first.getAttribute('appearance')).toBeNull()
  })

  it('renders all 3 appearances', () => {
    const fixture = TestBed.createComponent(CardContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.querySelector('fe-card[appearance="outlined"]')).toBeTruthy()
    expect(el.querySelector('fe-card[appearance="filled"]')).toBeTruthy()
    expect(el.querySelector('fe-card[appearance="accent"]')).toBeTruthy()
  })

  it('renders card with header slot', () => {
    const fixture = TestBed.createComponent(CardContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    const header = el.querySelector('h4[slot="header"]')
    expect(header).toBeTruthy()
    expect(header.textContent).toBe('Card Title')
  })

  it('renders horizontal card', () => {
    const fixture = TestBed.createComponent(CardContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.querySelector('fe-card[orientation="horizontal"]')).toBeTruthy()
  })

  it('renders product-card inside', () => {
    const fixture = TestBed.createComponent(CardContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.querySelector('app-product-card')).toBeTruthy()
  })

  it('has block class', () => {
    const fixture = TestBed.createComponent(CardContainer)
    fixture.detectChanges()
    const el = fixture.nativeElement
    expect(el.querySelector('.card-container')).toBeTruthy()
  })
})
