import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { ProductCardWrapper } from "@/components/product-card-wrapper";
import { BannerCarousel } from "@/components/banner-carousel";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: banners } = await supabase
    .from("banners")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <div>
      {/* Banner Carousel */}
      <BannerCarousel banners={banners ?? []} />

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Productos Destacados</h2>
            <Link href="/catalogo" className={buttonVariants({ variant: "ghost" })}>
              Ver todos <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCardWrapper key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Aún no hay productos disponibles</p>
              <Link href="/catalogo" className={buttonVariants()}>
                Ir al Catálogo <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
