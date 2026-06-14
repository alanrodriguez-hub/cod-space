"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/cart-context";
import type { Product } from "@/lib/types";
import { toast } from "sonner";
import { useState } from "react";

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(price);
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [imgError, setImgError] = useState(false);

  return (
    <Card className="group overflow-hidden">
      <Link href={`/catalogo/${product.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {product.image_url && !imgError ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Sin imagen
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4 space-y-2">
        <div className="flex flex-wrap gap-1">
          {product.product_brands?.map((pb) => (
            <Badge key={pb.brand.id} variant="secondary" className="text-xs">{pb.brand.name}</Badge>
          ))}
          {product.product_car_models?.map((pm) => (
            <Badge key={pm.car_model.id} variant="outline" className="text-xs">{pm.car_model.name}</Badge>
          ))}
          {!product.product_brands?.length && !product.product_car_models?.length && product.brand && (
            <>
              <Badge variant="secondary" className="text-xs">{product.brand}</Badge>
              {product.car_model && <Badge variant="outline" className="text-xs">{product.car_model}</Badge>}
            </>
          )}
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
