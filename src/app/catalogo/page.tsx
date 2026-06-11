import { createClient } from "@/lib/supabase/server";
import { ProductCardWrapper } from "@/components/product-card-wrapper";
import { CatalogoFilters } from "@/components/catalogo-filters";

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; brand?: string; q?: string; model?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: categories } = await supabase.from("categories").select("*").order("name");

  let query = supabase.from("products").select("*, category:categories(*)");

  if (params.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.category)
      .single();
    if (cat) query = query.eq("category_id", cat.id);
  }

  if (params.brand) {
    query = query.ilike("brand", params.brand);
  }

  if (params.model) {
    query = query.ilike("car_model", `%${params.model}%`);
  }

  if (params.q) {
    query = query.ilike("name", `%${params.q}%`);
  }

  const { data: products } = await query.order("created_at", { ascending: false });

  const brands = [...new Set(products?.map((p) => p.brand).filter(Boolean) || [])];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Catálogo de Repuestos</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <CatalogoFilters
            categories={categories || []}
            brands={brands}
            currentCategory={params.category}
            currentBrand={params.brand}
            currentModel={params.model}
            currentQuery={params.q}
          />
        </aside>
        <div className="flex-1">
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCardWrapper key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg">No se encontraron productos</p>
              <p className="text-sm mt-2">Intenta con otros filtros o búsqueda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
