import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Package, FolderTree, Clock, CheckCircle, CircleDot, XCircle } from "lucide-react";
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
    { label: "Productos", value: totalProducts ?? 0, icon: Package, href: "/admin/productos" },
    { label: "Usuarios", value: totalUsers ?? 0, icon: Users, href: "/admin/usuarios" },
    { label: "Categorías", value: totalCategories ?? 0, icon: FolderTree, href: "/admin/categorias" },
  ];

  const orderStats = [
    { label: "Pendientes", value: pendingOrders ?? 0, icon: Clock, badge: "bg-yellow-500/15 text-yellow-600", href: "/admin/pedidos?status=pending" },
    { label: "Confirmados", value: confirmedOrders ?? 0, icon: CircleDot, badge: "bg-blue-500/15 text-blue-600", href: "/admin/pedidos?status=confirmed" },
    { label: "Completados", value: completedOrders ?? 0, icon: CheckCircle, badge: "bg-green-500/15 text-green-600", href: "/admin/pedidos?status=completed" },
    { label: "Cancelados", value: cancelledOrders ?? 0, icon: XCircle, badge: "bg-red-500/15 text-red-600", href: "/admin/pedidos?status=cancelled" },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500 text-white",
    confirmed: "bg-blue-500 text-white",
    completed: "bg-green-500 text-white",
    cancelled: "bg-red-500 text-white",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    confirmed: "Confirmado",
    completed: "Completado",
    cancelled: "Cancelado",
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(price);

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("es-CL", { dateStyle: "short", timeStyle: "short" }).format(new Date(date));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-3 gap-3">
        {generalStats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card size="sm" className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-3 py-3">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-lg font-bold leading-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card size="sm">
        <CardHeader>
          <CardTitle>Pedidos por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {orderStats.map((stat) => (
              <Link key={stat.label} href={stat.href}>
                <div className="flex flex-col items-center gap-1 rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className={`rounded-full p-1.5 ${stat.badge}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <p className="text-lg font-bold leading-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle>Pedidos Recientes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                  <TableCell>{profileMap.get(order.user_id) ?? "—"}</TableCell>
                  <TableCell className="font-medium">{formatPrice(order.total)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[order.status] ?? statusColors.pending}>
                      {statusLabels[order.status] ?? order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(order.created_at)}</TableCell>
                </TableRow>
              ))}
              {(!recentOrders || recentOrders.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                    No hay pedidos aún
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
