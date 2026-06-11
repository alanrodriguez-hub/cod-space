import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, Users, Package, FolderTree, DollarSign, Clock } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: totalProducts },
    { count: totalOrders },
    { count: totalUsers },
    { count: totalCategories },
    { count: pendingOrders },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("id, total, status, created_at, profiles(email)").order("created_at", { ascending: false }).limit(5),
  ]);

  const stats = [
    { label: "Productos", value: totalProducts ?? 0, icon: Package, color: "text-blue-600" },
    { label: "Pedidos", value: totalOrders ?? 0, icon: ShoppingBag, color: "text-green-600" },
    { label: "Usuarios", value: totalUsers ?? 0, icon: Users, color: "text-purple-600" },
    { label: "Categorías", value: totalCategories ?? 0, icon: FolderTree, color: "text-orange-600" },
    { label: "Pendientes", value: pendingOrders ?? 0, icon: Clock, color: "text-yellow-600" },
  ];

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(price);

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("es-CL", { dateStyle: "short", timeStyle: "short" }).format(new Date(date));

  const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    confirmed: "Confirmado",
    completed: "Completado",
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5" /> Pedidos Recientes
        </h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">ID</th>
                    <th className="text-left p-3 font-medium">Cliente</th>
                    <th className="text-left p-3 font-medium">Total</th>
                    <th className="text-left p-3 font-medium">Estado</th>
                    <th className="text-left p-3 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders?.map((order) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="p-3 font-mono text-xs">{order.id.slice(0, 8)}</td>
                      <td className="p-3">{(order.profiles as unknown as { email: string } | null)?.email ?? "—"}</td>
                      <td className="p-3 font-medium">{formatPrice(order.total)}</td>
                      <td className="p-3">{statusLabels[order.status] ?? order.status}</td>
                      <td className="p-3 text-muted-foreground">{formatDate(order.created_at)}</td>
                    </tr>
                  ))}
                  {(!recentOrders || recentOrders.length === 0) && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-muted-foreground">
                        No hay pedidos aún
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
