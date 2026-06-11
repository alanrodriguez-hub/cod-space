import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DeleteBrandButton } from "@/components/admin/delete-brand-button";
import { BrandFormWrapper as BrandForm } from "@/components/admin/brand-form-wrapper";

export default async function AdminMarcasPage() {
  const supabase = await createClient();
  const { data: brands } = await supabase
    .from("brands")
    .select("*, car_models(id), product_brands(product_id)")
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Marcas</h1>
        <Link href="/admin/marcas?action=new" className={buttonVariants()}>
          <Plus className="h-4 w-4 mr-1" /> Nueva Marca
        </Link>
      </div>

      <BrandForm />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Logo</th>
                  <th className="text-left p-3 font-medium">Nombre</th>
                  <th className="text-left p-3 font-medium">Modelos</th>
                  <th className="text-left p-3 font-medium">Productos</th>
                  <th className="text-left p-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {brands?.map((brand) => (
                  <tr key={brand.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3">
                      {brand.image_url ? (
                        <div className="relative h-8 w-16">
                          <Image src={brand.image_url} alt={brand.name} fill className="object-contain" sizes="64px" />
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">Sin logo</span>
                      )}
                    </td>
                    <td className="p-3 font-medium">{brand.name}</td>
                    <td className="p-3">{(brand.car_models as { id: string }[])?.length ?? 0}</td>
                    <td className="p-3">{(brand.product_brands as { product_id: string }[])?.length ?? 0}</td>
                    <td className="p-3 flex gap-1">
                      <Link
                        href={`/admin/marcas?action=edit&id=${brand.id}`}
                        className={buttonVariants({ variant: "ghost", size: "sm" })}
                      >
                        Editar
                      </Link>
                      <DeleteBrandButton brandId={brand.id} brandName={brand.name} />
                    </td>
                  </tr>
                ))}
                {(!brands || brands.length === 0) && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-muted-foreground">
                      No hay marcas
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
