"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import type { Brand } from "@/lib/types";

export function CarModelForm({ editId }: { editId: string | null }) {
  const [name, setName] = useState("");
  const [brandId, setBrandId] = useState("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.from("brands").select("*").order("name").then(({ data }) => {
      setBrands(data ?? []);
    });

    if (editId) {
      supabase.from("car_models").select("*").eq("id", editId).single().then(({ data }) => {
        if (data) {
          setName(data.name);
          setBrandId(data.brand_id);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!brandId) {
      toast.error("Selecciona una marca");
      return;
    }
    setLoading(true);

    const payload = { name, brand_id: brandId };

    let error;
    if (editId) {
      ({ error } = await supabase.from("car_models").update(payload).eq("id", editId));
    } else {
      ({ error } = await supabase.from("car_models").insert(payload));
    }

    setLoading(false);

    if (error) {
      toast.error(`Error al ${editId ? "actualizar" : "crear"}`, { description: "No se pudo guardar el modelo. Verifica que no esté duplicado para esa marca." });
      return;
    }

    toast.success(editId ? "Modelo actualizado" : "Modelo creado", { description: `"${name}" fue guardado correctamente.` });
    router.push("/admin/modelos");
    router.refresh();
  }

  function handleClose() {
    router.push("/admin/modelos");
  }

  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{editId ? "Editar Modelo" : "Nuevo Modelo"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="model-name">Nombre</Label>
            <Input id="model-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="model-brand">Marca</Label>
            <Select value={brandId} onValueChange={(val) => setBrandId(val ?? "")}>
              <SelectTrigger id="model-brand" className="w-full">
                <SelectValue placeholder="Seleccionar marca" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : editId ? "Actualizar" : "Crear Modelo"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
