import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { ToggleFeaturedButton } from "@/components/admin/toggle-featured-button";

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(price);
}

export default async function AdminProductosPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(name), product_brands(brand:brands(*)), product_car_models(car_model:car_models(*))")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Productos</h1>
        <Link href="/admin/productos?action=new" className={buttonVariants()}>
          <Plus className="h-4 w-4 mr-1" /> Nuevo Producto
        </Link>
      </div>

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
    </div>
  );
}

import { ProductFormWrapper as ProductForm } from "@/components/admin/product-form-wrapper";
