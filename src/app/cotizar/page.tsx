"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Send, CheckCircle, AlertCircle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { QuoteItem } from "@/lib/types";

export default function CotizarPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CotizarForm />
    </Suspense>
  );
}

function CotizarForm() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: user } = await supabase.auth.getUser();
      if (user?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email, phone")
          .eq("id", user.user.id)
          .single();

        if (profile) {
          if (profile.full_name) setName(profile.full_name);
          if (profile.email) setEmail(profile.email);
          if (profile.phone) setPhone(profile.phone);
        }
      }
    }
    load();
  }, [supabase]);

  const addItem = useCallback(() => {
    setItems((prev) => [
      ...prev,
      { type: "custom", product_name: "", quantity: 1 },
    ]);
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateItem = useCallback(
    (index: number, partial: Partial<QuoteItem>) => {
      setItems((prev) =>
        prev.map((item, i) => (i === index ? { ...item, ...partial } : item))
      );
    },
    []
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error("Completa nombre y email");
      return;
    }

    const validItems = items.filter(
      (item) => item.product_name.trim()
    );
    if (validItems.length === 0) {
      toast.error("Agrega al menos un producto o servicio");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        items: validItems,
        message: message.trim(),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || "Error al enviar la cotización. Intenta nuevamente.");
      return;
    }

    setSent(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (sent) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-4 text-green-600">
                <CheckCircle className="h-10 w-10" />
              </div>
            </div>
            <CardTitle className="text-2xl">Cotización Enviada</CardTitle>
            <CardDescription className="text-base">
              Hemos recibido tu solicitud. Te contactaremos a la brevedad para entregarte un presupuesto.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <Button onClick={() => router.push("/")} className="cursor-pointer">
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Solicitar Cotización</h1>
          <p className="text-muted-foreground mt-2">
            Cuéntanos qué necesitas y te enviaremos un presupuesto personalizado sin compromiso.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tus Datos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nombre Completo *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  required
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+56 9 1234 5678"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Productos / Servicios</CardTitle>
              <CardDescription>
                Describe los productos o servicios que necesitas cotizar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aún no has agregado nada. Haz clic en &quot;Agregar Item&quot; para comenzar.
                </p>
              )}

              {items.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                      Item #{index + 1}
                    </span>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Descripción
                    </Label>
                    <Input
                      value={item.product_name}
                      onChange={(e) =>
                        updateItem(index, { product_name: e.target.value })
                      }
                      placeholder="Ej: Batería para auto, Servicio de mantención, Neumáticos 205/55 R16..."
                    />
                  </div>

                  <div className="w-32">
                    <Label className="text-xs text-muted-foreground">
                      Cantidad
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, {
                          quantity: Math.max(
                            1,
                            parseInt(e.target.value) || 1
                          ),
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full cursor-pointer"
                onClick={addItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Item
              </Button>

              <div className="space-y-1.5 pt-4 border-t">
                <Label htmlFor="message">Mensaje o comentarios</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Marca, modelo, año del vehículo, referencias, o cualquier detalle adicional..."
                  rows={4}
                />
              </div>

              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Mientras más detalles nos entregues, más preciso será tu presupuesto.
                </span>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            size="lg"
            className="w-full cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar Cotización
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
