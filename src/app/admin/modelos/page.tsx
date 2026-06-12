import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DeleteCarModelButton } from "@/components/admin/delete-car-model-button";
import { CarModelFormWrapper as CarModelForm } from "@/components/admin/car-model-form-wrapper";
import { Pagination } from "@/components/pagination";
import { CarModelBrandFilter } from "@/components/admin/car-model-brand-filter";

const PAGE_SIZE = 50;

export default async function AdminModelosPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; id?: string; page?: string; brand?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Math.max(1, Number(params.page) || 1);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  const { data: brandsList } = await supabase.from("brands").select("*").order("name");

  let query = supabase
    .from("car_models")
    .select("*, brand:brands(name), product_car_models(product_id)", { count: "exact" })
    .order("name");

  if (params.brand) {
    const { data: brandRow } = await supabase.from("brands").select("id").eq("name", params.brand).single();
    if (brandRow) query = query.eq("brand_id", brandRow.id);
  }

  const { data: models, count } = await query.range(from, to);
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Modelos de Auto</h1>
        <Link href="/admin/modelos?action=new" className={buttonVariants()}>
          <Plus className="h-4 w-4 mr-1" /> Nuevo Modelo
        </Link>
      </div>

      <CarModelBrandFilter brands={brandsList || []} currentBrand={params.brand} />

      <CarModelForm />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Nombre</th>
                  <th className="text-left p-3 font-medium">Marca</th>
                  <th className="text-left p-3 font-medium">Productos</th>
                  <th className="text-left p-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {models?.map((model) => (
                  <tr key={model.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3 font-medium">{model.name}</td>
                    <td className="p-3">
                      <Badge variant="secondary">{(model.brand as { name: string } | null)?.name ?? "—"}</Badge>
                    </td>
                    <td className="p-3">{(model.product_car_models as { product_id: string }[])?.length ?? 0}</td>
                    <td className="p-3 flex gap-1">
                      <Link
                        href={`/admin/modelos?action=edit&id=${model.id}`}
                        className={buttonVariants({ variant: "ghost", size: "sm" })}
                      >
                        Editar
                      </Link>
                      <DeleteCarModelButton modelId={model.id} modelName={model.name} />
                    </td>
                  </tr>
                ))}
                {(!models || models.length === 0) && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-muted-foreground">
                      No hay modelos
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
        basePath="/admin/modelos"
        searchParams={params}
      />
    </div>
  );
}
