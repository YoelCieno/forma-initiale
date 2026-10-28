import type { ProductMeta } from '@repo/presenters'

export const mirrorTenantMap: Record<string, ProductMeta> = {
  'mirror-tenant-alpha': {
    title: 'Alpha Primum',
    description: 'The first of its kind, a pioneering specimen',
    image: 'seedling',
    imageFamily: 'classic',
  },
  'mirror-tenant-beta': {
    title: 'Beta Secundus',
    description: 'Follows the pattern with distinct characteristics',
    image: 'leaf',
    imageFamily: 'classic',
  },
  'mirror-tenant-gamma': {
    title: 'Gamma Tertius',
    description: 'Completes the triad with unique properties',
    image: 'tree',
    imageFamily: 'classic',
  },
}
