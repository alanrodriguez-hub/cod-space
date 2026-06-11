"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface FormData {
  name: string;
  slug: string;
  image_url: string;
}

export function CategoryForm({ editId }: { editId: string | null }) {
  const [form, setForm] = useState<FormData>({ name: "", slug: "", image_url: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (editId) {
      supabase.from("categories").select("*").eq("id", editId).single().then(({ data }) => {
        if (data) {
          setForm({ name: data.name, slug: data.slug, image_url: data.image_url ?? "" });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setForm((prev) => ({ ...prev, name, slug: editId ? prev.slug : slug }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: form.name,
      slug: form.slug,
      image_url: form.image_url || null,
    };

    let error;
    if (editId) {
      ({ error } = await supabase.from("categories").update(payload).eq("id", editId));
    } else {
      ({ error } = await supabase.from("categories").insert(payload));
    }

    setLoading(false);

    if (error) {
      toast.error(`Error al ${editId ? "actualizar" : "crear"} la categoría`);
      return;
    }

    toast.success(editId ? "Categoría actualizada" : "Categoría creada");
    router.push("/admin/categorias");
    router.refresh();
  }

  function handleClose() {
    router.push("/admin/categorias");
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{editId ? "Editar Categoría" : "Nueva Categoría"}</h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cat-name">Nombre</Label>
            <Input id="cat-name" value={form.name} onChange={handleNameChange} required />
          </div>
          <div>
            <Label htmlFor="cat-slug">Slug</Label>
            <Input id="cat-slug" value={form.slug} onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))} required />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="cat-image">URL de imagen</Label>
            <Input id="cat-image" value={form.image_url} onChange={(e) => setForm((prev) => ({ ...prev, image_url: e.target.value }))} placeholder="https://..." />
          </div>
          <div className="md:col-span-2 flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : editId ? "Actualizar" : "Crear Categoría"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
