import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { ProductCardWrapper } from "@/components/product-card-wrapper";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("*").limit(6);
  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Repuestos para tu auto
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Encuentra los mejores repuestos al mejor precio. Amplio catálogo con envío a todo el país.
          </p>
          <Link href="/catalogo" className={buttonVariants({ size: "lg", className: "mt-8" })}>
            Ver Catálogo <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">Categorías</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/catalogo?category=${cat.slug}`}>
                  <Card className="group hover:shadow-lg transition-shadow overflow-hidden">
                    <div className="relative aspect-square bg-muted">
                      {cat.image_url && (
                        <Image
                          src={cat.image_url}
                          alt={cat.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 768px) 50vw, 16vw"
                        />
                      )}
                    </div>
                    <CardContent className="p-3 text-center">
                      <span className="font-medium text-sm">{cat.name}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {products && products.length > 0 && (
        <section className="py-16 bg-muted/30">
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
