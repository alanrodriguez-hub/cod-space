import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Pagination } from "@/components/pagination";
import { AdminQuoteFilters } from "@/components/admin/quote-filters";
import type { QuoteStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

const statusLabels: Record<QuoteStatus, string> = {
  pending: "Pendiente",
  contacted: "Contactado",
  completed: "Completada",
  cancelled: "Cancelada",
};

const statusColors: Record<QuoteStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  contacted: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-gray-100 text-gray-800 border-gray-200",
};

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

export default async function AdminCotizacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; from?: string; to?: string; after?: string; before?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (params.status && ["pending", "contacted", "completed", "cancelled"].includes(params.status)) {
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

  const { data: rawQuotes } = await query.limit(PAGE_SIZE + 1);

  const quotes = rawQuotes ?? [];
  let hasNext = false;
  const hasPrev = Boolean(after || before);
  let nextCursor: string | undefined;
  let prevCursor: string | undefined;

  if (isForward) {
    if (quotes.length > PAGE_SIZE) {
      hasNext = true;
      quotes.pop();
    }
  } else {
    if (quotes.length > PAGE_SIZE) {
      quotes.shift();
    }
    quotes.reverse();
  }

  const firstItem = quotes[0];
  const lastItem = quotes[quotes.length - 1];

  if (hasNext && lastItem) {
    nextCursor = encodeCursor(lastItem.created_at, lastItem.id);
  }
  if (hasPrev && firstItem) {
    prevCursor = encodeCursor(firstItem.created_at, firstItem.id);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Cotizaciones</h1>

      <AdminQuoteFilters
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
                  <th className="text-left p-3 font-medium">Cliente</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Productos</th>
                  <th className="text-left p-3 font-medium">Mensaje</th>
                  <th className="text-left p-3 font-medium">Estado</th>
                  <th className="text-left p-3 font-medium">Fecha</th>
                  <th className="text-left p-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <tr key={q.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3 font-medium">{q.name}</td>
                    <td className="p-3 text-muted-foreground">{q.email}</td>
                    <td className="p-3">{(q.items as { product_name: string }[])?.length ?? 0}</td>
                    <td className="p-3 text-muted-foreground max-w-48 truncate">{q.message}</td>
                    <td className="p-3">
                      <Badge className={statusColors[q.status as QuoteStatus]} variant="outline">
                        {statusLabels[q.status as QuoteStatus]}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground whitespace-nowrap">{formatDate(q.created_at)}</td>
                    <td className="p-3">
                      <Link
                        href={`/admin/cotizaciones/${q.id}`}
                        className={buttonVariants({ variant: "ghost", size: "sm" })}
                      >
                        <Eye className="h-4 w-4 mr-1" /> Ver
                      </Link>
                    </td>
                  </tr>
                ))}
                {quotes.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-muted-foreground">
                      No hay cotizaciones
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
        basePath="/admin/cotizaciones"
        searchParams={params}
      />
    </div>
  );
}
