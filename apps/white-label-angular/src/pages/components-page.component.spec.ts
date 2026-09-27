import { describe, it, expect, beforeEach } from 'vitest'
import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { ComponentsPage } from './components-page.component'

describe('ComponentsPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentsPage],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents()
  })

  it('renders', () => {
    const fixture = TestBed.createComponent(ComponentsPage)
    fixture.detectChanges()
    expect(fixture.componentInstance).toBeTruthy()
  })

  it('has components-page block class', () => {
    const fixture = TestBed.createComponent(ComponentsPage)
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('.components-page')).toBeTruthy()
  })

  it('renders all section headings', () => {
    const fixture = TestBed.createComponent(ComponentsPage)
    fixture.detectChanges()
    const el = fixture.nativeElement
    const headings = Array.from<Element>(el.querySelectorAll('.components-page__heading'))
    const texts = headings.map((h) => h.textContent?.trim())
    expect(texts).toContain('Button')
    expect(texts).toContain('Icon')
    expect(texts).toContain('Rating')
    expect(texts).toContain('Card')
  })

  it('renders correct number of sections', () => {
    const fixture = TestBed.createComponent(ComponentsPage)
    fixture.detectChanges()
    const sections = fixture.nativeElement.querySelectorAll('.components-page__section')
    expect(sections.length).toBe(2)
  })

  it('renders subsections for Icon and Rating', () => {
    const fixture = TestBed.createComponent(ComponentsPage)
    fixture.detectChanges()
    const subsections = fixture.nativeElement.querySelectorAll('.components-page__subsection')
    expect(subsections.length).toBe(2)
  })

  it('renders all four section headings', () => {
    const fixture = TestBed.createComponent(ComponentsPage)
    fixture.detectChanges()
    const headings = fixture.nativeElement.querySelectorAll('.components-page__heading')
    expect(headings.length).toBe(4)
  })
})
