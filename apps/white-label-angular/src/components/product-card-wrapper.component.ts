import { Component, Input } from '@angular/core'
import { NgComponentOutlet } from '@angular/common'
import { ProductCard } from './product-card.component'
import { injectComponentOverride } from '../bootstrap/init'

/**
 * Input surface any 'product-card' override must accept (shell card = reference impl).
 * Moved here from products-page so consumers only need the object input.
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
 * Consumer-facing host that hides the override plumbing (registry lookup +
 * component outlet + input mapping) behind a plain `<product-card [product]>`
 * element — Vue `<ProductCard>` template parity. Selector is the neutral
 * white-label key; impl selectors (`app-`/`fp-`) only name the dynamic host
 * tag created by the outlet.
 */
@Component({
  selector: 'product-card',
  imports: [NgComponentOutlet],
  template: `
    <ng-container
      [ngComponentOutlet]="card"
      [ngComponentOutletInputs]="cardInputs()"
    />
  `,
  styles: `
    :host {
      display: contents;
    }
  `,
})
export class ProductCardWrapper {
  /** Shell default unless tenant registers 'product-card' override */
  readonly card = injectComponentOverride('product-card', ProductCard)

  /**
   * Classic @Input (not signal input): unit-test pipeline externalizes bare
   * `white-label-angular/*` imports → JIT at runtime → JIT only reads @Component
   * metadata, so signal inputs would be invisible and `[product]` would fall
   * through to a DOM property (NG0950). See AGENTS gotcha.
   */
  @Input({ required: true }) product!: ProductCardInputs

  /** Single typed boundary for the loosely-typed ngComponentOutletInputs */
  readonly cardInputs = (): ProductCardInputs & Record<string, unknown> => ({
    id: this.product.id,
    title: this.product.title,
    description: this.product.description,
    image: this.product.image,
    imageFamily: this.product.imageFamily,
    price: this.product.price,
    previousPrice: this.product.previousPrice,
    rate: this.product.rate,
  })
}
