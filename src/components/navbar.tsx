"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ShoppingCart, User, LogOut, Menu, X, Shield, MapPin } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { useUser } from "@/contexts/user-context";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar({ siteName, mapsUrl }: { siteName: string; mapsUrl: string }) {
  const { totalItems } = useCart();
  const { user, isAdmin } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logo-vector-full.svg"
            alt={siteName}
            height={36}
            width={108}
            priority
            unoptimized
            style={{ height: "auto" }}
          />
        </Link>

        <div className="hidden md:flex items-center gap-5">
          <Link href="/catalogo" className="text-sm font-medium hover:text-primary transition-colors">
            Catálogo
          </Link>
          <a
            href={mapsUrl || "https://maps.google.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/10 text-primary transition-all text-xs font-semibold group"
          >
            <MapPin className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
            <span>Nuestra Sucursal</span>
          </a>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {isAdmin && (
            <Link href="/admin" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              <Shield className="h-4 w-4 mr-1" />
              Admin
            </Link>
          )}
          <Link href="/carrito" className={buttonVariants({ variant: "ghost", size: "icon" }) + " relative"}>
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {totalItems}
              </Badge>
            )}
          </Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" className="relative rounded-full">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Menú de usuario</span>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Mi Cuenta</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/perfil" className="cursor-pointer w-full flex items-center" />}>
                  Mi Perfil
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/pedidos" className="cursor-pointer w-full flex items-center" />}>
                  Mis Pedidos
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/login" className={buttonVariants({ variant: "ghost", size: "icon" })}>
              <User className="h-5 w-5" />
            </Link>
          )}
          <ThemeToggle />
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/carrito" className={buttonVariants({ variant: "ghost", size: "icon" }) + " relative"}>
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {totalItems}
              </Badge>
            )}
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t p-4 space-y-3 bg-background">
          <Link href="/catalogo" className="block text-sm font-medium py-2" onClick={() => setMenuOpen(false)}>
            Catálogo
          </Link>
          <a
            href={mapsUrl || "https://maps.google.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/10 text-primary transition-colors text-sm font-semibold w-full"
            onClick={() => setMenuOpen(false)}
          >
            <MapPin className="h-4 w-4 text-primary" />
            <span>Nuestra Sucursal</span>
          </a>
          {isAdmin && (
            <Link href="/admin" className="flex items-center gap-2 text-sm font-medium py-2 text-primary" onClick={() => setMenuOpen(false)}>
              <Shield className="h-4 w-4" /> Panel Admin
            </Link>
          )}
          {user ? (
            <>
              <Link href="/perfil" className="block text-sm font-medium py-2" onClick={() => setMenuOpen(false)}>
                Mi Perfil
              </Link>
              <Link href="/pedidos" className="block text-sm font-medium py-2" onClick={() => setMenuOpen(false)}>
                Mis Pedidos
              </Link>
              <button onClick={handleLogout} className="block text-sm font-medium py-2 text-destructive">
                Cerrar Sesión
              </button>
            </>
          ) : (
            <Link href="/auth/login" className="block text-sm font-medium py-2" onClick={() => setMenuOpen(false)}>
              Iniciar Sesión
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
