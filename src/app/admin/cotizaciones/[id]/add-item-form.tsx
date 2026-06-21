"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ProductOption {
  id: string;
  name: string;
  brand: string;
  car_model: string;
}

export function AddItemForm({ quoteId, products }: { quoteId: string; products: ProductOption[] }) {
  const router = useRouter();
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState("");
  const [productId, setProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  function handleSearch(value: string) {
    setProductName(value);
    setProductId(null);
    setShowSuggestions(value.trim().length > 0);

    const exact = products.find(
      (p) => p.name.toLowerCase() === value.toLowerCase()
    );
    if (exact) {
      setProductId(exact.id);
    }
  }

  function selectProduct(p: ProductOption) {
    setProductName(p.name);
    setProductId(p.id);
    setShowSuggestions(false);
  }

  const suggestions = productName.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(productName.toLowerCase()) ||
          p.brand.toLowerCase().includes(productName.toLowerCase()) ||
          p.car_model.toLowerCase().includes(productName.toLowerCase())
      ).slice(0, 8)
    : [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!productName.trim() || !unitPrice) {
      toast.error("Completa nombre del producto y precio");
      return;
    }

    setLoading(true);

    const res = await fetch(`/api/quotes/${quoteId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: productId,
        product_name: productName.trim(),
        quantity,
        unit_price: parseFloat(unitPrice),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      toast.error("Error al agregar producto");
      return;
    }

    toast.success("Producto agregado");
    setProductName("");
    setQuantity(1);
    setUnitPrice("");
    setProductId(null);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-3 bg-muted/20">
      <p className="text-sm font-medium">Agregar Producto</p>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={productName}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setShowSuggestions(productName.trim().length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Buscar producto del catálogo o escribir nombre..."
          className="pl-9"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 top-full left-0 right-0 mt-1 border rounded-lg bg-background shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map((p) => (
              <button
                key={p.id}
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors border-b last:border-0"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectProduct(p)}
              >
                <span className="font-medium">{p.name}</span>
                {(p.brand || p.car_model) && (
                  <span className="text-muted-foreground ml-1">
                    — {[p.brand, p.car_model].filter(Boolean).join(", ")}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Cantidad</Label>
          <Input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Precio Unitario ($)</Label>
          <Input
            type="number"
            min={0}
            step={10}
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <Button type="submit" size="sm" disabled={loading} className="cursor-pointer">
        <Plus className="h-4 w-4 mr-1" />
        {loading ? "Agregando..." : "Agregar"}
      </Button>
    </form>
  );
}
