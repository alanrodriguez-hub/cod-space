import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OrderStatusForm } from "@/components/admin/order-status-form";

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(price);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-CL", { dateStyle: "long", timeStyle: "short" }).format(new Date(date));
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*, product:products(name, brand, image_url))")
    .eq("id", id)
    .single();

  let client: { email: string; full_name: string | null; phone: string | null; address_street: string | null; address_city: string | null; address_region: string | null; address_zip: string | null } = {
    email: "—", full_name: null, phone: null, address_street: null, address_city: null, address_region: null, address_zip: null,
  };
  if (order) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name, phone, address_street, address_city, address_region, address_zip")
      .eq("id", order.user_id)
      .single();
    if (profile) client = { ...client, ...profile };
  }

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/pedidos" className={buttonVariants({ variant: "ghost", size: "sm" })}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Volver a pedidos
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pedido #{order.id.slice(0, 8)}</h1>
          <p className="text-muted-foreground">{formatDate(order.created_at)}</p>
        </div>
        <Badge className={`text-sm ${order.status === "pending" ? "bg-yellow-500 hover:bg-yellow-600" : order.status === "confirmed" ? "bg-blue-500 hover:bg-blue-600" : "bg-green-500 hover:bg-green-600"} text-white`}>
          {order.status === "pending" ? "Pendiente" : order.status === "confirmed" ? "Confirmado" : "Completado"}
        </Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4">Items del pedido</h2>
              <div className="space-y-3">
                {order.order_items?.map((item: { id: string; quantity: number; unit_price: number; product?: { name: string; brand: string } }) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{item.product?.name ?? "Producto eliminado"}</p>
                      <p className="text-sm text-muted-foreground">{item.product?.brand} · Cantidad: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(item.unit_price * item.quantity)}</p>
                      <p className="text-xs text-muted-foreground">{formatPrice(item.unit_price)} c/u</p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(order.total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-3">
              <h2 className="font-semibold">Cliente</h2>
              {client.full_name && <p className="text-sm font-medium">{client.full_name}</p>}
              <p className="text-sm text-muted-foreground">{client.email}</p>
              {client.phone && <p className="text-sm text-muted-foreground">{client.phone}</p>}
              {client.address_street && (
                <div className="text-sm text-muted-foreground pt-1 border-t">
                  <p>{client.address_street}</p>
                  <p>{client.address_city}{client.address_region ? `, ${client.address_region}` : ""}</p>
                  {client.address_zip && <p>CP: {client.address_zip}</p>}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-2">
              <h2 className="font-semibold">Método de Pago</h2>
              <div className="pt-1 border-t">
                <Badge variant={order.payment_method === "transfer" ? "default" : "secondary"} className="capitalize">
                  {order.payment_method === "transfer" ? "Transferencia" : "Efectivo"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold">Cambiar Estado</h2>
              <OrderStatusForm orderId={order.id} currentStatus={order.status} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
