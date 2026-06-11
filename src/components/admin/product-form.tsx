"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { X, Plus } from "lucide-react";
import { ImageUpload } from "@/components/admin/image-upload";
import type { Category, Brand, CarModel } from "@/lib/types";

interface FormData {
  name: string;
  description: string;
  price: string;
  image_url: string;
  category_id: string;
  stock: string;
}

const emptyForm: FormData = {
  name: "",
  description: "",
  price: "",
  image_url: "",
  category_id: "",
  stock: "0",
};

export function ProductForm({ editId }: { editId: string | null }) {
  const [form, setForm] = useState<FormData>(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allBrands, setAllBrands] = useState<Brand[]>([]);
  const [allModels, setAllModels] = useState<CarModel[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<Brand[]>([]);
  const [selectedModels, setSelectedModels] = useState<CarModel[]>([]);
  const [brandInput, setBrandInput] = useState("");
  const [modelInput, setModelInput] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.from("categories").select("*").order("name").then(({ data }) => {
      setCategories(data ?? []);
    });
    supabase.from("brands").select("*").order("name").then(({ data }) => {
      setAllBrands(data ?? []);
    });
    supabase.from("car_models").select("*, brand:brands(*)").order("name").then(({ data }) => {
      setAllModels(data ?? []);
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
            stock: String(data.stock),
          });
        }
      });
      supabase.from("product_brands").select("brand:brands(*)").eq("product_id", editId).then(({ data }) => {
        if (data) {
          setSelectedBrands(data.map((r: { brand: Brand }) => r.brand));
        }
      });
      supabase.from("product_car_models").select("car_model:car_models(*, brand:brands(*))").eq("product_id", editId).then(({ data }) => {
        if (data) {
          setSelectedModels(data.map((r: { car_model: CarModel }) => r.car_model));
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const filteredModels = allModels.filter(
    (m) => selectedBrands.some((b) => b.id === m.brand_id) && !selectedModels.some((s) => s.id === m.id)
  );

  const filteredBrands = allBrands.filter(
    (b) => !selectedBrands.some((s) => s.id === b.id)
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function addBrand(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const existing = allBrands.find((b) => b.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      if (!selectedBrands.some((s) => s.id === existing.id)) {
        setSelectedBrands((prev) => [...prev, existing]);
      }
      setBrandInput("");
      return;
    }
    const { data, error } = await supabase.from("brands").insert({ name: trimmed }).select().single();
    if (error) {
      toast.error("Error al crear la marca");
      return;
    }
    setAllBrands((prev) => [...prev, data]);
    setSelectedBrands((prev) => [...prev, data]);
    setBrandInput("");
  }

  async function addModel(name: string) {
    const trimmed = name.trim();
    if (!trimmed || selectedBrands.length === 0) return;
    const brandId = selectedBrands[0].id;
    const existing = allModels.find(
      (m) => m.name.toLowerCase() === trimmed.toLowerCase() && m.brand_id === brandId
    );
    if (existing) {
      if (!selectedModels.some((s) => s.id === existing.id)) {
        setSelectedModels((prev) => [...prev, existing]);
      }
      setModelInput("");
      return;
    }
    const { data, error } = await supabase.from("car_models").insert({ name: trimmed, brand_id: brandId }).select("*, brand:brands(*)").single();
    if (error) {
      toast.error("Error al crear el modelo");
      return;
    }
    setAllModels((prev) => [...prev, data]);
    setSelectedModels((prev) => [...prev, data]);
    setModelInput("");
  }

  function removeBrand(id: string) {
    setSelectedBrands((prev) => prev.filter((b) => b.id !== id));
    setSelectedModels((prev) => prev.filter((m) => m.brand_id !== id));
  }

  function removeModel(id: string) {
    setSelectedModels((prev) => prev.filter((m) => m.id !== id));
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
      brand: selectedBrands.map((b) => b.name).join(", "),
      car_model: selectedModels.map((m) => m.name).join(", "),
      stock: parseInt(form.stock),
    };

    let productId = editId;
    let error;

    if (editId) {
      ({ error } = await supabase.from("products").update(payload).eq("id", editId));
    } else {
      const result = await supabase.from("products").insert(payload).select("id").single();
      error = result.error;
      productId = result.data?.id ?? null;
    }

    if (error || !productId) {
      toast.error(`Error al ${editId ? "actualizar" : "crear"}`, { description: "No se pudo guardar el producto. Verifica los datos e intenta nuevamente." });
      setLoading(false);
      return;
    }

    const { error: delBrands } = await supabase.from("product_brands").delete().eq("product_id", productId);
    const { error: delModels } = await supabase.from("product_car_models").delete().eq("product_id", productId);

    if (delBrands || delModels) {
      console.error("Error eliminando relaciones:", delBrands, delModels);
      toast.error("Error al actualizar", { description: "No se pudieron actualizar las marcas/modelos del producto." });
      setLoading(false);
      return;
    }

    if (selectedBrands.length > 0) {
      const { error: insBrands } = await supabase.from("product_brands").insert(
        selectedBrands.map((b) => ({ product_id: productId, brand_id: b.id }))
      );
      if (insBrands) {
        console.error("Error insertando marcas:", insBrands);
        toast.error("Error al asignar marcas", { description: "El producto se guardó pero no se pudieron asignar las marcas." });
        setLoading(false);
        return;
      }
    }
    if (selectedModels.length > 0) {
      const { error: insModels } = await supabase.from("product_car_models").insert(
        selectedModels.map((m) => ({ product_id: productId, car_model_id: m.id }))
      );
      if (insModels) {
        console.error("Error insertando modelos:", insModels);
        toast.error("Error al asignar modelos", { description: "El producto se guardó pero no se pudieron asignar los modelos." });
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    toast.success(editId ? "Producto actualizado" : "Producto creado", { description: `"${form.name}" fue guardado correctamente.` });
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
            <Label htmlFor="description">Descripcion</Label>
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
            <Label htmlFor="category_id">Categoria</Label>
            <select
              id="category_id"
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Sin categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <Label>Marcas</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedBrands.map((brand) => (
                <Badge key={brand.id} variant="secondary" className="gap-1">
                  {brand.name}
                  <button type="button" onClick={() => removeBrand(brand.id)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Agregar marca..."
                value={brandInput}
                onChange={(e) => setBrandInput(e.target.value)}
                list="brands-list"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addBrand(brandInput);
                  }
                }}
              />
              <datalist id="brands-list">
                {filteredBrands.map((b) => (
                  <option key={b.id} value={b.name} />
                ))}
              </datalist>
              <Button type="button" variant="secondary" size="icon" onClick={() => addBrand(brandInput)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="md:col-span-2">
            <Label>Modelos de auto</Label>
            {selectedBrands.length === 0 && (
              <p className="text-sm text-muted-foreground mb-2">Selecciona al menos una marca primero</p>
            )}
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedModels.map((model) => (
                <Badge key={model.id} variant="outline" className="gap-1">
                  {model.name} {model.brand && <span className="text-muted-foreground">({model.brand.name})</span>}
                  <button type="button" onClick={() => removeModel(model.id)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            {selectedBrands.length > 0 && (
              <div className="flex gap-2">
                <Input
                  placeholder="Agregar modelo..."
                  value={modelInput}
                  onChange={(e) => setModelInput(e.target.value)}
                  list="models-list"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addModel(modelInput);
                    }
                  }}
                />
                <datalist id="models-list">
                  {filteredModels.map((m) => (
                    <option key={m.id} value={m.name} />
                  ))}
                </datalist>
                <Button type="button" variant="secondary" size="icon" onClick={() => addModel(modelInput)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div>
            <Label>Imagen</Label>
            <ImageUpload
              currentUrl={form.image_url || null}
              folder="products"
              onUpload={(url) => setForm((prev) => ({ ...prev, image_url: url ?? "" }))}
            />
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
