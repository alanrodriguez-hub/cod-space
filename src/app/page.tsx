import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { ProductCardWrapper } from "@/components/product-card-wrapper";
import { BannerCarousel } from "@/components/banner-carousel";
import { BrandShowcase } from "@/components/brand-showcase";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: banners } = await supabase
    .from("banners")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(*), product_brands(brand:brands(*)), product_car_models(car_model:car_models(*))")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(8);
  const { data: brands } = await supabase
    .from("brands")
    .select("*")
    .order("name");

  return (
    <div>
      {/* Banner Carousel */}
      <BannerCarousel banners={banners ?? []} />

      {/* Brand Showcase */}
      <BrandShowcase brands={brands ?? []} />

      {/* Featured Products */}
      {products && products.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Productos Destacados</h2>
              <Link href="/catalogo" className={buttonVariants({ variant: "ghost" })}>
                Ver todos <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCardWrapper key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
