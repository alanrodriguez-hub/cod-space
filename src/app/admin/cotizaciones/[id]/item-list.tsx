"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { QuoteResponseItem } from "@/lib/types";

export function ItemList({ items, quoteId }: { items: QuoteResponseItem[]; quoteId: string }) {
  const router = useRouter();

  async function removeItem(itemId: string) {
    const res = await fetch(`/api/quotes/${quoteId}/items?itemId=${itemId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      toast.error("Error al eliminar producto");
      return;
    }

    toast.success("Producto eliminado");
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        Aún no has agregado productos a esta cotización.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between border rounded-lg p-3"
        >
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm truncate">{item.product_name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {item.product_id && (
                <a
                  href={`/catalogo/${item.product_id}`}
                  className="text-xs text-primary hover:underline"
                >
                  Ver en catálogo
                </a>
              )}
              <Badge variant="outline" className="text-xs">
                x{item.quantity}
              </Badge>
              <span className="text-xs text-muted-foreground">
                ${(item.unit_price).toLocaleString("es-CL")} c/u
              </span>
              <span className="text-xs font-medium">
                = ${(item.quantity * item.unit_price).toLocaleString("es-CL")}
              </span>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive shrink-0"
            onClick={() => removeItem(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
