import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { AdminOrderFilters } from "@/components/admin/order-filters";
import { Pagination } from "@/components/pagination";

const PAGE_SIZE = 10;

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(price);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-CL", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date));
}

function encodeCursor(createdAt: string, id: string): string {
  return Buffer.from(`${createdAt}|${id}`).toString("base64url");
}

function decodeCursor(cursor: string): { createdAt: string; id: string } {
  const decoded = Buffer.from(cursor, "base64url").toString("utf-8");
  const pipe = decoded.lastIndexOf("|");
  return { createdAt: decoded.slice(0, pipe), id: decoded.slice(pipe + 1) };
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500 hover:bg-yellow-600 text-white",
  confirmed: "bg-blue-500 hover:bg-blue-600 text-white",
  completed: "bg-green-500 hover:bg-green-600 text-white",
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  completed: "Completado",
};

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; from?: string; to?: string; after?: string; before?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("*, order_items(id)")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (params.status) {
    query = query.eq("status", params.status);
  }
  if (params.from) {
    query = query.gte("created_at", `${params.from}T00:00:00`);
  }
  if (params.to) {
    query = query.lte("created_at", `${params.to}T23:59:59`);
  }

  const after = params.after;
  const before = params.before;
  let cursorValue: { createdAt: string; id: string } | null = null;
  let isForward = true;

  if (after) {
    cursorValue = decodeCursor(after);
    isForward = true;
  } else if (before) {
    cursorValue = decodeCursor(before);
    isForward = false;
  }

  if (cursorValue) {
    if (isForward) {
      query = query
        .or(`created_at.lt.${cursorValue.createdAt},and(created_at.eq.${cursorValue.createdAt},id.lt.${cursorValue.id})`);
    } else {
      query = query
        .or(`created_at.gt.${cursorValue.createdAt},and(created_at.eq.${cursorValue.createdAt},id.gt.${cursorValue.id})`)
        .order("id", { ascending: true });
    }
  }

  const { data: rawOrders } = await query.limit(PAGE_SIZE + 1);

  let orders = rawOrders ?? [];
  let hasNext = false;
  let hasPrev = Boolean(after || before);
  let nextCursor: string | undefined;
  let prevCursor: string | undefined;

  if (isForward) {
    if (orders.length > PAGE_SIZE) {
      hasNext = true;
      orders.pop();
    }
  } else {
    if (orders.length > PAGE_SIZE) {
      orders.shift();
    }
    orders.reverse();
  }

  const firstItem = orders[0];
  const lastItem = orders[orders.length - 1];

  if (hasNext && lastItem) {
    nextCursor = encodeCursor(lastItem.created_at, lastItem.id);
  }
  if (hasPrev && firstItem) {
    prevCursor = encodeCursor(firstItem.created_at, firstItem.id);
  }

  const userIds = [...new Set(orders.map((o) => o.user_id))];
  const { data: profiles } = userIds.length > 0
    ? await supabase.from("profiles").select("id, email, full_name").in("id", userIds)
    : { data: [] };
  const profileMap = new Map(profiles?.map((p) => [p.id, { email: p.email, name: p.full_name }]) ?? []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestión de Pedidos</h1>

      <AdminOrderFilters
        currentStatus={params.status}
        currentFrom={params.from}
        currentTo={params.to}
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">ID</th>
                  <th className="text-left p-3 font-medium">Nombre</th>
                  <th className="text-left p-3 font-medium">Correo</th>
                  <th className="text-left p-3 font-medium">Items</th>
                  <th className="text-left p-3 font-medium">Total</th>
                  <th className="text-left p-3 font-medium">Estado</th>
                  <th className="text-left p-3 font-medium">Fecha</th>
                  <th className="text-left p-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const profile = profileMap.get(order.user_id);
                  return (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3 font-mono text-xs">{order.id.slice(0, 8)}</td>
                      <td className="p-3">{profile?.name ?? "—"}</td>
                      <td className="p-3 text-muted-foreground">{profile?.email ?? "—"}</td>
                      <td className="p-3">{(order.order_items as { id: string }[])?.length ?? 0}</td>
                      <td className="p-3 font-medium">{formatPrice(order.total)}</td>
                      <td className="p-3">
                        <Badge className={statusColors[order.status] ?? statusColors.pending}>
                          {statusLabels[order.status] ?? order.status}
                        </Badge>
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
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-muted-foreground">
                      No hay pedidos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Pagination
        hasPrev={hasPrev}
        hasNext={hasNext}
        prevCursor={prevCursor}
        nextCursor={nextCursor}
        basePath="/admin/pedidos"
        searchParams={params}
      />
    </div>
  );
}
