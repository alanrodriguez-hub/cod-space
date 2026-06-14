"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

interface Props {
  currentStatus?: string;
  currentFrom?: string;
  currentTo?: string;
}

export function AdminOrderFilters({ currentStatus, currentFrom, currentTo }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/admin/pedidos?${params.toString()}`);
  }

  function clearFilters() {
    router.push("/admin/pedidos");
  }

  const hasFilters = currentStatus || currentFrom || currentTo;

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-48">
        <Select value={currentStatus || "__todos__"} onValueChange={(v) => updateFilter("status", v === "__todos__" || !v ? undefined : v)}>
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__todos__">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="confirmed">Confirmado</SelectItem>
            <SelectItem value="completed">Completado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="date"
          className="w-40 text-sm"
          value={currentFrom || ""}
          onChange={(e) => updateFilter("from", e.target.value || undefined)}
        />
        <span className="text-sm text-muted-foreground">a</span>
        <Input
          type="date"
          className="w-40 text-sm"
          value={currentTo || ""}
          onChange={(e) => updateFilter("to", e.target.value || undefined)}
        />
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" /> Limpiar
        </Button>
      )}
    </div>
  );
}
