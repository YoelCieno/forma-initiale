/**
 * Returns a deterministic loremflickr image URL for a product.
 * Uses djb2 hash of product ID for collision-resistant seed.
 *
 * Why seed? loremflickr `?seed=` returns the same image for the same value.
 * `?random=` gives a different image every request — no persistence.
 * Seed approach: each product gets a unique, stable image across visits.
 */
export const getProductImageUrl = (productId: string): string => {
  // djb2 hash — avoids collisions from simple charCode sum
  let hash = 0
  for (let i = 0; i < productId?.length; i++) {
    hash = (hash << 5) + productId.charCodeAt(i)
    hash >>>= 0
	}
  return `https://loremflickr.com/500/250/plant/all?seed=${hash}`
}
