import { computed, inject, resource, Service } from '@angular/core'
import { getProducts } from '@repo/infra'
import { toProductViewList, type ProductView } from '@repo/presenters'
import { APP_ENV, META_MAP_INJECTION_KEY } from '../bootstrap/init'

@Service()
export class ProductsService {
  private readonly metaMap = inject(META_MAP_INJECTION_KEY, { optional: true })
  private readonly env = inject(APP_ENV)

  private readonly catalog = resource({
    loader: async () => {
      const { data } = await getProducts({ baseUrl: this.env.apiUrl, tenantId: this.env.tenantId })
      return toProductViewList(data, this.metaMap ?? undefined)
    },
  })
  readonly reload = () => this.catalog.reload()

  readonly items = computed((): ProductView[] => this.catalog.value() ?? [])
  readonly error = computed(() => {
    const e = this.catalog.error()
    return e ? e.message : undefined
  })

  readonly loading = this.catalog.isLoading
  readonly hasValue = this.catalog.hasValue
}
