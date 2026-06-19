"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

export function DeleteBannerButton({ bannerId, bannerTitle }: { bannerId: string; bannerTitle: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    setLoading(true);
    const { error } = await supabase.from("banners").delete().eq("id", bannerId);
    setLoading(false);

    if (error) {
      toast.error("Error al eliminar", { description: "No se pudo eliminar el banner. Intenta nuevamente." });
      setOpen(false);
      return;
    }

    toast.success("Banner eliminado", { description: `"${bannerTitle}" fue eliminado correctamente.` });
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Eliminar banner"
        description={`¿Estás seguro de eliminar el banner "${bannerTitle}"?`}
        confirmLabel="Eliminar"
        loading={loading}
        onConfirm={handleDelete}
      />
    </>
  );
}
