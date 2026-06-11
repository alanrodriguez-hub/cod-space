"use client";

import { useSearchParams } from "next/navigation";
import { BrandForm } from "@/components/admin/brand-form";

export function BrandFormWrapper() {
  const searchParams = useSearchParams();
  const action = searchParams.get("action");
  const editId = searchParams.get("id");

  if (!action) return null;

  return <BrandForm editId={action === "edit" ? editId : null} />;
}
