import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

  const models = rawModels ?? [];
  let hasNext = false;
  const hasPrev = Boolean(after || before);
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Modelos de Auto</h1>
        <Link href="/admin/modelos?action=new" className={buttonVariants({ size: "sm" })}>
          <Plus className="h-4 w-4 mr-1" /> Nuevo Modelo
        </Link>
      </div>

      <CarModelBrandFilter brands={brandsList} currentBrand={params.brand} />

      <CarModelForm />

      <Card size="sm">
        <CardHeader>
          <CardTitle>Todos los modelos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.id}>
                  <TableCell className="font-medium">{model.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{(model.brand as { name: string } | null)?.name ?? "—"}</Badge>
                  </TableCell>
                  <TableCell>{(model.product_car_models as { product_id: string }[])?.length ?? 0}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Link
                        href={`/admin/modelos?action=edit&id=${model.id}`}
                        className={buttonVariants({ variant: "ghost", size: "sm" })}
                      >
                        Editar
                      </Link>
                      <DeleteCarModelButton modelId={model.id} modelName={model.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {models.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                    No hay modelos
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
