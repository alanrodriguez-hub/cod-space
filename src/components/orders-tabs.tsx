"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, Printer } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  product?: { name: string; brand: string };
}

interface Order {
  id: string;
  status: string;
  total: number;
  payment_method?: string;
  created_at: string;
  order_items?: OrderItem[];
}

const tabs = [
  { key: "pending", label: "Pendientes" },
  { key: "confirmed", label: "Confirmados" },
  { key: "completed", label: "Completados" },
  { key: "cancelled", label: "Cancelados" },
] as const;

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "Pendiente", variant: "secondary" },
  confirmed: { label: "Confirmado", variant: "default" },
  completed: { label: "Completado", variant: "outline" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(price);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-CL", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date));
}

function handlePrintOrder(order: Order) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Por favor, permite las ventanas emergentes en tu navegador para imprimir el comprobante.");
    return;
  }

  const itemsHtml = order.order_items?.map((item: OrderItem) => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 12px 10px; text-align: left; font-size: 13px;">${item.product?.name || "Producto"} (${item.product?.brand || ""})</td>
      <td style="padding: 12px 10px; text-align: center; font-size: 13px;">${item.quantity}</td>
      <td style="padding: 12px 10px; text-align: right; font-size: 13px;">${formatPrice(item.unit_price)}</td>
      <td style="padding: 12px 10px; text-align: right; font-size: 13px; font-weight: bold;">${formatPrice(item.unit_price * item.quantity)}</td>
    </tr>
  `).join("") || "";

  const paymentLabel = order.payment_method === "transfer" ? "Transferencia Electrónica" : "Efectivo";
  const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    confirmed: "Confirmado",
    completed: "Completado",
    cancelled: "Cancelado"
  };
  const statusLabel = statusLabels[order.status] || order.status;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Comprobante_Pedido_${order.id.slice(0, 8)}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; margin: 0; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
          .title { font-size: 20px; font-weight: bold; text-align: right; margin: 0; color: #0f172a; }
          .meta { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 13px; }
          .meta-box { width: 48%; }
          .meta-box h3 { margin-top: 0; font-size: 13px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
          th { text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; color: #475569; background-color: #f8fafc; font-weight: 600; }
          .total-box { display: flex; justify-content: flex-end; font-size: 14px; margin-top: 20px; }
          .total-table { width: 250px; margin-bottom: 0; }
          .total-table td { padding: 6px 0; }
          .total-table .grand-total { font-size: 16px; font-weight: bold; color: #2563eb; border-top: 2px solid #e2e8f0; }
          .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 60px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          @media print {
            body { padding: 10px; }
            .header { border-bottom-color: #000; }
            .total-table .grand-total { color: #000; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">CodSpace</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 3px;">Repuestos Automotrices</div>
          </div>
          <div>
            <h1 class="title">COMPROBANTE DE PEDIDO</h1>
            <div style="font-size: 11px; color: #64748b; text-align: right; margin-top: 3px;">ID: #${order.id.slice(0, 8)}</div>
          </div>
        </div>

        <div class="meta">
          <div class="meta-box">
            <h3>Detalles del Pedido</h3>
            <p style="margin: 4px 0;"><strong>Fecha:</strong> ${formatDate(order.created_at)}</p>
            <p style="margin: 4px 0;"><strong>Método de Pago:</strong> ${paymentLabel}</p>
            <p style="margin: 4px 0;"><strong>Estado:</strong> ${statusLabel}</p>
          </div>
          <div class="meta-box" style="text-align: right;">
            <h3>Soporte y Consultas</h3>
            <p style="margin: 4px 0;"><strong>Email:</strong> pagos@codspace.cl</p>
            <p style="margin: 4px 0;"><strong>Sitio Web:</strong> www.codspace.cl</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="text-align: left;">Producto</th>
              <th style="text-align: center; width: 10%;">Cant.</th>
              <th style="text-align: right; width: 20%;">Precio Unit.</th>
              <th style="text-align: right; width: 20%;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="total-box">
          <table class="total-table">
            <tr>
              <td>Subtotal:</td>
              <td style="text-align: right;">${formatPrice(order.total)}</td>
            </tr>
            <tr class="grand-total">
              <td style="padding-top: 8px;">Total a Pagar:</td>
              <td style="text-align: right; padding-top: 8px;">${formatPrice(order.total)}</td>
            </tr>
          </table>
        </div>

        <div class="footer">
          <p>Gracias por tu preferencia. Si elegiste transferencia electrónica, recuerda transferir y enviar el comprobante de pago.</p>
          <p>&copy; ${new Date().getFullYear()} CodSpace. Todos los derechos reservados.</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

export function OrdersTabs({ orders }: { orders: Order[] }) {
  const counts = {
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    completed: orders.filter((o) => o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  const defaultTab = counts.pending > 0 ? "pending" : counts.confirmed > 0 ? "confirmed" : counts.completed > 0 ? "completed" : "cancelled";
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  const filtered = orders.filter((o) => o.status === activeTab);

  return (
    <div>
      <div className="flex border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px",
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
            )}
          >
            {tab.label}
            {counts[tab.key] > 0 && (
              <span className={cn(
                "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium",
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No tienes pedidos {tabs.find((t) => t.key === activeTab)?.label.toLowerCase()}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            return (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold">Pedido #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Método de pago: <span className="font-semibold text-foreground capitalize">{order.payment_method === "transfer" ? "transferencia" : "efectivo"}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <span className="font-bold text-lg">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.product?.name || "Producto"} {item.product?.brand && `(${item.product.brand})`} x{item.quantity}
                        </span>
                        <span>{formatPrice(item.unit_price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-start">
                    <button
                      onClick={() => handlePrintOrder(order)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Imprimir Comprobante (PDF)
                    </button>
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
