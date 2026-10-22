import { describe, it, expect, beforeEach } from 'vitest'
import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { AboutPage } from './about-page.component'

describe('AboutPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutPage],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents()
  })

  it('renders', () => {
    const fixture = TestBed.createComponent(AboutPage)
    fixture.detectChanges()
    expect(fixture.componentInstance).toBeTruthy()
  })

  it('has about-page block class', () => {
    const fixture = TestBed.createComponent(AboutPage)
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('.about-page')).toBeTruthy()
  })

  it('renders the tenant-specific title', () => {
    const fixture = TestBed.createComponent(AboutPage)
    fixture.detectChanges()
    const title = fixture.nativeElement.querySelector('.about-page__title')
    expect(title?.textContent?.trim()).toBe('About Fake Plants')
  })

  it('renders the explanation card inside a fe-card', () => {
    const fixture = TestBed.createComponent(AboutPage)
    fixture.detectChanges()
    const card = fixture.nativeElement.querySelector('.about-page__card')
    expect(card).toBeTruthy()
    expect(card?.textContent).toContain('forma-initiale')
    expect(card?.textContent).toContain('white-label platform')
  })
})
