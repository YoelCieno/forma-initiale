import { describe, it, expect, beforeEach } from 'vitest'
import { Component, input, provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { ProductCardWrapper, type ProductCardInputs } from './product-card-wrapper.component'
import { COMPONENT_OVERRIDES } from '../bootstrap/init'

const product: ProductCardInputs = {
  id: 'p1',
  title: 'Vue',
  description: 'Progressive framework',
  image: 'vuejs',
  imageFamily: 'brands',
  price: 'Free',
  previousPrice: '$9',
  rate: 4.5,
}

@Component({
  template: `<product-card [product]="product" />`,
  imports: [ProductCardWrapper],
})
class WrapperHost {
  readonly product = product
}

@Component({
  template: `
    <div class="grid">
      <product-card [product]="product" />
      <product-card [product]="product" />
    </div>
  `,
  imports: [ProductCardWrapper],
})
class GridHost {
  readonly product = product
}

@Component({
  selector: 'dummy-product-card',
  template: `<span
    class="dummy-card"
    [attr.data-id]="id()"
    [attr.data-title]="title()"
    [attr.data-description]="description()"
    [attr.data-image]="image()"
    [attr.data-image-family]="imageFamily()"
    [attr.data-price]="price()"
    [attr.data-previous-price]="previousPrice()"
    [attr.data-rate]="rate()"
  ></span>`,
})
class DummyProductCard {
  readonly id = input.required<string>()
  readonly title = input('')
  readonly description = input('')
  readonly image = input('')
  readonly imageFamily = input('')
  readonly price = input('')
  readonly previousPrice = input<string | undefined>(undefined)
  readonly rate = input(0)
}

const settle = async (fixture: { detectChanges: () => void; whenStable: () => Promise<unknown> }) => {
  fixture.detectChanges()
  await fixture.whenStable()
  // outlet applies setInput on later microtasks (zoneless)
  await Promise.resolve()
  await Promise.resolve()
  fixture.detectChanges()
}

describe('ProductCardWrapper', () => {
  beforeEach(() => {
    TestBed.resetTestingModule()
  })

  const setup = async (overrides?: Record<string, unknown>) => {
    await TestBed.configureTestingModule({
      imports: [WrapperHost],
      providers: [
        provideZonelessChangeDetection(),
        ...(overrides ? [{ provide: COMPONENT_OVERRIDES, useValue: overrides }] : []),
      ],
    }).compileComponents()
    return TestBed.createComponent(WrapperHost)
  }

  it('renders neutral product-card host around the card', async () => {
    const fixture = await setup()
    await settle(fixture as never)
    const host = fixture.nativeElement.querySelector('product-card')
    expect(host).toBeTruthy()
  })

  it('registry empty: renders shell ProductCard (app-product-card)', async () => {
    const fixture = await setup()
    await settle(fixture as never)
    const el = fixture.nativeElement
    expect(el.querySelectorAll('app-product-card').length).toBe(1)
    expect(el.textContent).toContain('Vue')
  })

  it('consumer shape: grid children are product-card hosts', async () => {
    await TestBed.configureTestingModule({
      imports: [GridHost],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents()
    const fixture = TestBed.createComponent(GridHost)
    await settle(fixture as never)
    const grid = fixture.nativeElement.querySelector('.grid')
    expect(grid.children.length).toBe(2)
    for (const child of grid.children) {
      expect(child.tagName.toLowerCase()).toBe('product-card')
    }
    expect(grid.querySelectorAll('product-card > app-product-card').length).toBe(2)
  })

  it('tenant override registered: renders tenant card, no shell card', async () => {
    const fixture = await setup({ 'product-card': DummyProductCard })
    await settle(fixture as never)
    const el = fixture.nativeElement
    expect(el.querySelectorAll('dummy-product-card').length).toBe(1)
    expect(el.querySelectorAll('app-product-card').length).toBe(0)
  })

  it('forwards product inputs to the rendered card', async () => {
    const fixture = await setup({ 'product-card': DummyProductCard })
    await settle(fixture as never)
    const card = fixture.nativeElement.querySelector('dummy-product-card .dummy-card')
    expect(card.getAttribute('data-id')).toBe('p1')
    expect(card.getAttribute('data-title')).toBe('Vue')
    expect(card.getAttribute('data-price')).toBe('Free')
    expect(card.getAttribute('data-rate')).toBe('4.5')
  })
})
