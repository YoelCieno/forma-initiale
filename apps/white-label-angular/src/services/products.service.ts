import { computed, Injectable, inject, resource } from '@angular/core'
import { getProducts } from '@repo/infra'
import { environment } from '../environments/environment'
import { toProductViewList, type ProductView } from '@repo/presenters'
import { META_MAP_INJECTION_KEY } from '../bootstrap/init'

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly metaMap = inject(META_MAP_INJECTION_KEY, { optional: true })

  private readonly catalog = resource({
    loader: async () => {
      const { data } = await getProducts({ baseUrl: environment.apiUrl, tenantId: environment.tenantId })
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
