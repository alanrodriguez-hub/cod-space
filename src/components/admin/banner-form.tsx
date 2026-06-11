"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { ImageUpload } from "@/components/admin/image-upload";

interface FormData {
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  active: boolean;
  sort_order: number;
}

export function BannerForm({ editId }: { editId: string | null }) {
  const [form, setForm] = useState<FormData>({
    title: "",
    subtitle: "",
    image_url: "",
    link_url: "",
    active: true,
    sort_order: 0,
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (editId) {
      supabase.from("banners").select("*").eq("id", editId).single().then(({ data }) => {
        if (data) {
          setForm({
            title: data.title,
            subtitle: data.subtitle ?? "",
            image_url: data.image_url,
            link_url: data.link_url ?? "",
            active: data.active,
            sort_order: data.sort_order,
          });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title: form.title,
      subtitle: form.subtitle || null,
      image_url: form.image_url,
      link_url: form.link_url || null,
      active: form.active,
      sort_order: form.sort_order,
    };

    let error;
    if (editId) {
      ({ error } = await supabase.from("banners").update(payload).eq("id", editId));
    } else {
      ({ error } = await supabase.from("banners").insert(payload));
    }

    setLoading(false);

    if (error) {
      toast.error(`Error al ${editId ? "actualizar" : "crear"} el banner`);
      return;
    }

    toast.success(editId ? "Banner actualizado" : "Banner creado");
    router.push("/admin/banners");
    router.refresh();
  }

  function handleClose() {
    router.push("/admin/banners");
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{editId ? "Editar Banner" : "Nuevo Banner"}</h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="banner-title">Título</Label>
            <Input
              id="banner-title"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="banner-subtitle">Subtítulo</Label>
            <Input
              id="banner-subtitle"
              value={form.subtitle}
              onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
              placeholder="Opcional"
            />
          </div>
          <div>
            <Label>Imagen</Label>
            <ImageUpload
              currentUrl={form.image_url || null}
              folder="banners"
              onUpload={(url) => setForm((prev) => ({ ...prev, image_url: url ?? "" }))}
            />
          </div>
          <div>
            <Label htmlFor="banner-link">URL de enlace</Label>
            <Input
              id="banner-link"
              value={form.link_url}
              onChange={(e) => setForm((prev) => ({ ...prev, link_url: e.target.value }))}
              placeholder="/catalogo o https://..."
            />
          </div>
          <div>
            <Label htmlFor="banner-order">Orden</Label>
            <Input
              id="banner-order"
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm((prev) => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
            />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={form.active}
                onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
              />
              <span className="text-sm font-medium">Activo</span>
            </label>
          </div>
          <div className="md:col-span-2 flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : editId ? "Actualizar" : "Crear Banner"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
