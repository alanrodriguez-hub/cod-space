import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/cart-context";
import { UserProvider } from "@/contexts/user-context";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { SocialLinks } from "@/components/social-links";

const roboto = Roboto({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AutoRepuestos - Catálogo de Repuestos de Autos",
  description: "Encuentra los mejores repuestos para tu auto al mejor precio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", roboto.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
        <UserProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="border-t py-8 mt-auto">
              <div className="container mx-auto px-4 text-center text-sm text-muted-foreground space-y-3">
                <SocialLinks />
                <p>© {new Date().getFullYear()} AutoRepuestos. Todos los derechos reservados.</p>
                <p>
                  <a href="/privacidad" className="underline hover:no-underline">
                    Política de Privacidad
                  </a>
                </p>
              </div>
            </footer>
            <Toaster />
          </CartProvider>
        </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
