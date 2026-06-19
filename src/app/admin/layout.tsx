"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Users, Package, FolderTree, ImageUp, Tag, Car, Upload, ImageIcon, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderNotifier } from "@/components/admin/order-notifier";
import type { ReactNode } from "react";

interface NavGroup {
  label: string;
  items: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
}

const navGroups: NavGroup[] = [
  {
    label: "General",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
      { href: "/admin/usuarios", label: "Usuarios", icon: Users },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { href: "/admin/productos", label: "Productos", icon: Package },
      { href: "/admin/categorias", label: "Categorías", icon: FolderTree },
      { href: "/admin/marcas", label: "Marcas", icon: Tag },
      { href: "/admin/modelos", label: "Modelos", icon: Car },
    ],
  },
  {
    label: "Herramientas",
    items: [
      { href: "/admin/productos/carga-masiva", label: "Carga Masiva", icon: Upload },
      { href: "/admin/productos/imagenes", label: "Imágenes", icon: ImageUp },
      { href: "/admin/banners", label: "Banners", icon: ImageIcon },
      { href: "/admin/settings", label: "Configuración", icon: Settings },
    ],
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <OrderNotifier />
      <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="hidden md:flex w-60 flex-col border-r bg-muted/30 p-4 gap-1">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-2">
            <h3 className="px-3 py-1.5 text-[11px] font-semibold uppercase text-muted-foreground/60 tracking-widest">
              {group.label}
            </h3>
            {group.items.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </aside>

      {/* Mobile nav — solo los items principales */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
        <div className="flex justify-around py-2">
          {navGroups.flatMap((g) => g.items).map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-1 text-xs transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex-1 p-6 md:p-8 pb-20 md:pb-8">{children}</div>
    </div>
    </>
  );
}
