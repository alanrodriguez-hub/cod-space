"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, User, LogOut, Menu, X, Search, Shield } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/cart-context";
import { useUser } from "@/contexts/user-context";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const { totalItems } = useCart();
  const { user, isAdmin } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/catalogo?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-primary">
          AutoRepuestos
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/catalogo" className="text-sm font-medium hover:text-primary transition-colors">
            Catálogo
          </Link>
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar repuestos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 w-64"
            />
          </form>
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
            <>
              <Link href="/pedidos" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Mis Pedidos
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </>
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
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar repuestos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
          </form>
          <Link href="/catalogo" className="block text-sm font-medium py-2" onClick={() => setMenuOpen(false)}>
            Catálogo
          </Link>
          {isAdmin && (
            <Link href="/admin" className="flex items-center gap-2 text-sm font-medium py-2 text-primary" onClick={() => setMenuOpen(false)}>
              <Shield className="h-4 w-4" /> Panel Admin
            </Link>
          )}
          {user ? (
            <>
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
