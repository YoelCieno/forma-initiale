import { Component, CUSTOM_ELEMENTS_SCHEMA, input } from '@angular/core'
import '@repo/ui/fe-card'
import '@repo/ui/fe-img'
import '@repo/ui/fe-rating'
import { getProductImageUrl } from '@repo/infra'
import { FePropertyShimDirective } from 'white-label-angular/fe-property-shim'

/**
 * Tenant ProductCard override — photo card parity with
 * `fake-plants-{FW}/src/components/{component}.{ext}`.
 * Registered under 'product-card' in main.ts.
 * Input surface matches the shell ProductCard (see ProductCardInputs).
 */
@Component({
  selector: 'fp-product-card',
  imports: [FePropertyShimDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <fe-card class="fp-product-card">
      <fe-img
        slot="media"
        class="fp-product-card__image"
        [src]="imageUrl()"
        [alt]="title()"
        [cacheKey]="id()"
      ></fe-img>
      <header slot="header" class="fp-product-card__header">
        <h2 class="fp-product-card__title">{{ title() }}</h2>
        <strong>{{ price() }}</strong>
      </header>
      <p class="fp-product-card__description">{{ description() }}</p>
      <div slot="footer" class="fp-product-card__footer">
        <fe-rating [value]="rate()" [readonly]="true" class="fp-product-card__rating"></fe-rating>
      </div>
    </fe-card>
  `,
  styles: `
    .fp-product-card__image {
      width: 100%;
      object-fit: cover;
    }
    .fp-product-card__title {
      margin: 0;
      font-size: var(--fs-xl);
      line-height: 1.5rem;
      word-spacing: 100vw;
    }
    .fp-product-card__header {
      display: flex;
      justify-content: space-between;
      align-self: center;
      min-height: 50px;
    }
    .fp-product-card__description {
      color: var(--color-text-muted);
      font-size: var(--fs-s);
      margin: 0;
      min-height: 2.7rem;
    }
    .fp-product-card__footer {
      display: flex;
      justify-content: flex-end;
      align-items: flex-end;
    }
  `,
})
export class FpProductCard {
  readonly id = input.required<string>()
  readonly title = input('')
  readonly description = input('')
  readonly image = input('')
  readonly imageFamily = input('')
  readonly price = input('')
  readonly previousPrice = input<string | undefined>(undefined)
  readonly rate = input(0)

  readonly imageUrl = (): string => getProductImageUrl(this.id())
}
