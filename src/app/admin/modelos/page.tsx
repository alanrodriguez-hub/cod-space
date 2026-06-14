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
import { getBrands } from "@/lib/data-cache";

const PAGE_SIZE = 50;

function encodeCursor(name: string): string {
  return Buffer.from(name).toString("base64url");
}

function decodeCursor(cursor: string): string {
  return Buffer.from(cursor, "base64url").toString("utf-8");
}

export default async function AdminModelosPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; id?: string; brand?: string; after?: string; before?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const brandsList = await getBrands();

  let query = supabase
    .from("car_models")
    .select("*, brand:brands(name), product_car_models(product_id)");

  if (params.brand) {
    const brand = brandsList.find((b) => b.name === params.brand);
    if (brand) query = query.eq("brand_id", brand.id);
  }

  const after = params.after;
  const before = params.before;
  let cursorName: string | null = null;
  let isForward = true;

  if (after) {
    cursorName = decodeCursor(after);
    isForward = true;
  } else if (before) {
    cursorName = decodeCursor(before);
    isForward = false;
  }

  if (cursorName) {
    if (isForward) {
      query = query.gt("name", cursorName).order("name", { ascending: true });
    } else {
      query = query.lt("name", cursorName).order("name", { ascending: false });
    }
  } else {
    query = query.order("name", { ascending: true });
  }

  const { data: rawModels } = await query.limit(PAGE_SIZE + 1);

  let models = rawModels ?? [];
  let hasNext = false;
  let hasPrev = Boolean(after || before);
  let nextCursor: string | undefined;
  let prevCursor: string | undefined;

  if (isForward) {
    if (models.length > PAGE_SIZE) {
      hasNext = true;
      models.pop();
    }
  } else {
    if (models.length > PAGE_SIZE) {
      models.shift();
    }
    models.reverse();
  }

  const firstItem = models[0];
  const lastItem = models[models.length - 1];

  if (hasNext && lastItem) {
    nextCursor = encodeCursor(lastItem.name);
  }
  if (hasPrev && firstItem) {
    prevCursor = encodeCursor(firstItem.name);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Modelos de Auto</h1>
        <Link href="/admin/modelos?action=new" className={buttonVariants()}>
          <Plus className="h-4 w-4 mr-1" /> Nuevo Modelo
        </Link>
      </div>

      <CarModelBrandFilter brands={brandsList} currentBrand={params.brand} />

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
                {models.map((model) => (
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
                {models.length === 0 && (
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
        hasPrev={hasPrev}
        hasNext={hasNext}
        prevCursor={prevCursor}
        nextCursor={nextCursor}
        basePath="/admin/modelos"
        searchParams={params}
      />
    </div>
  );
}
