"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Category, Brand, CarModel } from "@/lib/types";
import { useState } from "react";
import { Search, X } from "lucide-react";

interface Props {
  categories: Category[];
  brands: Brand[];
  carModels: CarModel[];
  currentCategory?: string;
  currentBrand?: string;
  currentModel?: string;
}

export function AdminProductFilters({ categories, brands, carModels, currentCategory, currentBrand, currentModel }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [modelSearch, setModelSearch] = useState(currentModel || "");

  function updateFilter(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/admin/productos?${params.toString()}`);
  }

  function clearFilters() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("brand");
    params.delete("model");
    params.delete("page");
    router.push(`/admin/productos?${params.toString()}`);
    setModelSearch("");
  }

  const hasFilters = currentCategory || currentBrand || currentModel;

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-48">
        <Select value={currentCategory || "__todas_categorias__"} onValueChange={(v) => updateFilter("category", v === "__todas_categorias__" ? undefined : v)}>
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__todas_categorias__">Todas las categorías</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-48">
        <Select value={currentBrand || "__todas_marcas__"} onValueChange={(v) => updateFilter("brand", v === "__todas_marcas__" ? undefined : v)}>
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="Todas las marcas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__todas_marcas__">Todas las marcas</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <form
        className="flex gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          updateFilter("model", modelSearch || undefined);
        }}
      >
        <Input
          placeholder="Modelo de auto..."
          value={modelSearch}
          onChange={(e) => setModelSearch(e.target.value)}
          className="w-44 text-sm"
        />
        <Button type="submit" size="icon" variant="secondary">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" /> Limpiar
        </Button>
      )}
    </div>
  );
}
