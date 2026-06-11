import Image from "next/image";
import Link from "next/link";
import type { Brand } from "@/lib/types";

export function BrandShowcase({ brands }: { brands: Brand[] }) {
  const brandsWithImage = brands.filter((b) => b.image_url);
  if (brandsWithImage.length === 0) return null;

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Nuestras Marcas</h2>
        <div className="flex flex-wrap justify-center items-center gap-8">
          {brandsWithImage.map((brand) => (
            <Link
              key={brand.id}
              href={`/catalogo?brand=${encodeURIComponent(brand.name)}`}
              className="group relative h-16 w-32 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
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
