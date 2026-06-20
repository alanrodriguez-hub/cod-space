"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { QuoteStatus } from "@/lib/types";

const statusLabels: Record<QuoteStatus, string> = {
  pending: "Pendiente",
  contacted: "Contactado",
  completed: "Completada",
  cancelled: "Cancelada",
};

const statusColors: Record<QuoteStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  contacted: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-gray-100 text-gray-800 border-gray-200",
};

export function StatusSelect({
  currentStatus,
  quoteId,
}: {
  currentStatus: QuoteStatus;
  quoteId: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  async function handleChange(value: string) {
    const newStatus = value as QuoteStatus;
    setLoading(true);

    const res = await fetch(`/api/quotes/${quoteId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    setLoading(false);

    if (!res.ok) {
      toast.error("Error al actualizar estado");
      return;
    }

    setStatus(newStatus);
    toast.success(`Estado cambiado a "${statusLabels[newStatus]}"`);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={status} onValueChange={handleChange} disabled={loading}>
        <SelectTrigger className="w-44 cursor-pointer">
          <SelectValue>
            <Badge className={statusColors[status]} variant="outline">
              {statusLabels[status]}
            </Badge>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(statusLabels) as QuoteStatus[]).map((s) => (
            <SelectItem key={s} value={s} className="cursor-pointer">
              <Badge className={statusColors[s]} variant="outline">
                {statusLabels[s]}
              </Badge>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
