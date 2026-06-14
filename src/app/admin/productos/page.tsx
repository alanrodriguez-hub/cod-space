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
import { getCategories, getBrands, getCarModels } from "@/lib/data-cache";

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(price);
}

const PAGE_SIZE = 10;

function encodeCursor(createdAt: string, id: string): string {
  return Buffer.from(`${createdAt}|${id}`).toString("base64url");
}

function decodeCursor(cursor: string): { createdAt: string; id: string } {
  const decoded = Buffer.from(cursor, "base64url").toString("utf-8");
  const pipe = decoded.lastIndexOf("|");
  return { createdAt: decoded.slice(0, pipe), id: decoded.slice(pipe + 1) };
}

export default async function AdminProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; id?: string; page?: string; category?: string; brand?: string; model?: string; after?: string; before?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const [categories, brandsList, carModelsList] = await Promise.all([
    getCategories(),
    getBrands(),
    getCarModels(),
  ]);

  let query = supabase
    .from("products")
    .select("*, category:categories(name), product_brands(brand:brands(*)), product_car_models(car_model:car_models(*))");

  if (params.category) {
    const cat = categories.find((c) => c.slug === params.category);
    if (cat) query = query.eq("category_id", cat.id);
  }

  if (params.brand) {
    query = query.eq("brand", params.brand);
  }

  if (params.model) {
    query = query.ilike("car_model", `%${params.model}%`);
  }

  const after = params.after;
  const before = params.before;
  let cursorValue: { createdAt: string; id: string } | null = null;
  let isForward = true;

  if (after) {
    cursorValue = decodeCursor(after);
    isForward = true;
  } else if (before) {
    cursorValue = decodeCursor(before);
    isForward = false;
  }

  if (cursorValue) {
    if (isForward) {
      query = query
        .or(`created_at.lt.${cursorValue.createdAt},and(created_at.eq.${cursorValue.createdAt},id.lt.${cursorValue.id})`)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false });
    } else {
      query = query
        .or(`created_at.gt.${cursorValue.createdAt},and(created_at.eq.${cursorValue.createdAt},id.gt.${cursorValue.id})`)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true });
    }
  } else {
    query = query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });
  }

  const { data: rawProducts } = await query.limit(PAGE_SIZE + 1);

  let products = rawProducts ?? [];
  let hasNext = false;
  let hasPrev = Boolean(after || before);
  let nextCursor: string | undefined;
  let prevCursor: string | undefined;

  if (isForward) {
    if (products.length > PAGE_SIZE) {
      hasNext = true;
      products.pop();
    }
  } else {
    if (products.length > PAGE_SIZE) {
      products.shift();
    }
    products.reverse();
  }

  const firstItem = products[0];
  const lastItem = products[products.length - 1];

  if (hasNext && lastItem) {
    nextCursor = encodeCursor(lastItem.created_at, lastItem.id);
  }
  if (hasPrev && firstItem) {
    prevCursor = encodeCursor(firstItem.created_at, firstItem.id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Productos</h1>
        <Link href="/admin/productos?action=new" className={buttonVariants()}>
          <Plus className="h-4 w-4 mr-1" /> Nuevo Producto
        </Link>
      </div>

      <AdminProductFilters
        categories={categories}
        brands={brandsList}
        carModels={carModelsList}
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
                {products.map((product) => (
                  <tr key={product.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3 font-medium">{product.name}</td>
                    <td className="p-3">
                      <Badge variant="secondary">{(product.category as { name: string } | null)?.name ?? "—"}</Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {(product.product_brands as { brand: { name: string } | null }[] | null)?.filter((pb) => pb.brand).map((pb, i) => (
                          <Badge key={i} variant="outline">{pb.brand!.name}</Badge>
                        )) ?? "—"}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {(product.product_car_models as { car_model: { name: string } | null }[] | null)?.filter((pm) => pm.car_model).map((pm, i) => (
                          <Badge key={i} variant="outline">{pm.car_model!.name}</Badge>
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
                {products.length === 0 && (
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
        hasPrev={hasPrev}
        hasNext={hasNext}
        prevCursor={prevCursor}
        nextCursor={nextCursor}
        basePath="/admin/productos"
        searchParams={params}
      />
    </div>
  );
}

import { ProductFormWrapper as ProductForm } from "@/components/admin/product-form-wrapper";
