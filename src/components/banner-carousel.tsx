"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import type { Banner } from "@/lib/types";

export function BannerCarousel({ banners, siteName }: { banners: Banner[]; siteName?: string }) {
  const defaultBanners = [
    {
      id: "default-1",
      title: `Bienvenido a ${siteName || "tu sitio para tu auto"}`,
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

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 border-b border-border">
      {/* Explicit Pixel Heights to prevent Next.js fill height collapse during hydration */}
      <div className="relative w-full h-[180px] sm:h-[260px] md:h-[340px] lg:h-[420px]">
        {items.map((item, index) => {
          const isActive = index === current;
          return (
            <div
              key={item.id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-[1.02] pointer-events-none"
              }`}
            >
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt={item.title}
                  fill
                  className="object-cover object-center"
                  sizes="100vw"
                  priority={index === 0}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-primary/10 flex items-center justify-center">
                  <ShoppingBag className="h-16 w-16 sm:h-24 sm:w-24 text-primary/20" />
                </div>
              )}

              {/* Elegant dark vignette overlay to ensure text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />

              {/* Dynamic Content Overlay with perfect positioning */}
              <div className="relative h-full container mx-auto px-6 sm:px-12 md:px-16 flex flex-col justify-center">
                <div className="max-w-xl space-y-2 sm:space-y-3 md:space-y-4">
                  <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight drop-shadow-md leading-tight">
                    {item.title}
                  </h2>
                  {item.subtitle && (
                    <p className="text-xs sm:text-base md:text-lg lg:text-xl text-white/90 font-medium drop-shadow-sm max-w-lg leading-relaxed">
                      {item.subtitle}
                    </p>
                  )}
                  {item.link_url && (
                    <div className="pt-1 sm:pt-2">
                      <Link
                        href={item.link_url}
                        className={buttonVariants({ size: "lg", className: "shadow-md hover:shadow-lg transition-all font-semibold h-8 sm:h-9 text-xs sm:text-sm px-4 sm:px-6 cursor-pointer" })}
                      >
                        Ver más
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Nav Controls */}
      {items.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-black/25 text-white hover:bg-black/55 backdrop-blur-xs hover:scale-105 active:scale-95 transition-all z-20 cursor-pointer border border-white/10"
            onClick={prev}
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-black/25 text-white hover:bg-black/55 backdrop-blur-xs hover:scale-105 active:scale-95 transition-all z-20 cursor-pointer border border-white/10"
            onClick={next}
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-20">
            {items.map((_, i) => (
              <button
                key={i}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  i === current ? "w-6 sm:w-8 bg-white" : "w-1.5 sm:w-2 bg-white/40 hover:bg-white/60"
                }`}
                onClick={() => setCurrent(i)}
                aria-label={`Ir al banner ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
