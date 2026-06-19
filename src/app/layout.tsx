import { Geist, Geist_Mono, Roboto, Figtree } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/cart-context";
import { UserProvider } from "@/contexts/user-context";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { SocialLinks } from "@/components/social-links";
import { Footer } from "@/components/footer";
import { getSiteName } from "@/lib/data-cache";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata() {
  const siteName = await getSiteName();
  return {
    title: `${siteName} - Catálogo de Repuestos de Autos`,
    description: "Encuentra los mejores repuestos para tu auto al mejor precio",
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    icons: [
      { rel: "icon", type: "image/svg+xml", url: "/favicon.svg" },
      { rel: "icon", url: "/favicon.ico" },
      { rel: "apple-touch-icon", url: "/images/logo-full.png" },
    ],
    openGraph: {
      title: siteName,
      description: "Encuentra los mejores repuestos para tu auto al mejor precio",
      images: [{ url: "/images/logo-full.png", width: 5042, height: 3600 }],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteName = await getSiteName();

  return (
    <html
      lang="es"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
        <UserProvider>
          <CartProvider>
            <Navbar siteName={siteName} />
            <main className="flex-1">{children}</main>
            <Footer siteName={siteName} />
            <Toaster />
          </CartProvider>
        </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
