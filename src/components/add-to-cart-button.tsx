"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import type { Product } from "@/lib/types";
import { toast } from "sonner";

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem, items } = useCart();
  const cartItem = items.find((i) => i.product.id === product.id);
  const currentQty = cartItem?.quantity ?? 0;
  const atLimit = currentQty >= product.stock;

  return (
    <Button
      size="lg"
      className="w-full"
      disabled={product.stock <= 0 || atLimit}
      onClick={() => {
        addItem(product);
        toast.success(`${product.name} agregado al carrito`);
      }}
    >
      <ShoppingCart className="h-5 w-5 mr-2" />
      {atLimit ? "Stock máximo alcanzado" : "Agregar al Carrito"}
    </Button>
  );
}
