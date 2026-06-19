import Image from "next/image";
import Link from "next/link";
import type { Brand } from "@/lib/types";

export function BrandShowcase({ brands }: { brands: Brand[] }) {
  const brandsWithImage = brands.filter((b) => b.image_url);
  if (brandsWithImage.length === 0) return null;

  // Repetimos la lista de marcas para garantizar que el desplazamiento horizontal sea fluido,
  // largo y de ciclo infinito perfectamente continuo (sin cortes visuales)
  const repeatedBrands = Array.from({ length: 4 }).flatMap(() => brandsWithImage);

  return (
    <section className="py-12 bg-muted/20 overflow-hidden">
      <div className="container mx-auto px-4 mb-6">
        <h2 className="text-2xl font-bold text-center">Nuestras Marcas</h2>
        <p className="text-sm text-muted-foreground text-center mt-1">
          Trabajamos con repuestos para las marcas automotrices líderes del mercado
        </p>
      </div>

      {/* Contenedor principal de la cinta de marcas */}
      <div className="relative w-full overflow-hidden py-4">
        {/* Degradados laterales para desvanecer logos en los extremos (fade edge effect) */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="flex w-max">
          <div className="flex gap-16 items-center animate-marquee whitespace-nowrap">
            {repeatedBrands.map((brand, index) => (
              <Link
                key={`${brand.id}-${index}`}
                href={`/catalogo?brand=${encodeURIComponent(brand.name)}`}
                className="group relative h-12 w-28 flex-shrink-0 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              >
                <Image
                  src={brand.image_url!}
                  alt={brand.name}
                  fill
                  className="object-contain"
                  sizes="112px"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Inyección de estilos CSS encapsulados para la animación del Marquee */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 35s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />
    </section>
  );
}
