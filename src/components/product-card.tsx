"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/cart-context";
import type { Product } from "@/lib/types";
import { toast } from "sonner";

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(price);
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <Card className="group overflow-hidden">
      <Link href={`/catalogo/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Sin imagen
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4 space-y-2">
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-xs">{product.brand}</Badge>
          <Badge variant="outline" className="text-xs">{product.car_model}</Badge>
        </div>
        <Link href={`/catalogo/${product.id}`}>
          <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between pt-1">
          <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
          <Button
            size="sm"
            onClick={() => {
              addItem(product);
              toast.success("Agregado al carrito");
            }}
            disabled={product.stock <= 0}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        </div>
        {product.stock <= 0 && (
          <p className="text-xs text-destructive">Sin stock</p>
        )}
      </CardContent>
    </Card>
  );
}
