"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface ProductOption {
  id: string;
  name: string;
  brand: string;
  car_model: string;
  price: number;
}

interface QuoteItemForm {
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export function NewQuoteForm({ products }: { products: ProductOption[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [items, setItems] = useState<QuoteItemForm[]>([]);
  const [productName, setProductName] = useState("");
  const [productId, setProductId] = useState<string | null>(null);
  const [unitPrice, setUnitPrice] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSearch(value: string) {
    setProductName(value);
    setProductId(null);
    setShowSuggestions(value.trim().length > 0);
    const exact = products.find((p) => p.name.toLowerCase() === value.toLowerCase());
    if (exact) {
      setProductId(exact.id);
      setUnitPrice(String(exact.price));
    }
  }

  function selectProduct(p: ProductOption) {
    setProductName(p.name);
    setProductId(p.id);
    setUnitPrice(String(p.price));
    setShowSuggestions(false);
  }

  const suggestions = productName.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(productName.toLowerCase()) ||
          p.brand.toLowerCase().includes(productName.toLowerCase()) ||
          p.car_model.toLowerCase().includes(productName.toLowerCase())
      ).slice(0, 8)
    : [];

  function addItem() {
    if (!productName.trim() || !unitPrice) {
      toast.error("Completa nombre del producto y precio");
      return;
    }
    setItems([
      ...items,
      {
        product_id: productId,
        product_name: productName.trim(),
        quantity,
        unit_price: parseFloat(unitPrice),
      },
    ]);
    setProductName("");
    setProductId(null);
    setUnitPrice("");
    setQuantity(1);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  const total = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Nombre y email son requeridos");
      return;
    }
    if (items.length === 0) {
      toast.error("Agrega al menos un producto");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/quotes/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        message: message.trim() || null,
        items,
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || "Error al crear cotización");
      return;
    }

    const data = await res.json();
    toast.success("Cotización creada");
    router.push(`/admin/cotizaciones/${data.quoteId}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Link
        href="/admin/cotizaciones"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a Cotizaciones
      </Link>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Datos del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Nombre *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del cliente" />
            </div>
            <div className="space-y-1">
              <Label>Email *</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cliente@ejemplo.cl" />
            </div>
            <div className="space-y-1">
              <Label>Teléfono</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+56 9 1234 5678" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Productos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={productName}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setShowSuggestions(productName.trim().length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Buscar producto del catálogo..."
                className="pl-9"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 top-full left-0 right-0 mt-1 border rounded-lg bg-background shadow-lg max-h-48 overflow-y-auto">
                  {suggestions.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors border-b last:border-0"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectProduct(p)}
                    >
                      <span className="font-medium">{p.name}</span>
                      {(p.brand || p.car_model) && (
                        <span className="text-muted-foreground ml-1">
                          — {[p.brand, p.car_model].filter(Boolean).join(", ")}
                        </span>
                      )}
                      <span className="text-muted-foreground ml-2 text-xs">
                        ${p.price.toLocaleString("es-CL")}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Cantidad</Label>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Precio Unitario ($)</Label>
                <Input
                  type="number"
                  min={0}
                  step={10}
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="flex items-end">
                <Button type="button" size="sm" onClick={addItem} className="w-full cursor-pointer">
                  <Plus className="h-4 w-4 mr-1" /> Agregar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Items de la Cotización</CardTitle>
          <span className="text-sm text-muted-foreground">
            Total: <strong className="text-foreground">${total.toLocaleString("es-CL")}</strong>
          </span>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Aún no has agregado productos.
            </p>
          ) : (
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between border rounded-lg p-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{item.product_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-xs">x{item.quantity}</Badge>
                      <span className="text-xs text-muted-foreground">
                        ${item.unit_price.toLocaleString("es-CL")} c/u
                      </span>
                      <span className="text-xs font-medium">
                        = ${(item.quantity * item.unit_price).toLocaleString("es-CL")}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive shrink-0 cursor-pointer"
                    onClick={() => removeItem(i)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-1">
        <Label>Notas internas</Label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Comentarios o notas para esta cotización..."
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="cursor-pointer">
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {loading ? "Creando..." : "Guardar Cotización"}
        </Button>
        <Link
          href="/admin/cotizaciones"
          className="inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
