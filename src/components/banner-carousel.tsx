"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Banner } from "@/lib/types";

const defaultBanners = [
  {
    id: "default-1",
    title: "Bienvenido a AutoRepuestos",
    subtitle: "Encuentra los mejores repuestos para tu auto al mejor precio",
    image_url: "",
    link_url: "/catalogo",
  },
  {
    id: "default-2",
    title: "Envío a todo el país",
    subtitle: "Recibe tus repuestos en la puerta de tu casa",
    image_url: "",
    link_url: "/catalogo",
  },
];

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const items = banners.length > 0 ? banners : defaultBanners;
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [next, items.length]);

  const slide = items[current];

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <div className="relative h-[280px] sm:h-[360px] md:h-[420px]">
        {slide.image_url ? (
          <Image
            src={slide.image_url}
            alt={slide.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-primary/10 flex items-center justify-center">
            <ShoppingBag className="h-24 w-24 text-primary/20" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

        <div className="relative h-full container mx-auto px-4 flex flex-col justify-center">
          <div className="max-w-xl space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
              {slide.title}
            </h2>
            {slide.subtitle && (
              <p className="text-lg sm:text-xl text-white/90 drop-shadow">
                {slide.subtitle}
              </p>
            )}
            {slide.link_url && (
              <Link href={slide.link_url}>
                <Button size="lg" className="mt-2">
                  Ver más
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {items.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 text-white hover:bg-black/50"
            onClick={prev}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 text-white hover:bg-black/50"
            onClick={next}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === current ? "w-8 bg-white" : "w-2 bg-white/50"
                }`}
                onClick={() => setCurrent(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
