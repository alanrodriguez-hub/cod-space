"use client";

import { useSearchParams } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";

export function ProductFormWrapper() {
  const searchParams = useSearchParams();
  const action = searchParams.get("action");
  const editId = searchParams.get("id");

  if (!action) return null;

  return <ProductForm editId={action === "edit" ? editId : null} />;
}
