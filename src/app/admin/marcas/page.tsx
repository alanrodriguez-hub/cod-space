import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Marcas</h1>
        <Link href="/admin/marcas?action=new" className={buttonVariants({ size: "sm" })}>
          <Plus className="h-4 w-4 mr-1" /> Nueva Marca
        </Link>
      </div>

      <BrandForm />

      <Card size="sm">
        <CardHeader>
          <CardTitle>Todas las marcas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Logo</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Modelos</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands?.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>
                    {brand.image_url ? (
                      <div className="relative h-8 w-16">
                        <Image src={brand.image_url} alt={brand.name} fill className="object-contain" sizes="64px" />
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">Sin logo</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell>{(brand.car_models as { id: string }[])?.length ?? 0}</TableCell>
                  <TableCell>{(brand.product_brands as { product_id: string }[])?.length ?? 0}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Link
                        href={`/admin/marcas?action=edit&id=${brand.id}`}
                        className={buttonVariants({ variant: "ghost", size: "sm" })}
                      >
                        Editar
                      </Link>
                      <DeleteBrandButton brandId={brand.id} brandName={brand.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!brands || brands.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                    No hay marcas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
