"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function ToggleFeaturedButton({ productId, featured }: { productId: string; featured: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleToggle() {
    setLoading(true);
    const { error } = await supabase.from("products").update({ featured: !featured }).eq("id", productId);
    setLoading(false);

    if (error) {
      toast.error("Error al actualizar", { description: "No se pudo cambiar el estado de destacado." });
      return;
    }

    toast.success(featured ? "Removido de destacados" : "Marcado como destacado", { description: featured ? "El producto ya no aparecerá en la página principal." : "El producto ahora aparecerá en la página principal." });
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleToggle} disabled={loading} title={featured ? "Quitar de destacados" : "Marcar como destacado"}>
      <Star className={cn("h-4 w-4", featured ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
    </Button>
  );
}
