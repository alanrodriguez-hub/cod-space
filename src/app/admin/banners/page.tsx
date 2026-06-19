import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DeleteBannerButton } from "@/components/admin/delete-banner-button";
import { BannerFormWrapper as BannerForm } from "@/components/admin/banner-form-wrapper";

export default async function AdminBannersPage() {
  const supabase = await createClient();
  const { data: banners } = await supabase
    .from("banners")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Banners</h1>
        <Link href="/admin/banners?action=new" className={buttonVariants()}>
          <Plus className="h-4 w-4 mr-1" /> Nuevo Banner
        </Link>
      </div>

      <BannerForm />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Orden</th>
                  <th className="text-left p-3 font-medium">Título</th>
                  <th className="text-left p-3 font-medium">Subtítulo</th>
                  <th className="text-left p-3 font-medium">Enlace</th>
                  <th className="text-left p-3 font-medium">Estado</th>
                  <th className="text-left p-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {banners?.map((banner) => (
                  <tr key={banner.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3 text-muted-foreground">{banner.sort_order}</td>
                    <td className="p-3 font-medium">{banner.title}</td>
                    <td className="p-3 text-muted-foreground">{banner.subtitle || "—"}</td>
                    <td className="p-3 text-muted-foreground text-xs font-mono truncate max-w-40">
                      {banner.link_url || "—"}
                    </td>
                    <td className="p-3">
                      <Badge variant={banner.active ? "default" : "secondary"}>
                        {banner.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td className="p-3 flex gap-1">
                      <Link
                        href={`/admin/banners?action=edit&id=${banner.id}`}
                        className={buttonVariants({ variant: "ghost", size: "sm" })}
                      >
                        Editar
                      </Link>
                      <DeleteBannerButton bannerId={banner.id} bannerTitle={banner.title} />
                    </td>
                  </tr>
                ))}
                {(!banners || banners.length === 0) && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-muted-foreground">
                      No hay banners
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
