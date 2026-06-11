"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DeleteBannerButton({ bannerId, bannerTitle }: { bannerId: string; bannerTitle: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    if (!confirm(`¿Eliminar el banner "${bannerTitle}"?`)) return;

    setLoading(true);
    const { error } = await supabase.from("banners").delete().eq("id", bannerId);
    setLoading(false);

    if (error) {
      toast.error("Error al eliminar el banner");
      return;
    }

    toast.success("Banner eliminado");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={loading}>
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  );
}
