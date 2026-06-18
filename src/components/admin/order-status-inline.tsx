"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const statuses = [
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmado" },
  { value: "completed", label: "Completado" },
  { value: "cancelled", label: "Cancelado" },
];

const activeStyles: Record<string, string> = {
  pending: "bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600 hover:text-white",
  confirmed: "bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:text-white",
  completed: "bg-green-500 text-white border-green-500 hover:bg-green-600 hover:text-white",
  cancelled: "bg-red-500 text-white border-red-500 hover:bg-red-600 hover:text-white",
};

export function OrderStatusInline({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleChange(status: string) {
    if (status === currentStatus || loading) return;
    setLoading(true);
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    setLoading(false);

    if (error) {
      toast.error("Error al actualizar el estado");
      return;
    }

    toast.success(`Estado cambiado a ${statuses.find((s) => s.value === status)?.label}`);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((s) => {
        const isActive = s.value === currentStatus;
        return (
          <Button
            key={s.value}
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => handleChange(s.value)}
            className={`flex-1 sm:flex-none cursor-pointer transition-all ${isActive ? activeStyles[s.value] : "hover:bg-muted"}`}
          >
            {s.label}
          </Button>
        );
      })}
    </div>
  );
}
