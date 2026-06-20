import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download } from "lucide-react";
import type { QuoteStatus } from "@/lib/types";
import { AddItemForm } from "./add-item-form";
import { ItemList } from "./item-list";
import { SendEmailButton } from "./send-email-button";
import { StatusSelect } from "./status-select";

export const dynamic = "force-dynamic";

export default async function AdminCotizacionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: quote } = await supabase.from("quotes").select("*").eq("id", id).single();
  if (!quote) notFound();

  const { data: items } = await supabase
    .from("quote_items")
    .select("*")
    .eq("quote_id", id)
    .order("created_at");

  const { data: products } = await supabase
    .from("products")
    .select("id, name, brand, car_model")
    .order("name");

  const status = quote.status as QuoteStatus;
  const total = (items || []).reduce((sum, i) => sum + i.quantity * i.unit_price, 0);

  return (
    <div>
      <Link
        href="/admin/cotizaciones"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a Cotizaciones
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Cotización de {quote.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Recibida el {new Date(quote.created_at).toLocaleString("es-CL")}
          </p>
        </div>
        <StatusSelect currentStatus={status} quoteId={id} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Datos del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Nombre:</span> <span className="font-medium">{quote.name}</span></p>
            <p>
              <span className="text-muted-foreground">Email:</span>{" "}
              <a href={`mailto:${quote.email}`} className="text-primary hover:underline font-medium">{quote.email}</a>
            </p>
            {quote.phone && <p><span className="text-muted-foreground">Teléfono:</span> <span className="font-medium">{quote.phone}</span></p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Solicitud del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(quote.items || []).map((item: { type: string; product_name: string; quantity: number }, i: number) => (
              <div key={i} className="flex items-center justify-between border-b pb-1 last:border-0">
                <span className="text-muted-foreground truncate">{item.product_name}</span>
                <Badge variant="outline" className="text-xs shrink-0">x{item.quantity}</Badge>
              </div>
            ))}
            {quote.message && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-1">Mensaje:</p>
                <p className="text-sm whitespace-pre-wrap">{quote.message}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Productos a Cotizar</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Total: <strong className="text-foreground">${total.toLocaleString("es-CL")}</strong>
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ItemList items={items || []} quoteId={id} />

          <AddItemForm quoteId={id} products={products || []} />

          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <a
              href={`/api/quotes/${id}/pdf`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Download className="h-4 w-4" />
              Descargar PDF
            </a>
            {(items || []).length > 0 && <SendEmailButton quoteId={id} />}
          </div>

          <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
            <p><strong>Válida por 7 días corridos</strong> desde la fecha de emisión.</p>
            <p className="mt-1"><strong>Sujeto a stock</strong> — Los precios y disponibilidad pueden variar.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
