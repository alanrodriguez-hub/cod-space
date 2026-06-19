import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Banner, Brand, Category, CarModel } from "@/lib/types";

export const getCategories = cache(async (): Promise<Category[]> => {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("name");
  return data ?? [];
});

export const getBrands = cache(async (): Promise<Brand[]> => {
  const supabase = await createClient();
  const { data } = await supabase.from("brands").select("*").order("name");
  return data ?? [];
});

export const getBrandNames = cache(async (): Promise<string[]> => {
  const brands = await getBrands();
  return brands.map((b) => b.name);
});

export const getCarModels = cache(async (): Promise<CarModel[]> => {
  const supabase = await createClient();
  const { data } = await supabase.from("car_models").select("*").order("name");
  return data ?? [];
});

export const getSiteName = cache(async (): Promise<string> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "site_name")
    .single();
  return data?.value ?? "Repuestos Script";
});

export const getActiveBanners = cache(async (): Promise<Banner[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("banners")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
});
