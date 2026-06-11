import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Eye } from "lucide-react";

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(price);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-CL", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date));
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  pending: { label: "Pendiente", variant: "secondary" },
  confirmed: { label: "Confirmado", variant: "default" },
  completed: { label: "Completado", variant: "outline" },
};

export default async function AdminPedidosPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(id)")
    .order("created_at", { ascending: false });

  const userIds = [...new Set(orders?.map((o) => o.user_id) ?? [])];
  const { data: profiles } = userIds.length > 0
    ? await supabase.from("profiles").select("id, email").in("id", userIds)
    : { data: [] };
  const profileMap = new Map(profiles?.map((p) => [p.id, p.email]) ?? []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestión de Pedidos</h1>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">ID</th>
                  <th className="text-left p-3 font-medium">Cliente</th>
                  <th className="text-left p-3 font-medium">Items</th>
                  <th className="text-left p-3 font-medium">Total</th>
                  <th className="text-left p-3 font-medium">Estado</th>
                  <th className="text-left p-3 font-medium">Fecha</th>
                  <th className="text-left p-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orders?.map((order) => {
                  const status = statusConfig[order.status] ?? statusConfig.pending;
                  return (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3 font-mono text-xs">{order.id.slice(0, 8)}</td>
                      <td className="p-3">{profileMap.get(order.user_id) ?? "—"}</td>
                      <td className="p-3">{(order.order_items as { id: string }[])?.length ?? 0}</td>
                      <td className="p-3 font-medium">{formatPrice(order.total)}</td>
                      <td className="p-3">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{formatDate(order.created_at)}</td>
                      <td className="p-3">
                        <Link href={`/admin/pedidos/${order.id}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                          <Eye className="h-4 w-4 mr-1" /> Ver
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {(!orders || orders.length === 0) && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-muted-foreground">
                      No hay pedidos
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
