import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core'
import '@repo/ui/fe-async-content'
import '@repo/ui/fe-loader'
import { ProductCard } from '../components/product-card.component'
import { ProductsService } from '../services/products.service'

@Component({
  selector: 'app-products-page',
  imports: [ProductCard],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="products-page">
      <h1 class="products-page__title">List of Products</h1>
      <fe-async-content [loading]="loading()" [error]="error()">
        <fe-loader slot="loading"></fe-loader>
        <p slot="error" class="products-page__error">{{ error() }}</p>
        <div class="products-page__grid">
          @for (product of products(); track product.id) {
            <app-product-card
              [id]="product.id"
              [title]="product.title"
              [description]="product.description"
              [image]="product.image"
              [imageFamily]="product.imageFamily"
              [price]="product.price"
              [previousPrice]="product.previousPrice"
              [rate]="product.rate"
            ></app-product-card>
          }
        </div>
      </fe-async-content>
    </div>
  `,
  styles: `
    .products-page {
      max-width: 75rem;
      margin: 0 auto;
      padding: 0 1rem 1rem;
    }
    .products-page__title {
      font-size: var(--fs-xl);
      margin-bottom: 1.5rem;
    }
    .products-page__error {
      padding: 1rem;
      text-align: center;
      color: var(--color-error);
    }
    .products-page__grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }
  `,
})
export class ProductsPage {
  private readonly catalog = inject(ProductsService)

  readonly products = this.catalog.items
  readonly loading = this.catalog.loading
  readonly error = this.catalog.error
}
