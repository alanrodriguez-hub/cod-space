import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/cart-context";
import { UserProvider } from "@/contexts/user-context";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <UserProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="border-t py-8 mt-auto">
              <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} AutoRepuestos. Todos los derechos reservados.
              </div>
            </footer>
            <Toaster />
          </CartProvider>
        </UserProvider>
      </body>
    </html>
  );
}
