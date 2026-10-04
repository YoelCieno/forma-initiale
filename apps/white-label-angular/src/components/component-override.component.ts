import {
  Component,
  ElementRef,
  Input,
  inject,
  type OnChanges,
  type SimpleChanges,
  type Type,
} from '@angular/core'
import { NgComponentOutlet } from '@angular/common'
import { ProductCard } from './product-card.component'
import { injectComponentOverride } from '../bootstrap/init'

/**
 * Input surface any 'product-card' override must accept (shell card = reference impl).
 * Moved here from the deleted product-card wrapper module.
 */
export interface ProductCardInputs {
  id: string
  title: string
  description: string
  image: string
  imageFamily: string
  price: string
  previousPrice?: string
  rate: number
}

/**
 * Shell fallbacks keyed by consumer tag (host localName). Grows with future
 * overrideable hosts: 'product-card, wl-header, ...'.
 */
const OVERRIDE_FALLBACKS: Record<string, Type<unknown>> = {
  'product-card': ProductCard,
} satisfies Record<string, Type<unknown>>

/**
 * Consumer-facing host that hides the override plumbing (registry lookup +
 * component outlet + input mapping) behind a plain `<product-card [product]>`
 * element. Key = host element itself: `localName` doubles as the registry key,
 * no key input needed.
 */
@Component({
  // future growth: 'product-card, wl-header, ...'
  selector: 'product-card',
  imports: [NgComponentOutlet],
  template: `
    <ng-container [ngComponentOutlet]="resolved()" [ngComponentOutletInputs]="payload()" />
  `,
  styles: `:host { display: contents; }`,
})
export class ComponentOverride implements OnChanges {
  /** Host tag = registry key ('component-tag') */
  private readonly localName: string = inject(ElementRef).nativeElement.localName

  /** Resolved ONCE eagerly — constructor is an injection context */
  private readonly resolvedComponent: Type<unknown> = injectComponentOverride(
    this.localName,
    OVERRIDE_FALLBACKS[this.localName],
  )

  /**
   * Classic @Input (not a signal input): unit-test pipeline externalizes bare
   * `white-label-angular/*` imports → JIT at runtime → JIT only reads @Component
   * metadata, so signal inputs would be invisible and `[product]` would fall
   * through to a DOM property (NG0950). AGENTS gotcha #17.
   */
  @Input() product?: ProductCardInputs

  /** First changed input's current value (selector guarantees one input per instance) */
  private payloadValue?: ProductCardInputs

  ngOnChanges(changes: SimpleChanges): void {
    const [firstChange] = Object.values(changes)
    if (firstChange) {
      this.payloadValue = firstChange.currentValue
    }
  }

  /** Stored resolution — computed once in constructor, returned as-is */
  readonly resolved = (): Type<unknown> => this.resolvedComponent

  /**
   * Forwards only the `ProductCardInputs` surface — consumer objects may carry
   * extra fields (e.g. Product.name) and NgComponentOutlet setInput throws
   * NG0303 on keys the target does not declare as inputs.
   * Throws at render when no payload input was bound (guard, not silent empty render).
   */
  readonly payload = (): ProductCardInputs & Record<string, unknown> => {
    const current = this.payloadValue
    if (current === undefined) {
      throw new Error(`Missing 'input' payload input on <${this.localName}>`)
    }
    return {
      id: current.id,
      title: current.title,
      description: current.description,
      image: current.image,
      imageFamily: current.imageFamily,
      price: current.price,
      previousPrice: current.previousPrice,
      rate: current.rate,
    }
  }
}
