"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DeleteCategoryButton({ categoryId, categoryName }: { categoryId: string; categoryName: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    if (!confirm(`¿Eliminar la categoría "${categoryName}"? Los productos asociados quedarán sin categoría.`)) return;

    setLoading(true);
    const { error } = await supabase.from("categories").delete().eq("id", categoryId);
    setLoading(false);

    if (error) {
      toast.error("Error al eliminar la categoría");
      return;
    }

    toast.success("Categoría eliminada");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={loading}>
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  );
}
