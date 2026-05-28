import type { Product } from "@repo/domain";

export interface GetProductsResponse {
  data: Product[]
  total: number
}

export async function getProducts(): Promise<GetProductsResponse> {
  const baseUrl = import.meta.env.VITE_API_URL
  const response = await fetch(`${baseUrl}/products`);
  if (!response.ok) {
    throw new Error(`Failed to fetch products: HTTP ${response.status}`);
  }

  return response.json();
}
