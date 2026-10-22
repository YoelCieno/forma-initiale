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
import { object } from '@repo/utils/object'
import { ProductCard } from './product-card.component'
import { injectComponentOverride } from '../bootstrap/init'
import { PRODUCT_CARD_INPUT_KEYS, type ProductCardInputs } from './product-card.model'

const { pick } = object()

/** Per-slot wiring: shell fallback component + input keys forwarded to it. */
type SlotConfig = { fallback: Type<unknown>; inputKeys: readonly string[] }

/**
 * Merged slot registry keyed by consumer tag (host localName) — fallback
 * component + payload keys in one lookup. Grows with future overrideable
 * hosts: 'product-card, wl-header, ...'.
 */
const SLOTS: Record<string, SlotConfig> = {
  'product-card': { fallback: ProductCard, inputKeys: PRODUCT_CARD_INPUT_KEYS },
} satisfies Record<string, SlotConfig>

/** Registry lookup guard — unknown host tag fails loudly, never silently. */
const resolveSlot = (name: string): SlotConfig => {
  const slot = SLOTS[name]
  if (slot === undefined) {
    throw new Error(`Unknown override slot: '${name}' — add selector + SLOTS entry`)
  }
  return slot
}

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

  /** Merged registry entry for this host tag — unknown slot throws in constructor */
  private readonly slot: SlotConfig = resolveSlot(this.localName)

  /** Resolved ONCE eagerly — constructor is an injection context */
  private readonly resolvedComponent: Type<unknown> = injectComponentOverride(
    this.localName,
    this.slot.fallback,
  )

  /**
   * Classic @Input (not a signal input): unit-test pipeline externalizes bare
   * `white-label-angular/*` imports → JIT at runtime → JIT only reads @Component
   * metadata, so signal inputs would be invisible and `[product]` would fall
   * through to a DOM property (NG0950). AGENTS gotcha #17.
   */
  @Input() product?: ProductCardInputs

  /**
   * Memoized slot-picked payload — recomputed in ngOnChanges only when the
   * `product` input changes (undefined value clears it, keeping the
   * descriptive missing-payload throw above a TypeError inside pick()).
   */
  private payloadRecord?: Record<string, unknown>

  ngOnChanges(changes: SimpleChanges): void {
    const [firstChange] = Object.values(changes)
    if (firstChange) {
      const value: ProductCardInputs | undefined = firstChange.currentValue
      this.payloadRecord = value ? pick(value, this.slot.inputKeys) : undefined
    }
  }

  /** Stored resolution — computed once in constructor, returned as-is */
  readonly resolved = (): Type<unknown> => this.resolvedComponent

  /**
   * Memoized in ngOnChanges — stable reference between input changes, so no
   * re-pick per view check (no per-check allocation). Forwards only the keys
   * declared for this slot in the registry — consumer objects may carry extra
   * fields (e.g. Product.name) and NgComponentOutlet setInput throws NG0303 on
   * keys the target does not declare as inputs.
   * Throws at render when no payload input was bound (guard, not silent empty render).
   */
  readonly payload = (): Record<string, unknown> => {
    if (!this.payloadRecord) {
      throw new Error(`Missing payload input on <${this.localName}>`)
    }
    return this.payloadRecord
  }
}
