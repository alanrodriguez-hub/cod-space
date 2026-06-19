import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/cart-context";
import { UserProvider } from "@/contexts/user-context";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Footer } from "@/components/footer";
import { getSettings } from "@/lib/data-cache";
import { SettingsProvider } from "@/contexts/settings-context";

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
  const settings = await getSettings();
  return {
    title: `${settings.site_name} - Catálogo de Repuestos de Autos`,
    description: "Encuentra los mejores repuestos para tu auto al mejor precio",
    metadataBase: new URL(
      settings.site_url
        ? settings.site_url.startsWith("http")
          ? settings.site_url
          : `https://${settings.site_url}`
        : "http://localhost:3000"
    ),
    icons: [
      { rel: "icon", type: "image/svg+xml", url: "/favicon.svg" },
      { rel: "icon", url: "/favicon.ico" },
      { rel: "apple-touch-icon", url: "/images/logo-full.png" },
    ],
    openGraph: {
      title: settings.site_name,
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
  const settings = await getSettings();

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
            <SettingsProvider initial={settings}>
              <Navbar siteName={settings.site_name} mapsUrl={settings.maps_url} />
              <main className="flex-1">{children}</main>
              <Footer siteName={settings.site_name} settings={settings} />
              <Toaster />
            </SettingsProvider>
          </CartProvider>
        </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
