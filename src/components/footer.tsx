"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { SocialLinks } from "@/components/social-links";
import type { SiteSettings } from "@/lib/types";

interface FooterProps {
  siteName: string;
  settings: SiteSettings;
}

export function Footer({ siteName, settings }: FooterProps) {
  const contactEmail = settings.contact_email || "contacto@midiminio.cl";
  const contactPhone = settings.contact_phone || "+56 9 1234 5678";
  const contactAddress = settings.contact_address || "Mi dirección";
  const mapsUrl = settings.maps_url || "https://maps.google.com";
  const weekdayHours = settings.store_hours_weekday || "Lunes a Viernes: 9:00 a 13:00 y 15:00 a 17:00";
  const saturdayHours = settings.store_hours_saturday || "Sábados: 9:00 a 13:00";

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
                <SocialLinks settings={settings} />
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
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p>{weekdayHours}</p>
                  <p>{saturdayHours}</p>
                </div>
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
            Desarrollado con ❤️
          </p>
        </div>
      </div>
    </footer>
  );
}
