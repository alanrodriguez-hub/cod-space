import { createClient } from "@/lib/supabase/server";
import { NewQuoteForm } from "./new-quote-form";

export const dynamic = "force-dynamic";

export default async function NuevaCotizacionPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, brand, car_model, price")
    .order("name");

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Nueva Cotización</h1>
      <NewQuoteForm products={products || []} />
    </div>
  );
}
