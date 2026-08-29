import { inject, signal, OnInit } from '@angular/core'
import '@repo/ui/fe-async-content'
import '@repo/ui/fe-loader'
import { getProducts } from '@repo/infra'
import { toProductViewList, type ProductView } from '@repo/presenters'
import { META_MAP_INJECTION_KEY } from '../bootstrap/init'
import { feComponent } from '../factories/create-custom-elements'
import { ProductCard } from '../components/product-card.component'

@feComponent({
  selector: 'app-products-page',
  imports: [ProductCard],
  template: `
    <div class="products-page">
      <h1 class="products-page__title">List of Products</h1>

      <fe-async-content [attr.loading]="loading() ? '' : null" [attr.error]="error() ?? null">
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
export class ProductsPage implements OnInit {
  private readonly metaMap = inject(META_MAP_INJECTION_KEY, { optional: true })

  readonly products = signal<ProductView[]>([])
  readonly loading = signal(true)
  readonly error = signal<string | undefined>(undefined)

  async ngOnInit(): Promise<void> {
    try {
      const { data } = await getProducts()
      this.products.set(toProductViewList(data, this.metaMap ?? undefined))
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Failed to load products')
    } finally {
      this.loading.set(false)
    }
  }
}
