"use client";

import { useSearchParams } from "next/navigation";
import { CarModelForm } from "@/components/admin/car-model-form";

export function CarModelFormWrapper() {
  const searchParams = useSearchParams();
  const action = searchParams.get("action");
  const editId = searchParams.get("id");

  if (!action) return null;

  return <CarModelForm editId={action === "edit" ? editId : null} />;
}
