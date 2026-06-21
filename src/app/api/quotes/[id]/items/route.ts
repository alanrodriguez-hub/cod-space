import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { product_id, product_name, quantity, unit_price } = body;

    if (!product_name || !quantity || unit_price === undefined) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("quote_items")
      .insert({
        quote_id: id,
        product_id: product_id || null,
        product_name,
        quantity,
        unit_price,
      })
      .select()
      .single();

    if (error) {
      console.error("Error al agregar item:", error);
      return NextResponse.json({ error: "Error al agregar item" }, { status: 500 });
    }

    return NextResponse.json({ success: true, item: data });
  } catch (error) {
    console.error("Error en POST /api/quotes/[id]/items:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "itemId requerido" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("quote_items")
      .delete()
      .eq("id", itemId)
      .eq("quote_id", id);

    if (error) {
      console.error("Error al eliminar item:", error);
      return NextResponse.json({ error: "Error al eliminar item" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en DELETE /api/quotes/[id]/items:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
