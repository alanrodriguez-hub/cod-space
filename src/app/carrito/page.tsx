"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/cart-context";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { MapPin } from "lucide-react";
import type { User } from "@supabase/supabase-js";

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(price);
}

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [address, setAddress] = useState<{ street: string; city: string; region: string; zip: string } | null>(null);
  const router = useRouter();
  const supabase = createClient();

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
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({ user_id: user.id, total: totalPrice, status: "pending" })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      clearCart();
      toast.success("Pedido enviado exitosamente");
      router.push("/pedidos");
    } catch {
      toast.error("Error al enviar el pedido. Intenta nuevamente.");
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
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
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
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">Dirección de Envío</span>
                    </div>
                    {address ? (
                      <div className="text-sm text-muted-foreground space-y-0.5">
                        <p>{address.street}</p>
                        <p>{address.city}{address.region ? `, ${address.region}` : ""}</p>
                        {address.zip && <p>CP: {address.zip}</p>}
                        <Link href="/perfil" className="text-primary text-xs underline hover:no-underline">
                          Cambiar dirección
                        </Link>
                      </div>
                    ) : (
                      <div className="rounded-md border border-dashed border-destructive/50 p-3 text-sm">
                        <p className="text-destructive font-medium">No tienes dirección de envío registrada.</p>
                        <Link href="/perfil" className="text-primary underline hover:no-underline text-xs">
                          Completar mi dirección
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}
              <Button className="w-full" size="lg" onClick={handleSubmitOrder} disabled={loading || (!!user && !address)}>
                {loading ? "Enviando..." : !user ? "Iniciar Sesión para Pedir" : !address ? "Completa tu dirección" : "Enviar Pedido"}
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
