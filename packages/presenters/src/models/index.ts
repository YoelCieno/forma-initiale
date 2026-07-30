export interface ProductView {
  id: string
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
