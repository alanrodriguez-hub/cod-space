import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/data-cache";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Store, Truck, User, CreditCard } from "lucide-react";
import { OrderStatusInline } from "@/components/admin/order-status-inline";

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

  const deliveryMethod = order.delivery_method === "pickup" ? "pickup" : "shipping";
  const settings = await getSettings();

  return (
    <div className="space-y-4">
      <Link href="/admin/pedidos" className={buttonVariants({ variant: "ghost", size: "sm" })}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Volver a pedidos
      </Link>

      <Card size="sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle>Pedido #{order.id.slice(0, 8)}</CardTitle>
              <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <OrderStatusInline orderId={order.id} currentStatus={order.status} />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Card size="sm">
            <CardHeader>
              <CardTitle>Items del pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {order.order_items?.map((item: { id: string; quantity: number; unit_price: number; product?: { name: string; brand: string } }) => (
                  <div key={item.id} className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-medium">{item.product?.name ?? "Producto eliminado"}</p>
                      <p className="text-xs text-muted-foreground">{item.product?.brand} · Cantidad: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(item.unit_price * item.quantity)}</p>
                      <p className="text-xs text-muted-foreground">{formatPrice(item.unit_price)} c/u</p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(order.total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <Card size="sm">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0 text-sm">
                  {client.full_name && <p className="font-medium truncate">{client.full_name}</p>}
                  <p className="text-muted-foreground truncate">{client.email}</p>
                  {client.phone && <p className="text-muted-foreground">{client.phone}</p>}
                  {deliveryMethod === "shipping" && client.address_street && (
                    <div className="text-muted-foreground mt-1 pt-1 border-t text-xs">
                      <p>{client.address_street}</p>
                      <p>{client.address_city}{client.address_region ? `, ${client.address_region}` : ""}</p>
                      {client.address_zip && <p>CP: {client.address_zip}</p>}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardContent className="space-y-2 pt-4">
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="font-medium">Pago</span>
                <Badge variant={order.payment_method === "transfer" ? "default" : "secondary"} className="ml-auto capitalize">
                  {order.payment_method === "transfer" ? "Transferencia" : "Efectivo"}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-start gap-2 text-sm">
                {deliveryMethod === "pickup" ? (
                  <Store className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                ) : (
                  <Truck className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="font-medium">{deliveryMethod === "pickup" ? "Retiro en Tienda" : "Envío a Domicilio"}</p>
                  {deliveryMethod === "pickup" && (
                    <p className="text-xs text-muted-foreground">{settings.contact_address || "Consultar"}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
