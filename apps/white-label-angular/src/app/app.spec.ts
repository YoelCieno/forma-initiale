import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { App } from './app'

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents()
  })

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App)
    const app = fixture.componentInstance
    expect(app).toBeTruthy()
  })

  it('should render router-outlet', async () => {
    const fixture = TestBed.createComponent(App)
    await fixture.whenStable()
    const compiled = fixture.nativeElement
    expect(compiled.querySelector('router-outlet')).toBeTruthy()
  })

  it('should render nav with router links', async () => {
    const fixture = TestBed.createComponent(App)
    await fixture.whenStable()
    const compiled = fixture.nativeElement
    const nav = compiled.querySelector('nav')
    expect(nav).toBeTruthy()
    const links = nav.querySelectorAll('a')
    expect(links.length).toBe(2)
    expect(links[0].textContent?.trim()).toBe('Products')
    expect(links[1].textContent?.trim()).toBe('Components')
  })
})
