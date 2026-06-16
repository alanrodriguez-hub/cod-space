"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    // Reset cursor when filtering to start from page 1
    params.delete("after");
    params.delete("before");
    router.push(`/catalogo?${params.toString()}`);
  }

  function clearFilters() {
    router.push("/catalogo");
    setModel("");
  }

  const hasFilters = currentCategory || currentBrand || currentModel || currentQuery;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Filtro de Categoría */}
        <div className="w-full sm:w-[200px]">
          <Select
            value={currentCategory || ""}
            onValueChange={(val) => updateFilter("category", !val ? undefined : val)}
          >
            <SelectTrigger className="w-full bg-transparent border-none shadow-none text-xs font-semibold h-9 focus:ring-0 focus-visible:ring-0 hover:bg-muted/50 rounded-lg cursor-pointer">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas las categorías</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Separador vertical sutil */}
        <div className="hidden md:block h-4 w-[1px] bg-border" />

        {/* Filtro de Marca */}
        <div className="w-full sm:w-[180px]">
          <Select
            value={currentBrand || ""}
            onValueChange={(val) => updateFilter("brand", !val ? undefined : val)}
          >
            <SelectTrigger className="w-full bg-transparent border-none shadow-none text-xs font-semibold h-9 focus:ring-0 focus-visible:ring-0 hover:bg-muted/50 rounded-lg cursor-pointer">
              <SelectValue placeholder="Todas las marcas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas las marcas</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Limpiar Filtros */}
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-full px-3 h-8 shrink-0 transition-colors"
          >
            <X className="h-3.5 w-3.5 mr-1" /> Limpiar filtros
          </Button>
        )}
      </div>

      {/* Formulario de búsqueda por Modelo */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateFilter("model", model || undefined);
        }}
        className="relative flex items-center w-full md:max-w-xs shrink-0"
      >
        <Search className="absolute left-3 h-3.5 w-3.5 text-muted-foreground/80" />
        <Input
          placeholder="Buscar por modelo (ej: Corolla)..."
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="pl-9 pr-8 bg-muted/40 border-none shadow-none rounded-full text-xs h-9 focus-visible:bg-background transition-all duration-300"
        />
        {model && (
          <button
            type="button"
            onClick={() => {
              setModel("");
              updateFilter("model", undefined);
            }}
            className="absolute right-3 text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted/50 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </form>
    </div>
  );
}
