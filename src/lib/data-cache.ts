import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Banner, Brand, Category, CarModel, SiteSettings } from "@/lib/types";

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

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("key, value");
  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    map[row.key] = row.value;
  }
  return {
    site_name: map.site_name ?? "Repuestos",
    site_url: map.site_url ?? "http://localhost:3000",
    contact_email: map.contact_email ?? "",
    contact_phone: map.contact_phone ?? "",
    contact_address: map.contact_address ?? "",
    maps_url: map.maps_url ?? "https://maps.google.com",
    store_hours_weekday: map.store_hours_weekday ?? "Lunes a Viernes: 9:00 a 13:00 y 15:00 a 17:00",
    store_hours_saturday: map.store_hours_saturday ?? "Sábados: 9:00 a 13:00",
    facebook_url: map.facebook_url ?? "",
    instagram_url: map.instagram_url ?? "",
    tiktok_url: map.tiktok_url ?? "",
    whatsapp_url: map.whatsapp_url ?? "",
    transfer_company_name: map.transfer_company_name ?? "",
    transfer_company_rut: map.transfer_company_rut ?? "",
    transfer_bank_name: map.transfer_bank_name ?? "",
    transfer_account_type: map.transfer_account_type ?? "",
    transfer_account_number: map.transfer_account_number ?? "",
    transfer_email: map.transfer_email ?? "",
    smtp_host: map.smtp_host ?? "",
    smtp_port: map.smtp_port ?? "587",
    smtp_user: map.smtp_user ?? "",
    smtp_password: map.smtp_password ?? "",
    smtp_from: map.smtp_from ?? "",
  };
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
