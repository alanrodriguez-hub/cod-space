"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";

export function OrderNotifier() {
  const supabase = useRef(createClient());
  const notified = useRef(new Set<string>());

  useEffect(() => {
    const channel = supabase.current
      .channel("admin-orders")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          const orderId = payload.new.id as string;
          if (notified.current.has(orderId)) return;
          notified.current.add(orderId);

          toast(
            <div className="flex flex-col gap-1">
              <p className="font-semibold">Nuevo pedido recibido</p>
              <p className="text-sm text-muted-foreground">
                Total: {new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format((payload.new as { total: number }).total)}
              </p>
              <Link
                href={`/admin/pedidos/${orderId}`}
                className="text-xs text-primary underline hover:no-underline"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                Ver pedido
              </Link>
            </div>,
            { duration: 10000 }
          );
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return null;
}
