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
import type { Category } from "@/lib/types";

interface FormData {
  name: string;
  description: string;
  price: string;
  image_url: string;
  category_id: string;
  brand: string;
  car_model: string;
  stock: string;
}

const emptyForm: FormData = {
  name: "",
  description: "",
  price: "",
  image_url: "",
  category_id: "",
  brand: "",
  car_model: "",
  stock: "0",
};

export function ProductForm({ editId }: { editId: string | null }) {
  const [form, setForm] = useState<FormData>(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.from("categories").select("*").order("name").then(({ data }) => {
      setCategories(data ?? []);
    });

    if (editId) {
      supabase.from("products").select("*").eq("id", editId).single().then(({ data }) => {
        if (data) {
          setForm({
            name: data.name,
            description: data.description,
            price: String(data.price),
            image_url: data.image_url ?? "",
            category_id: data.category_id ?? "",
            brand: data.brand,
            car_model: data.car_model,
            stock: String(data.stock),
          });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      image_url: form.image_url || null,
      category_id: form.category_id || null,
      brand: form.brand,
      car_model: form.car_model,
      stock: parseInt(form.stock),
    };

    let error;
    if (editId) {
      ({ error } = await supabase.from("products").update(payload).eq("id", editId));
    } else {
      ({ error } = await supabase.from("products").insert(payload));
    }

    setLoading(false);

    if (error) {
      toast.error(`Error al ${editId ? "actualizar" : "crear"} el producto`);
      return;
    }

    toast.success(editId ? "Producto actualizado" : "Producto creado");
    router.push("/admin/productos");
    router.refresh();
  }

  function handleClose() {
    router.push("/admin/productos");
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{editId ? "Editar Producto" : "Nuevo Producto"}</h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description">Descripción</Label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <Label htmlFor="price">Precio</Label>
            <Input id="price" name="price" type="number" step="1" value={form.price} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="stock">Stock</Label>
            <Input id="stock" name="stock" type="number" value={form.stock} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="category_id">Categoría</Label>
            <select
              id="category_id"
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Sin categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="brand">Marca</Label>
            <Input id="brand" name="brand" value={form.brand} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="car_model">Modelo de auto</Label>
            <Input id="car_model" name="car_model" value={form.car_model} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="image_url">URL de imagen</Label>
            <Input id="image_url" name="image_url" value={form.image_url} onChange={handleChange} placeholder="https://..." />
          </div>
          <div className="md:col-span-2 flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : editId ? "Actualizar" : "Crear Producto"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
