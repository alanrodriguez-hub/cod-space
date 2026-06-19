import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BulkUploadProducts } from "@/components/admin/bulk-upload-products";

export default async function CargaMasivaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Carga masiva de productos</h1>
      <BulkUploadProducts />
    </div>
  );
}
