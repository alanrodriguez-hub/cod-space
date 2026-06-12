import { createClient } from "@/lib/supabase/server";
import { ProductCardWrapper } from "@/components/product-card-wrapper";
import { CatalogoFilters } from "@/components/catalogo-filters";
import { Pagination } from "@/components/pagination";

const PAGE_SIZE = 12;

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; brand?: string; q?: string; model?: string; page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Math.max(1, Number(params.page) || 1);
  const supabase = await createClient();

  const { data: categories } = await supabase.from("categories").select("*").order("name");
  const { data: brandsList } = await supabase.from("brands").select("*").order("name");

  let productIds: string[] | null = null;

  if (params.brand) {
    const { data: brandRow } = await supabase.from("brands").select("id").eq("name", params.brand).single();
    if (brandRow) {
      const { data: pbRows } = await supabase.from("product_brands").select("product_id").eq("brand_id", brandRow.id);
      productIds = pbRows?.map((r) => r.product_id) ?? [];
    } else {
      productIds = [];
    }
  }

  if (params.model) {
    const { data: modelRows } = await supabase.from("car_models").select("id").ilike("name", `%${params.model}%`);
    if (modelRows && modelRows.length > 0) {
      const modelIds = modelRows.map((m) => m.id);
      const { data: pmRows } = await supabase.from("product_car_models").select("product_id").in("car_model_id", modelIds);
      const modelProductIds = pmRows?.map((r) => r.product_id) ?? [];
      if (productIds !== null) {
        productIds = productIds.filter((id) => modelProductIds.includes(id));
      } else {
        productIds = modelProductIds;
      }
    } else {
      productIds = [];
    }
  }

  let query = supabase.from("products").select(
    "*, category:categories(*), product_brands(brand:brands(*)), product_car_models(car_model:car_models(*))",
    { count: "exact" }
  );

  if (params.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.category)
      .single();
    if (cat) query = query.eq("category_id", cat.id);
  }

  if (productIds !== null) {
    if (productIds.length === 0) {
      query = query.in("id", ["00000000-0000-0000-0000-000000000000"]);
    } else {
      query = query.in("id", productIds);
    }
  }

  if (params.q) {
    query = query.ilike("name", `%${params.q}%`);
  }

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: products, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);
  const brands = brandsList?.map((b) => b.name) ?? [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Catalogo de Repuestos</h1>
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
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCardWrapper key={product.id} product={product} />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath="/catalogo"
                searchParams={params}
              />
            </>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg">No se encontraron productos</p>
              <p className="text-sm mt-2">Intenta con otros filtros o busqueda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
