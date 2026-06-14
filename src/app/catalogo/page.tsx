import { createClient } from "@/lib/supabase/server";
import { ProductCardWrapper } from "@/components/product-card-wrapper";
import { CatalogoFilters } from "@/components/catalogo-filters";
import { Pagination } from "@/components/pagination";
import { getCategories, getBrandNames } from "@/lib/data-cache";

export const revalidate = 300;

const PAGE_SIZE = 12;

function encodeCursor(createdAt: string, id: string): string {
  return Buffer.from(`${createdAt}|${id}`).toString("base64url");
}

function decodeCursor(cursor: string): { createdAt: string; id: string } {
  const decoded = Buffer.from(cursor, "base64url").toString("utf-8");
  const pipe = decoded.lastIndexOf("|");
  return { createdAt: decoded.slice(0, pipe), id: decoded.slice(pipe + 1) };
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; brand?: string; q?: string; model?: string; after?: string; before?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const [categories, brands] = await Promise.all([
    getCategories(),
    getBrandNames(),
  ]);

  let query = supabase.from("products").select(
    "*, category:categories(*), product_brands(brand:brands(*)), product_car_models(car_model:car_models(*))"
  );

  if (params.category) {
    const cat = categories.find((c) => c.slug === params.category);
    if (cat) query = query.eq("category_id", cat.id);
  }

  if (params.brand) {
    query = query.eq("brand", params.brand);
  }

  if (params.model) {
    query = query.filter("product_car_models.car_model.name", "ilike", `%${params.model}%`);
  }

  if (params.q) {
    query = query.textSearch("search_vector", params.q, {
      type: "websearch",
      config: "spanish",
    });
  }

  const after = params.after;
  const before = params.before;
  let cursorValue: { createdAt: string; id: string } | null = null;
  let isForward = true;

  if (after) {
    cursorValue = decodeCursor(after);
    isForward = true;
  } else if (before) {
    cursorValue = decodeCursor(before);
    isForward = false;
  }

  if (cursorValue) {
    if (isForward) {
      query = query
        .or(`created_at.lt.${cursorValue.createdAt},and(created_at.eq.${cursorValue.createdAt},id.lt.${cursorValue.id})`)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false });
    } else {
      query = query
        .or(`created_at.gt.${cursorValue.createdAt},and(created_at.eq.${cursorValue.createdAt},id.gt.${cursorValue.id})`)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true });
    }
  } else {
    query = query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });
  }

  const { data: rawProducts } = await query.limit(PAGE_SIZE + 1);

  let products = rawProducts ?? [];
  let hasNext = false;
  let hasPrev = Boolean(after || before);
  let nextCursor: string | undefined;
  let prevCursor: string | undefined;

  if (isForward) {
    if (products.length > PAGE_SIZE) {
      hasNext = true;
      products.pop();
    }
  } else {
    if (products.length > PAGE_SIZE) {
      products.shift();
    }
    products.reverse();
  }

  const firstItem = products[0];
  const lastItem = products[products.length - 1];

  if (hasNext && lastItem) {
    nextCursor = encodeCursor(lastItem.created_at, lastItem.id);
  }
  if (hasPrev && firstItem) {
    prevCursor = encodeCursor(firstItem.created_at, firstItem.id);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Catalogo de Repuestos</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <CatalogoFilters
            categories={categories}
            brands={brands}
            currentCategory={params.category}
            currentBrand={params.brand}
            currentModel={params.model}
            currentQuery={params.q}
          />
        </aside>
        <div className="flex-1">
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCardWrapper key={product.id} product={product} />
                ))}
              </div>
              <Pagination
                hasPrev={hasPrev}
                hasNext={hasNext}
                prevCursor={prevCursor}
                nextCursor={nextCursor}
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
