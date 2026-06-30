import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const rl = await checkRateLimit(request, "admin_quote_actions", 60, 15);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Demasiadas solicitudes. Intenta más tarde." }, { status: 429 });
    }

    const body = await request.json();
    const { name, email, phone, items, message } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Nombre y email son requeridos" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Debes agregar al menos un producto" },
        { status: 400 }
      );
    }

    const supabase = auth.supabase;

    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .insert({
        name,
        email,
        phone: phone || null,
        user_id: null,
        items: items.map((i: { product_id?: string; product_name: string; quantity: number }) => ({
          type: i.product_id ? "product" : "custom",
          product_id: i.product_id || null,
          product_name: i.product_name,
          quantity: i.quantity,
        })),
        message: message || "Cotización generada por administrador",
        status: "pending",
      })
      .select()
      .single();

    if (quoteError) {
      console.error("Error al crear cotización:", quoteError);
      return NextResponse.json({ error: "Error al crear cotización" }, { status: 500 });
    }

    const quoteItems = items.map(
      (i: { product_id?: string; product_name: string; quantity: number; unit_price: number }) => ({
        quote_id: quote.id,
        product_id: i.product_id || null,
        product_name: i.product_name,
        quantity: i.quantity,
        unit_price: i.unit_price || 0,
      })
    );

    const { error: itemsError } = await supabase
      .from("quote_items")
      .insert(quoteItems);

    if (itemsError) {
      console.error("Error al guardar items:", itemsError);
      await supabase.from("quotes").delete().eq("id", quote.id);
      return NextResponse.json({ error: "Error al guardar productos" }, { status: 500 });
    }

    return NextResponse.json({ success: true, quoteId: quote.id });
  } catch (error) {
    console.error("Error en POST /api/quotes/admin:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
