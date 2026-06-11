import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package } from "lucide-react";

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(price);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-CL", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date));
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  pending: { label: "Pendiente", variant: "secondary" },
  confirmed: { label: "Confirmado", variant: "default" },
  completed: { label: "Completado", variant: "outline" },
};

export default async function PedidosPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*, product:products(name, brand))")
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mis Pedidos</h1>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Package className="h-16 w-16 mx-auto mb-4" />
          <p className="text-lg">Aún no tienes pedidos</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const status = statusLabels[order.status] || statusLabels.pending;
            return (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Pedido #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <span className="font-bold text-lg">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    {order.order_items?.map((item: { id: string; quantity: number; unit_price: number; product?: { name: string; brand: string } }) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.product?.name || "Producto"} ({item.product?.brand}) x{item.quantity}
                        </span>
                        <span>{formatPrice(item.unit_price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
