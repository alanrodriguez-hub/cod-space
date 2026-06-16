import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Users, Package, FolderTree, DollarSign, Clock, CheckCircle, CircleDot, XCircle } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: totalProducts },
    { count: totalUsers },
    { count: totalCategories },
    { count: pendingOrders },
    { count: confirmedOrders },
    { count: completedOrders },
    { count: cancelledOrders },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "cancelled"),
    supabase.from("orders").select("id, user_id, total, status, created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const orderUserIds = [...new Set(recentOrders?.map((o) => o.user_id) ?? [])];
  const { data: orderProfiles } = orderUserIds.length > 0
    ? await supabase.from("profiles").select("id, email").in("id", orderUserIds)
    : { data: [] };
  const profileMap = new Map(orderProfiles?.map((p) => [p.id, p.email]) ?? []);

  const generalStats = [
    { label: "Productos", value: totalProducts ?? 0, icon: Package, color: "text-blue-600", href: "/admin/productos" },
    { label: "Usuarios", value: totalUsers ?? 0, icon: Users, color: "text-purple-600", href: "/admin/usuarios" },
    { label: "Categorías", value: totalCategories ?? 0, icon: FolderTree, color: "text-orange-600", href: "/admin/categorias" },
  ];

  const orderStats = [
    { label: "Pendientes", value: pendingOrders ?? 0, icon: Clock, color: "text-yellow-600", bg: "border-yellow-500/30 bg-yellow-50 dark:bg-yellow-950/20", href: "/admin/pedidos?status=pending" },
    { label: "Confirmados", value: confirmedOrders ?? 0, icon: CircleDot, color: "text-blue-600", bg: "border-blue-500/30 bg-blue-50 dark:bg-blue-950/20", href: "/admin/pedidos?status=confirmed" },
    { label: "Completados", value: completedOrders ?? 0, icon: CheckCircle, color: "text-green-600", bg: "border-green-500/30 bg-green-50 dark:bg-green-950/20", href: "/admin/pedidos?status=completed" },
    { label: "Cancelados", value: cancelledOrders ?? 0, icon: XCircle, color: "text-red-600", bg: "border-red-500/30 bg-red-50 dark:bg-red-950/20", href: "/admin/pedidos?status=cancelled" },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500 hover:bg-yellow-600 text-white",
    confirmed: "bg-blue-500 hover:bg-blue-600 text-white",
    completed: "bg-green-500 hover:bg-green-600 text-white",
    cancelled: "bg-red-500 hover:bg-red-600 text-white",
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(price);

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("es-CL", { dateStyle: "short", timeStyle: "short" }).format(new Date(date));

  const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    confirmed: "Confirmado",
    completed: "Completado",
    cancelled: "Cancelado",
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {generalStats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" /> Pedidos por Estado
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {orderStats.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <Card className={`border ${stat.bg} hover:opacity-80 transition-opacity cursor-pointer`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
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
                      <td className="p-3">{profileMap.get(order.user_id) ?? "—"}</td>
                      <td className="p-3 font-medium">{formatPrice(order.total)}</td>
                      <td className="p-3">
                        <Badge className={statusColors[order.status] ?? statusColors.pending}>
                          {statusLabels[order.status] ?? order.status}
                        </Badge>
                      </td>
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
