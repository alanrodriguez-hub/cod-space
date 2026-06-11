import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DeleteCategoryButton } from "@/components/admin/delete-category-button";
import { CategoryFormWrapper as CategoryForm } from "@/components/admin/category-form-wrapper";

export default async function AdminCategoriasPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*, products(id)")
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categorías</h1>
        <Link href="/admin/categorias?action=new" className={buttonVariants()}>
          <Plus className="h-4 w-4 mr-1" /> Nueva Categoría
        </Link>
      </div>

      <CategoryForm />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Nombre</th>
                  <th className="text-left p-3 font-medium">Slug</th>
                  <th className="text-left p-3 font-medium">Productos</th>
                  <th className="text-left p-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories?.map((cat) => (
                  <tr key={cat.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3 font-medium">{cat.name}</td>
                    <td className="p-3 text-muted-foreground font-mono text-xs">{cat.slug}</td>
                    <td className="p-3">{(cat.products as { id: string }[])?.length ?? 0}</td>
                    <td className="p-3 flex gap-1">
                      <Link
                        href={`/admin/categorias?action=edit&id=${cat.id}`}
                        className={buttonVariants({ variant: "ghost", size: "sm" })}
                      >
                        Editar
                      </Link>
                      <DeleteCategoryButton categoryId={cat.id} categoryName={cat.name} />
                    </td>
                  </tr>
                ))}
                {(!categories || categories.length === 0) && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-muted-foreground">
                      No hay categorías
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
