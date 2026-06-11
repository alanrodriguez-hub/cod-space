"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${productName}"? Esta acción no se puede deshacer.`)) return;

    setLoading(true);
    const { error } = await supabase.from("products").delete().eq("id", productId);
    setLoading(false);

    if (error) {
      toast.error("Error al eliminar el producto");
      return;
    }

    toast.success("Producto eliminado");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={loading}>
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  );
}
