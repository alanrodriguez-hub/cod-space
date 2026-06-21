import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { QuoteStatus } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const validStatuses: QuoteStatus[] = ["pending", "contacted", "completed", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Estado inválido" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: quote } = await supabase
      .from("quotes")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (!quote) {
      return NextResponse.json(
        { error: "Cotización no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, quote });
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
