"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, MapPin, Banknote, Landmark, Store, Clock, AlertTriangle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/cart-context";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(price);
}

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [address, setAddress] = useState<{ street: string; city: string; region: string; zip: string } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">("cash");
  const [deliveryMethod, setDeliveryMethod] = useState<"shipping" | "pickup">("pickup");
  const router = useRouter();
  const supabase = createClient();

  const contactAddress = process.env.NEXT_PUBLIC_CONTACT_ADDRESS;
  const mapsUrl = process.env.NEXT_PUBLIC_MAPS_URL;
  const weekdayHours = process.env.NEXT_PUBLIC_STORE_HOURS_WEEKDAY || "Lunes a Viernes: 9:00 a 13:00 y 15:00 a 17:00";
  const saturdayHours = process.env.NEXT_PUBLIC_STORE_HOURS_SATURDAY || "Sábados: 9:00 a 13:00";

  const hasAddress = !!(address?.street && address?.city);
  const effectiveDelivery: "shipping" | "pickup" = deliveryMethod === "shipping" && !hasAddress ? "pickup" : deliveryMethod;

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("address_street, address_city, address_region, address_zip")
          .eq("id", data.user.id)
          .single();
        if (profile?.address_street && profile?.address_city) {
          setAddress({
            street: profile.address_street,
            city: profile.address_city,
            region: profile.address_region ?? "",
            zip: profile.address_zip ?? "",
          });
        }
      }
    });
  }, [supabase]);

  async function handleSubmitOrder() {
    if (!user) {
      router.push("/auth/login?redirect=/carrito");
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
      }));

      const { data, error } = await supabase.rpc("create_order", {
        p_user_id: user.id,
        p_items: orderItems,
        p_payment_method: paymentMethod,
        p_delivery_method: effectiveDelivery,
      });

      if (error) throw error;

      if (data && data.order_id) {
        fetch("/api/send-order-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: data.order_id,
            userEmail: user.email,
            userName: user.user_metadata?.full_name || user.email?.split("@")[0] || "Cliente",
            paymentMethod: paymentMethod,
            deliveryMethod: effectiveDelivery,
            total: totalPrice,
            items: items.map((item) => ({
              name: item.product.name,
              brand: item.product.brand,
              quantity: item.quantity,
              price: item.product.price,
            })),
          }),
        }).catch((err) => console.error("Error al enviar correo de confirmación:", err));
      }

      clearCart();
      toast.success("Pedido enviado exitosamente");
      router.push("/pedidos");
    } catch (err) {
      const message = err instanceof Error && err.message.includes("Stock insuficiente")
        ? "Stock insuficiente para uno de los productos"
        : "Error al enviar el pedido. Intenta nuevamente.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Tu carrito está vacío</h1>
        <p className="text-muted-foreground mb-6">Agrega productos desde nuestro catálogo</p>
        <Link href="/catalogo" className={buttonVariants()}>Ver Catálogo</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Carrito de Compra</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.product.id}>
              <CardContent className="p-4 flex gap-4">
                <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted shrink-0">
                  {item.product.image_url ? (
                    <Image src={item.product.image_url} alt={item.product.name} fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Sin img</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/catalogo/${item.product.id}`} className="font-semibold hover:text-primary line-clamp-1">
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{item.product.brand} · {item.product.car_model}</p>
                  <p className="font-bold text-primary mt-1">{formatPrice(item.product.price)}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(item.product.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-8 w-8" disabled={item.quantity >= item.product.stock} onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className={`text-xs ${item.product.stock === 0 ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                      {item.product.stock === 0 ? "Sin stock" : `Stock: ${item.product.stock}`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold">Resumen</h2>
              <Separator />
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate mr-2">
                    {item.product.name} x{item.quantity}
                  </span>
                  <span>{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatPrice(totalPrice)}</span>
              </div>

              {user && (
                <>
                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">Método de Entrega</span>
                    </div>

                    <div className="border rounded-lg overflow-hidden divide-y">
                      {/* Retiro en Tienda */}
                      <div
                        onClick={() => setDeliveryMethod("pickup")}
                        className={`p-3 cursor-pointer transition-colors flex items-center justify-between ${
                          effectiveDelivery === "pickup" ? "bg-primary/5" : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Store className="h-4 w-4 text-primary shrink-0" />
                          <div className="text-left">
                            <p className="text-sm font-medium">Retiro en Tienda</p>
                            <p className="text-[11px] text-muted-foreground">Retira personalmente sin costo</p>
                          </div>
                        </div>
                        <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                          effectiveDelivery === "pickup" ? "border-primary bg-primary" : "border-muted-foreground/50"
                        }`}>
                          {effectiveDelivery === "pickup" && <div className="h-2 w-2 rounded-full bg-white" />}
                        </div>
                      </div>

                      {/* Envío a Domicilio */}
                      <div
                        onClick={() => {
                          if (!hasAddress) {
                            toast.error("Debes registrar una dirección de envío en tu perfil.");
                            return;
                          }
                          setDeliveryMethod("shipping");
                        }}
                        className={`p-3 cursor-pointer transition-colors flex items-center justify-between ${
                          !hasAddress ? "opacity-50 cursor-not-allowed" : ""
                        } ${
                          effectiveDelivery === "shipping" ? "bg-primary/5" : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <MapPin className="h-4 w-4 text-primary shrink-0" />
                          <div className="text-left">
                            <p className="text-sm font-medium">Envío a Domicilio</p>
                            <p className="text-[11px] text-muted-foreground">
                              {hasAddress ? "Recibe en tu dirección registrada" : "Registra tu dirección para activar"}
                            </p>
                          </div>
                        </div>
                        <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                          effectiveDelivery === "shipping" ? "border-primary bg-primary" : "border-muted-foreground/50"
                        }`}>
                          {effectiveDelivery === "shipping" && <div className="h-2 w-2 rounded-full bg-white" />}
                        </div>
                      </div>
                    </div>

                    {!hasAddress && effectiveDelivery === "pickup" && (
                      <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-3">
                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-700 dark:text-amber-300">
                          <p className="font-medium mb-0.5">Retiro en tienda seleccionado</p>
                          <p>No tienes dirección de envío registrada. Solo disponible retiro en tienda.</p>
                          <Link href="/perfil" className="underline hover:no-underline mt-1 inline-block">
                            Registrar mi dirección
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {effectiveDelivery === "pickup" ? (
                    <div className="rounded-md border bg-muted/30 p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <p className="font-medium text-foreground">Dirección de retiro</p>
                          {contactAddress && (
                            <p className="text-muted-foreground">
                              {contactAddress}
                              {mapsUrl && (
                                <> — <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">ver en mapa</a></>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <p className="font-medium text-foreground">Horarios de atención</p>
                          <p className="text-muted-foreground">{weekdayHours}</p>
                          <p className="text-muted-foreground">{saturdayHours}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-md border bg-muted/30 p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <p className="font-medium text-foreground">Dirección de envío</p>
                          {address ? (
                            <>
                              <p className="text-muted-foreground">{address.street}</p>
                              <p className="text-muted-foreground">{address.city}{address.region ? `, ${address.region}` : ""}</p>
                              {address.zip && <p className="text-muted-foreground">CP: {address.zip}</p>}
                              <Link href="/perfil" className="text-primary underline hover:no-underline mt-1 inline-block">
                                Cambiar dirección
                              </Link>
                            </>
                          ) : (
                            <p className="text-destructive">No tienes dirección registrada.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">Método de Pago</span>
                    </div>

                    <div className="border rounded-lg overflow-hidden divide-y">
                      <div
                        onClick={() => setPaymentMethod("cash")}
                        className={`p-3 cursor-pointer transition-colors flex items-center justify-between ${
                          paymentMethod === "cash" ? "bg-primary/5" : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Banknote className="h-4 w-4 text-primary shrink-0" />
                          <div className="text-left">
                            <p className="text-sm font-medium">Pago en Efectivo</p>
                            <p className="text-[11px] text-muted-foreground">Paga al retirar o al recibir el envío</p>
                          </div>
                        </div>
                        <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                          paymentMethod === "cash" ? "border-primary bg-primary" : "border-muted-foreground/50"
                        }`}>
                          {paymentMethod === "cash" && <div className="h-2 w-2 rounded-full bg-white" />}
                        </div>
                      </div>

                      <div>
                        <div
                          onClick={() => setPaymentMethod("transfer")}
                          className={`p-3 cursor-pointer transition-colors flex items-center justify-between ${
                            paymentMethod === "transfer" ? "bg-primary/5" : "hover:bg-muted"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Landmark className="h-4 w-4 text-primary shrink-0" />
                            <div className="text-left">
                              <p className="text-sm font-medium">Transferencia Electrónica</p>
                              <p className="text-[11px] text-muted-foreground">Transfiere directamente a nuestra cuenta</p>
                            </div>
                          </div>
                          <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                            paymentMethod === "transfer" ? "border-primary bg-primary" : "border-muted-foreground/50"
                          }`}>
                            {paymentMethod === "transfer" && <div className="h-2 w-2 rounded-full bg-white" />}
                          </div>
                        </div>

                        <div
                          className={`transition-all duration-300 ease-in-out overflow-hidden ${
                            paymentMethod === "transfer" ? "max-h-[300px] border-t" : "max-h-0"
                          }`}
                        >
                          <div className="p-3 bg-muted/40 text-[11px] space-y-1.5 border-l-2 border-primary">
                            <p className="font-semibold text-muted-foreground mb-1">Datos para Transferencia:</p>
                            <div className="grid grid-cols-3 gap-y-1 text-muted-foreground">
                              <span className="font-medium">Nombre:</span>
                              <span className="col-span-2 text-foreground font-semibold">
                                {process.env.NEXT_PUBLIC_TRANSFER_COMPANY_NAME || "Importadora y Distribuidora CodSpace Ltda."}
                              </span>
                              <span className="font-medium">RUT:</span>
                              <span className="col-span-2 text-foreground font-semibold">
                                {process.env.NEXT_PUBLIC_TRANSFER_COMPANY_RUT || "76.123.456-K"}
                              </span>
                              <span className="font-medium">Banco:</span>
                              <span className="col-span-2 text-foreground font-semibold">{process.env.NEXT_PUBLIC_TRANSFER_BANK_NAME || "Banco de Chile"}</span>
                              <span className="font-medium">Cuenta:</span>
                              <span className="col-span-2 text-foreground font-semibold">
                                {process.env.NEXT_PUBLIC_TRANSFER_ACCOUNT_TYPE || "Cuenta Corriente"}
                              </span>
                              <span className="font-medium">Nº Cuenta:</span>
                              <span className="col-span-2 text-foreground font-semibold font-mono">
                                {process.env.NEXT_PUBLIC_TRANSFER_ACCOUNT_NUMBER || "12-34567-89"}
                              </span>
                              <span className="font-medium">Email:</span>
                              <span className="col-span-2 text-foreground font-semibold break-all">
                                {process.env.NEXT_PUBLIC_TRANSFER_EMAIL || "pagos@codspace.cl"}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1.5 italic leading-snug">
                              * Envía el comprobante de transferencia a nuestro correo indicando tu número de pedido.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              <Button className="w-full" size="lg" onClick={handleSubmitOrder} disabled={loading}>
                {loading ? "Enviando..." : !user ? "Iniciar Sesión para Pedir" : effectiveDelivery === "pickup" ? "Solicitar Pedido (Retiro en Tienda)" : "Enviar Pedido"}
              </Button>
              {!user && (
                <p className="text-xs text-muted-foreground text-center">
                  Necesitas iniciar sesión para enviar tu pedido
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
