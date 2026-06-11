import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DeleteCarModelButton } from "@/components/admin/delete-car-model-button";
import { CarModelFormWrapper as CarModelForm } from "@/components/admin/car-model-form-wrapper";

export default async function AdminModelosPage() {
  const supabase = await createClient();
  const { data: models } = await supabase
    .from("car_models")
    .select("*, brand:brands(name), product_car_models(product_id)")
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Modelos de Auto</h1>
        <Link href="/admin/modelos?action=new" className={buttonVariants()}>
          <Plus className="h-4 w-4 mr-1" /> Nuevo Modelo
        </Link>
      </div>

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
    </div>
  );
}
