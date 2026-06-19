"use client";

import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/types";

export function ProductCardWrapper({ product }: { product: Product }) {
  return <ProductCard product={product} />;
}
