import Image from "next/image";
import Link from "next/link";
import type { Brand } from "@/lib/types";

export function BrandShowcase({ brands }: { brands: Brand[] }) {
  const brandsWithImage = brands.filter((b) => b.image_url);
  if (brandsWithImage.length === 0) return null;

  return (
    <section className="py-12 bg-muted/20">
      <div className="container mx-auto px-4 mb-8">
        <h2 className="text-2xl font-bold text-center">Nuestras Marcas</h2>
        <p className="text-sm text-muted-foreground text-center mt-1">
          Trabajamos con repuestos para las marcas automotrices líderes del mercado
        </p>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {brandsWithImage.map((brand) => (
            <Link
              key={brand.id}
              href={`/catalogo?brand=${encodeURIComponent(brand.name)}`}
              className="group relative h-14 w-32 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
            >
              <Image
                src={brand.image_url!}
                alt={brand.name}
                fill
                className="object-contain"
                sizes="128px"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
