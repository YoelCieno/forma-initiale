import type { Product } from '@repo/domain'
import { ProductMeta, ProductView } from '../models'

export function toProductView(
  product: Product,
  metaMap?: Record<string, ProductMeta>,
): ProductView {
  const override = metaMap?.[product.name]
  const fallback = {
    title: product.name,
    description: '',
    image: 'code',
    imageFamily: 'classic',
	}

	const meta = override ?? fallback

  return {
		id: product.id,
    name: product.name,
    title: meta.title,
    description: meta.description,
    image: meta.image,
    imageFamily: meta.imageFamily,
    previousPrice: product.previousPrice
      ? `$${product.previousPrice}`
      : undefined,
    price: product.price ? `$${product.price}` : 'Free',
    rate: product.rate,
  }
}

export function toProductViewList(
  products: Product[],
  metaMap?: Record<string, ProductMeta>,
): ProductView[] {
  return products.map((p) => toProductView(p, metaMap))
}
