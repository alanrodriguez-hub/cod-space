"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { Category } from "@/lib/types";
import { useState } from "react";
import { Search, X } from "lucide-react";

interface Props {
  categories: Category[];
  brands: string[];
  currentCategory?: string;
  currentBrand?: string;
  currentModel?: string;
  currentQuery?: string;
}

export function CatalogoFilters({ categories, brands, currentCategory, currentBrand, currentModel, currentQuery }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [model, setModel] = useState(currentModel || "");

  function updateFilter(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/catalogo?${params.toString()}`);
  }

  function clearFilters() {
    router.push("/catalogo");
    setModel("");
  }

  const hasFilters = currentCategory || currentBrand || currentModel || currentQuery;

  return (
    <div className="space-y-6">
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full">
          <X className="h-4 w-4 mr-1" /> Limpiar filtros
        </Button>
      )}

      <div>
        <Label className="text-sm font-semibold mb-3 block">Categoría</Label>
        <div className="space-y-1">
          <button
            onClick={() => updateFilter("category", undefined)}
            className={`block w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${!currentCategory ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFilter("category", cat.slug)}
              className={`block w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${currentCategory === cat.slug ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <Label className="text-sm font-semibold mb-3 block">Marca</Label>
        <div className="space-y-1">
          <button
            onClick={() => updateFilter("brand", undefined)}
            className={`block w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${!currentBrand ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            Todas
          </button>
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => updateFilter("brand", brand)}
              className={`block w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${currentBrand === brand ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <Label className="text-sm font-semibold mb-3 block">Modelo de auto</Label>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateFilter("model", model || undefined);
          }}
          className="flex gap-2"
        >
          <Input
            placeholder="Ej: Toyota Corolla"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="text-sm"
          />
          <Button type="submit" size="icon" variant="secondary">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
