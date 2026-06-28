import type { ProductMeta } from '@repo/presenters'

export const frameworkMap: Record<string, ProductMeta> = {
  vue: { title: 'Vue', description: 'Progressive framework for building UIs', image: 'vuejs', imageFamily: 'brands' },
  angular: { title: 'Angular', description: 'Platform for building mobile & desktop web apps', image: 'angular', imageFamily: 'brands' },
  react: { title: 'React', description: 'Library for building user interfaces', image: 'react', imageFamily: 'brands' },
  svelte: { title: 'Svelte', description: 'Cybernetically enhanced web apps', image: 'svelte', imageFamily: 'brands' },
  solid: { title: 'Solid', description: 'Reactive UI library', image: 'code', imageFamily: 'classic' },
}

