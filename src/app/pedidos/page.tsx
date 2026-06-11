import { createClient } from "@/lib/supabase/server";
import { Package } from "lucide-react";
import { OrdersTabs } from "@/components/orders-tabs";

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
        <OrdersTabs orders={orders} />
      )}
    </div>
  );
}
