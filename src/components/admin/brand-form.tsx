"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { ImageUpload } from "@/components/admin/image-upload";

export function BrandForm({ editId }: { editId: string | null }) {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (editId) {
      supabase.from("brands").select("*").eq("id", editId).single().then(({ data }) => {
        if (data) {
          setName(data.name);
          setImageUrl(data.image_url ?? "");
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = { name, image_url: imageUrl || null };

    let error;
    if (editId) {
      ({ error } = await supabase.from("brands").update(payload).eq("id", editId));
    } else {
      ({ error } = await supabase.from("brands").insert(payload));
    }

    setLoading(false);

    if (error) {
      toast.error(`Error al ${editId ? "actualizar" : "crear"}`, { description: "No se pudo guardar la marca. Verifica que el nombre no esté duplicado." });
      return;
    }

    toast.success(editId ? "Marca actualizada" : "Marca creada", { description: `"${name}" fue guardada correctamente.` });
    router.push("/admin/marcas");
    router.refresh();
  }

  function handleClose() {
    router.push("/admin/marcas");
  }

  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{editId ? "Editar Marca" : "Nueva Marca"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="brand-name">Nombre</Label>
            <Input id="brand-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label>Logo / Imagen</Label>
            <ImageUpload
              currentUrl={imageUrl || null}
              folder="brands"
              onUpload={(url) => setImageUrl(url ?? "")}
            />
          </div>
          <div className="md:col-span-2 flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : editId ? "Actualizar" : "Crear Marca"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
