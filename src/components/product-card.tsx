"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  // Get display brand and model cleanly for a minimalist text layout
  const brandName = product.product_brands?.[0]?.brand?.name || product.brand || "";
  const modelName = product.product_car_models?.[0]?.car_model?.name || product.car_model || "";

  return (
    <div className="group flex flex-col space-y-2.5 bg-transparent border-none">
      <Link href={`/catalogo/${product.id}`} className="block relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
        {product.image_url && !imgError ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-103"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground/60 font-medium bg-muted">
            Sin imagen
          </div>
        )}
        {product.stock <= 0 && (
          <div className="absolute top-2 right-2 bg-destructive/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Sin stock
          </div>
        )}
      </Link>

      <div className="flex-1 flex flex-col space-y-1">
        {(brandName || modelName) && (
          <p className="text-[10px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
            {brandName} {modelName ? `· ${modelName}` : ""}
          </p>
        )}
        {product.sku && (
          <p className="text-[10px] font-mono text-muted-foreground/60">SKU: {product.sku}</p>
        )}
        
        <Link href={`/catalogo/${product.id}`} className="block flex-1">
          <h3 className="text-sm font-medium leading-snug text-foreground line-clamp-2 hover:text-primary transition-colors duration-200">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-bold text-foreground">{formatPrice(product.price)}</span>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 px-3 rounded-full text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            onClick={() => {
              addItem(product);
              toast.success("Agregado al carrito");
            }}
            disabled={product.stock <= 0}
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1" />
            Añadir
          </Button>
        </div>
      </div>
    </div>
  );
}
