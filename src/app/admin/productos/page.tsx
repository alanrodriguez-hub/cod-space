import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { ToggleFeaturedButton } from "@/components/admin/toggle-featured-button";
import { Pagination } from "@/components/pagination";
import { AdminProductFilters } from "@/components/admin/product-filters";

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(price);
}

const PAGE_SIZE = 10;

export default async function AdminProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; id?: string; page?: string; category?: string; brand?: string; model?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Math.max(1, Number(params.page) || 1);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  const [{ data: categories }, { data: brandsList }, { data: carModelsList }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("brands").select("*").order("name"),
    supabase.from("car_models").select("*").order("name"),
  ]);

  let productIds: string[] | null = null;

  if (params.brand) {
    const { data: brandRow } = await supabase.from("brands").select("id").eq("name", params.brand).single();
    if (brandRow) {
      const { data: pbRows } = await supabase.from("product_brands").select("product_id").eq("brand_id", brandRow.id);
      productIds = pbRows?.map((r) => r.product_id) ?? [];
    } else {
      productIds = [];
    }
  }

  if (params.model) {
    const { data: modelRows } = await supabase.from("car_models").select("id").ilike("name", `%${params.model}%`);
    if (modelRows && modelRows.length > 0) {
      const modelIds = modelRows.map((m) => m.id);
      const { data: pmRows } = await supabase.from("product_car_models").select("product_id").in("car_model_id", modelIds);
      const modelProductIds = pmRows?.map((r) => r.product_id) ?? [];
      productIds = productIds !== null ? productIds.filter((id) => modelProductIds.includes(id)) : modelProductIds;
    } else {
      productIds = [];
    }
  }

  let query = supabase
    .from("products")
    .select("*, category:categories(name), product_brands(brand:brands(*)), product_car_models(car_model:car_models(*))", { count: "exact" });

  if (params.category) {
    const { data: cat } = await supabase.from("categories").select("id").eq("slug", params.category).single();
    if (cat) query = query.eq("category_id", cat.id);
  }

  if (productIds !== null) {
    query = productIds.length === 0
      ? query.in("id", ["00000000-0000-0000-0000-000000000000"])
      : query.in("id", productIds);
  }

  const { data: products, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Productos</h1>
        <Link href="/admin/productos?action=new" className={buttonVariants()}>
          <Plus className="h-4 w-4 mr-1" /> Nuevo Producto
        </Link>
      </div>

      <AdminProductFilters
        categories={categories || []}
        brands={brandsList || []}
        carModels={carModelsList || []}
        currentCategory={params.category}
        currentBrand={params.brand}
        currentModel={params.model}
      />

      <ProductForm />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Producto</th>
                  <th className="text-left p-3 font-medium">Categoría</th>
                  <th className="text-left p-3 font-medium">Marca</th>
                  <th className="text-left p-3 font-medium">Modelo</th>
                  <th className="text-left p-3 font-medium">Precio</th>
                  <th className="text-left p-3 font-medium">Stock</th>
                  <th className="text-left p-3 font-medium">Destacado</th>
                  <th className="text-left p-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products?.map((product) => (
                  <tr key={product.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3 font-medium">{product.name}</td>
                    <td className="p-3">
                      <Badge variant="secondary">{(product.category as { name: string } | null)?.name ?? "—"}</Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {(product.product_brands as { brand: { name: string } }[])?.map((pb, i) => (
                          <Badge key={i} variant="outline">{pb.brand.name}</Badge>
                        )) ?? "—"}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {(product.product_car_models as { car_model: { name: string } }[])?.map((pm, i) => (
                          <Badge key={i} variant="outline">{pm.car_model.name}</Badge>
                        )) ?? "—"}
                      </div>
                    </td>
                    <td className="p-3 font-medium">{formatPrice(product.price)}</td>
                    <td className="p-3">
                      <Badge variant={product.stock > 0 ? "outline" : "destructive"}>
                        {product.stock}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <ToggleFeaturedButton productId={product.id} featured={product.featured} />
                    </td>
                    <td className="p-3 flex gap-1">
                      <Link
                        href={`/admin/productos?action=edit&id=${product.id}`}
                        className={buttonVariants({ variant: "ghost", size: "sm" })}
                      >
                        Editar
                      </Link>
                      <DeleteProductButton productId={product.id} productName={product.name} />
                    </td>
                  </tr>
                ))}
                {(!products || products.length === 0) && (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-muted-foreground">
                      No hay productos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/admin/productos"
        searchParams={params}
      />
    </div>
  );
}

import { ProductFormWrapper as ProductForm } from "@/components/admin/product-form-wrapper";
