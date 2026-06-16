"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";
import { SocialLinks } from "@/components/social-links";

interface FooterProps {
  siteName: string;
}

export function Footer({ siteName }: FooterProps) {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contacto@codspace.cl";
  const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || "+56 9 1234 5678";
  const contactAddress = process.env.NEXT_PUBLIC_CONTACT_ADDRESS || "Av. Nueva Providencia 1881, Providencia, Santiago";
  const mapsUrl = process.env.NEXT_PUBLIC_MAPS_URL || "https://maps.google.com";

  return (
    <footer className="border-t bg-muted/20 mt-auto py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-left">
          {/* Columna 1: Logo, Nombre & Síguenos */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Image
                src="/images/logo-vector-full.svg"
                alt={siteName}
                height={32}
                width={96}
                className="opacity-90 dark:opacity-100"
                unoptimized
              />
            </div>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              Encuentra los mejores repuestos de marcas chinas de alta calidad para tu vehículo al mejor precio del mercado.
            </p>
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Síguenos
              </h4>
              <div className="flex justify-start">
                <SocialLinks />
              </div>
            </div>
          </div>

          {/* Columna 2: Información */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold tracking-tight text-foreground">
              Información
            </h3>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <Link href="/privacidad" className="hover:text-primary transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="hover:text-primary transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/catalogo" className="hover:text-primary transition-colors">
                  Catálogo de Repuestos
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Contáctanos */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold tracking-tight text-foreground">
              Contáctanos
            </h3>
            <ul className="space-y-3 text-xs text-muted-foreground">
              <li>
                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <span>{contactEmail}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${contactPhone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <span>{contactPhone}</span>
                </a>
              </li>
              <li>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 hover:text-primary transition-colors"
                >
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{contactAddress}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Derechos de autor */}
        <div className="border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} {siteName}. Todos los derechos reservados.
          </p>
          <p className="text-[10px] opacity-75">
            Desarrollado con ❤️ para repuestos de marcas chinas en Chile.
          </p>
        </div>
      </div>
    </footer>
  );
}
