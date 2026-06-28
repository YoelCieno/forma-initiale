import type { Product } from '@repo/domain'

export interface ProductView {
  name: string
  title: string
  description: string
  image: string
  imageFamily: string
  previousPrice?: string
  price: string
  rate: number
}

export interface ProductMeta {
  title: string
  description: string
  image: string
  imageFamily: string
}


export function toProductView(product: Product, metaMap?: Record<string, ProductMeta>): ProductView {
  const override = metaMap?.[product.name]
  const fallback = { title: product.name, description: '', image: 'code', imageFamily: 'classic' }
  const meta = override ?? fallback

  return {
    name: product.name,
    title: meta.title,
    description: meta.description,
    image: meta.image,
    imageFamily: meta.imageFamily,
    previousPrice: product.previousPrice ? `$${product.previousPrice}` : undefined,
    price: product.price ? `$${product.price}` : 'Free',
    rate: product.rate,
  }
}

export function toProductViewList(products: Product[], metaMap?: Record<string, ProductMeta>): ProductView[] {
  return products.map(p => toProductView(p, metaMap))
}
