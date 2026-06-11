"use client";

import { useSearchParams } from "next/navigation";
import { BannerForm } from "@/components/admin/banner-form";

export function BannerFormWrapper() {
  const searchParams = useSearchParams();
  const action = searchParams.get("action");
  const editId = searchParams.get("id");

  if (!action) return null;

  return <BannerForm editId={action === "edit" ? editId : null} />;
}
