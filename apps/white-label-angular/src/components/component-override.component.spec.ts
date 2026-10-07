import { describe, it, expect, beforeEach } from 'vitest'
import { Component, input, provideZonelessChangeDetection, ChangeDetectorRef } from '@angular/core'
import { TestBed, type ComponentFixture } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
// TDD RED: ./component-override.component (ComponentOverride) does NOT exist yet.
// This spec must fail to compile/run until the SUT is implemented (GREEN phase).
import { ComponentOverride } from './component-override.component'
import { type ProductCardInputs } from './product-card.model'
import { COMPONENT_OVERRIDES } from '../bootstrap/init'

/**
 * NOTE for implementer: ComponentOverride MUST use classic `@Input` for
 * `product` — NOT a signal `input()`. Unit-test pipeline externalizes bare
 * `white-label-angular/*` imports → JIT at runtime → JIT only reads @Component
 * metadata, so signal inputs would be invisible and `[product]` would fall
 * through to a DOM property (NG0950). Tenant tests consume the SUT via package
 * specifier (JIT), shell relative imports stay AOT — classic @Input is safe on
 * both paths. AGENTS gotcha #17.
 */

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
  imports: [ComponentOverride],
})
class OverrideHost {
  readonly product = product
}

@Component({
  template: `
    <div class="grid">
      <product-card [product]="product" />
      <product-card [product]="product" />
    </div>
  `,
  imports: [ComponentOverride],
})
class GridHost {
  readonly product = product
}

/** No [product] binding at all — guard must throw loudly at render, not render empty. */
@Component({
  template: `<product-card />`,
  imports: [ComponentOverride],
})
class MissingPayloadHost {}

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

/** ComponentOverride instance behind a <product-card> host — SUT access for `payload()`. */
const overrideInstance = (fixture: ComponentFixture<unknown>): ComponentOverride => {
  const el = fixture.debugElement.query(By.directive(ComponentOverride))
  if (el === null) throw new Error('ComponentOverride instance not found')
  return el.componentInstance
}

describe('ComponentOverride', () => {
  beforeEach(() => {
    TestBed.resetTestingModule()
  })

  const setup = async (overrides?: Record<string, unknown>) => {
    await TestBed.configureTestingModule({
      imports: [OverrideHost],
      providers: [
        provideZonelessChangeDetection(),
        ...(overrides ? [{ provide: COMPONENT_OVERRIDES, useValue: overrides }] : []),
      ],
    }).compileComponents()
    return TestBed.createComponent(OverrideHost)
  }

  // ── ported from product-card-wrapper.component.spec.ts ────────────────

  it('renders neutral product-card host around the card', async () => {
    const fixture = await setup()
    await settle(fixture as never)
    const host = fixture.nativeElement.querySelector('product-card')
    expect(host).toBeTruthy()
  })

  it('display: contents — host contributes no box (override plumbing invisible)', async () => {
    const fixture = await setup()
    await settle(fixture as never)
    const host = fixture.nativeElement.querySelector('product-card')
    expect(host).toBeTruthy()
    expect(getComputedStyle(host).display).toBe('contents')
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

  // ── new scenarios ─────────────────────────────────────────────────────

  it('element-key resolution: accessor called with host localName, no key input', async () => {
    // Proxy records every key the registry accessor (injectComponentOverride)
    // reads off COMPONENT_OVERRIDES — proves the key is the host tag itself.
    const accessed: string[] = []
    const recordingOverrides = new Proxy<Record<string, unknown>>(
      { 'product-card': DummyProductCard },
      {
        get: (target, key) => {
          if (typeof key === 'string') accessed.push(key)
          return Reflect.get(target, key)
        },
      },
    )
    const fixture = await setup(recordingOverrides)
    await settle(fixture as never)
    expect(accessed).toContain('product-card')
    // resolution worked WITHOUT any key input — tag is the registry key
    expect(fixture.nativeElement.querySelectorAll('dummy-product-card').length).toBe(1)
  })

  it('missing payload: throws loudly at render instead of silent empty render', async () => {
    await TestBed.configureTestingModule({
      imports: [MissingPayloadHost],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents()
    const fixture = TestBed.createComponent(MissingPayloadHost)
    // guard contract: thrown Error message must reference the missing
    // `product` input (or "payload") — see assumptions in report
    expect(() => fixture.detectChanges()).toThrowError(/product|payload/i)
  })

  it('selector contract: consumer tag stays product-card, never component-override', async () => {
    const fixture = await setup()
    await settle(fixture as never)
    const el = fixture.nativeElement
    expect(el.querySelector('product-card')).toBeTruthy()
    expect(el.querySelectorAll('product-card > app-product-card').length).toBe(1)
    // regression guard against reverting to the rejected generic-element design
    expect(el.querySelectorAll('component-override').length).toBe(0)
  })

  // ── payload memoization ──────────────────────────────────────────────

  describe('payload memoization', () => {
    /** Picked payload of the changed input — exactly the slot keys, no more. */
    const pickedProductV2: ProductCardInputs = {
      ...product,
      id: 'p2',
      title: 'Angular',
      description: 'Platform for mobile and desktop',
      image: 'angular',
      price: 'Enterprise',
      previousPrice: '$99',
      rate: 4.9,
    }

    /** Consumer object carries an extra field — payload() must NOT leak `name`. */
    const productV2 = { ...pickedProductV2, name: 'Angular framework' }

    it('stable reference across change-detection passes', async () => {
      const fixture = await setup()
      await settle(fixture as never)
      const instance = overrideInstance(fixture)
      const first = instance.payload()
      await settle(fixture as never)
      const second = instance.payload()
      expect(second).toBe(first)
    })

    it('new reference after input changes', async () => {
      const fixture = await setup()
      await settle(fixture as never)
      const instance = overrideInstance(fixture)
      const before = instance.payload()

      // host field is readonly (template-bound) — widen to rebind between CD passes
      const host: { product: ProductCardInputs } = fixture.componentInstance
      host.product = productV2
      // zoneless: plain-field mutation schedules no CD — dirty-mark the HOST component's
      // view (fixture.componentRef.changeDetectorRef is the ROOT view; refreshing it
      // skips this host's template unless the host view itself is flagged)
      fixture.componentRef.injector.get(ChangeDetectorRef).markForCheck()
      await settle(fixture as never)
      const after = instance.payload()

      expect(after).not.toBe(before)
      expect(after).toEqual(pickedProductV2)
      expect(after).not.toHaveProperty('name')
      // memo must not mutate the previously captured snapshot
      expect(before).toEqual(product)
    })
  })
})
