/**
 * Input surface any 'product-card' override must accept (shell card = reference impl).
 * `type` not `interface`: implicit index signature makes it assignable to pick's
 * `Record<string, unknown>` param — interfaces are NOT assignable to it.
 */
export type ProductCardInputs = {
  id: string
  title: string
  description: string
  image: string
  imageFamily: string
  price: string
  previousPrice?: string
  rate: number
}

/** Keys forwarded to the rendered card — drives pick() in ComponentOverride.payload(). */
export const PRODUCT_CARD_INPUT_KEYS = [
  'id',
  'title',
  'description',
  'image',
  'imageFamily',
  'price',
  'previousPrice',
  'rate',
] as const satisfies readonly (keyof ProductCardInputs)[]
