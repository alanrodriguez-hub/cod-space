"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const statuses = [
  { value: "pending", label: "Pendiente", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  { value: "confirmed", label: "Confirmado", color: "bg-blue-100 text-blue-800 border-blue-300" },
  { value: "completed", label: "Completado", color: "bg-green-100 text-green-800 border-green-300" },
  { value: "cancelled", label: "Cancelado", color: "bg-red-100 text-red-800 border-red-300" },
];

export function OrderStatusForm({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSave() {
    setLoading(true);
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    setLoading(false);

    if (error) {
      toast.error("Error al actualizar el estado");
      return;
    }

    toast.success("Estado actualizado");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2">
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatus(s.value)}
            className={cn(
              "px-3 py-2 rounded-md border text-sm font-medium transition-all text-left",
              status === s.value ? s.color : "border-border hover:bg-muted"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
      {status !== currentStatus && (
        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? "Guardando..." : "Guardar Cambio"}
        </Button>
      )}
    </div>
  );
}
