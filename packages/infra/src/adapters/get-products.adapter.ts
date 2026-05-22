import type { Product } from "@repo/domain";

export async function getProducts(): Promise<Product[]> {
  const response = await fetch("https://api.example.com/products");
  if (!response.ok) {
    throw new Error(`Failed to fetch products: HTTP ${response.status}`);
  }
  return response.json();
}
