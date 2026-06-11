"use client";

import { useSearchParams } from "next/navigation";
import { CategoryForm } from "@/components/admin/category-form";

export function CategoryFormWrapper() {
  const searchParams = useSearchParams();
  const action = searchParams.get("action");
  const editId = searchParams.get("id");

  if (!action) return null;

  return <CategoryForm editId={action === "edit" ? editId : null} />;
}
