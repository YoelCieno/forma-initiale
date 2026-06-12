import type { Product } from '@repo/domain'

export interface ProductView {
  name: string
  title: string
  description: string
  logo: string
  logoFamily: string
  previousPrice?: string
  price: string
  rate: number
}

interface FrameworkMeta {
  title: string
  description: string
  logo: string
  logoFamily: string
}

const frameworkMap: Record<string, FrameworkMeta> = {
  vue: {
    title: 'Vue',
    description: 'Progressive framework for building UIs',
    logo: 'vuejs',
    logoFamily: 'brands',
  },
  angular: {
    title: 'Angular',
    description: 'Platform for building mobile & desktop web apps',
    logo: 'angular',
    logoFamily: 'brands',
  },
  react: {
    title: 'React',
    description: 'Library for building user interfaces',
    logo: 'react',
    logoFamily: 'brands',
  },
  svelte: {
    title: 'Svelte',
    description: 'Cybernetically enhanced web apps',
    logo: 'svelte',
    logoFamily: 'brands',
  },
  solid: {
    title: 'Solid',
    description: 'Reactive UI library',
    logo: 'code',
    logoFamily: 'classic',
  },
}

function getFrameworkMeta(name: string): FrameworkMeta {
	return frameworkMap[name] ?? {
		title: name,
		description: '',
		logo: 'code',
		logoFamily: 'classic'
	}
}

export function toProductView(product: Product): ProductView {
  const meta = getFrameworkMeta(product.name)

  return {
    name: product.name,
    title: meta.title,
    description: meta.description,
    logo: meta.logo,
    logoFamily: meta.logoFamily,
    previousPrice: product.previousPrice ? `$${product.previousPrice}` : undefined,
    price: product.price ? `$${product.price}` : 'Free',
    rate: product.rate,
  }
}

export function toProductViewList(products: Product[]): ProductView[] {
  return products.map(toProductView)
}
