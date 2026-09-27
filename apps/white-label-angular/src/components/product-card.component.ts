import { CUSTOM_ELEMENTS_SCHEMA, Component, input } from '@angular/core'
import '@repo/ui/fe-card'
import '@repo/ui/fe-icon'
import '@repo/ui/fe-rating'
import { FePropertyShimDirective } from './fe-property-shim.directive'

@Component({
  imports: [FePropertyShimDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-product-card',
  template: `
    <fe-card class="product-card">
      <fe-icon
        slot="media"
        [name]="image()"
        [family]="imageFamily()"
        class="product-card__icon"
      ></fe-icon>
      <h2 slot="header" class="product-card__title">{{ title() }}</h2>
      <p class="product-card__description">{{ description() }}</p>
      <div slot="footer" class="product-card__footer">
        <fe-rating [value]="rate()" [readonly]="true" class="product-card__rating"></fe-rating>
        <div class="product-card__pricing">
          @if (previousPrice()) {
            <span class="product-card__price--previous">{{ previousPrice() }}</span>
          }
          <strong class="product-card__price">{{ price() }}</strong>
        </div>
      </div>
    </fe-card>
  `,
  styles: `
    .product-card {
      display: grid;
    }
    .product-card__icon {
      font-size: 4.75rem;
      display: flex;
      place-content: center;
      padding-top: 1.5rem;
    }
    .product-card__title {
      margin: 0;
      font-size: var(--fs-l);
    }
    .product-card__description {
      color: var(--color-text-muted);
      font-size: var(--fs-s);
      margin: 0;
      min-height: 2.7rem;
    }
    .product-card__footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    .product-card__pricing {
      text-align: right;
    }
    .product-card__price {
      font-size: var(--fs-m);
      font-weight: 600;
    }
    .product-card__price--previous {
      display: block;
      text-decoration: line-through;
      font-size: var(--fs-s);
      color: var(--color-text-muted);
    }
  `,
})
export class ProductCard {
  readonly id = input.required<string>()
  readonly price = input.required<string>()
  readonly title = input('')
  readonly description = input('')
  readonly image = input('')
  readonly imageFamily = input('')
  readonly previousPrice = input<string | undefined>(undefined)
  readonly rate = input(0)
}
