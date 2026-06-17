"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Brand } from "@/lib/types";
import { X } from "lucide-react";

interface Props {
  brands: Brand[];
  currentBrand?: string;
}

export function CarModelBrandFilter({ brands, currentBrand }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateBrand(value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("brand", value);
    } else {
      params.delete("brand");
    }
    params.delete("page");
    router.push(`/admin/modelos?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-48">
        <Select value={currentBrand || ""} onValueChange={(v) => updateBrand(!v ? undefined : v)}>
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="Todas las marcas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas las marcas</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {currentBrand && (
        <Button variant="ghost" size="sm" onClick={() => updateBrand(undefined)}>
          <X className="h-4 w-4 mr-1" /> Limpiar
        </Button>
      )}
    </div>
  );
}
