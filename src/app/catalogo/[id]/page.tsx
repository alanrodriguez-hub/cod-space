import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export const revalidate = 300;
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AddToCartButton } from "@/components/add-to-cart-button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*, category:categories(*), product_brands(brand:brands(*)), product_car_models(car_model:car_models(*))")
    .eq("id", id)
    .single();

  if (!product) notFound();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(price);

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/catalogo" className={buttonVariants({ variant: "ghost", size: "sm", className: "mb-6" })}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Volver al catálogo
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Sin imagen
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {product.category && (
                <Badge variant="secondary">{product.category.name}</Badge>
              )}
              {product.product_brands?.map((pb: { brand: { id: string; name: string } }) => (
                <Badge key={pb.brand.id} variant="outline">{pb.brand.name}</Badge>
              ))}
              {product.product_car_models?.map((pm: { car_model: { id: string; name: string } }) => (
                <Badge key={pm.car_model.id} variant="outline">{pm.car_model.name}</Badge>
              ))}
            </div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
          </div>

          <p className="text-2xl font-bold text-primary">{formatPrice(product.price)}</p>

          <Separator />

          <div>
            <h2 className="font-semibold mb-2">Descripción</h2>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <div className="flex items-center gap-4">
            <span className={`text-sm ${product.stock > 0 ? "text-green-600" : "text-destructive"}`}>
              {product.stock > 0 ? `${product.stock} en stock` : "Sin stock"}
            </span>
          </div>

          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
}
