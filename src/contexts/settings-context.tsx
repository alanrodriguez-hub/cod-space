"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SiteSettings } from "@/lib/types";

const defaultSettings: SiteSettings = {
  site_name: "Repuestos",
  site_url: "http://localhost:3000",
  contact_email: "",
  contact_phone: "",
  contact_address: "",
  maps_url: "https://maps.google.com",
  store_hours_weekday: "Lunes a Viernes: 9:00 a 13:00 y 15:00 a 17:00",
  store_hours_saturday: "Sábados: 9:00 a 13:00",
  facebook_url: "",
  instagram_url: "",
  tiktok_url: "",
  whatsapp_url: "",
  transfer_company_name: "",
  transfer_company_rut: "",
  transfer_bank_name: "",
  transfer_account_type: "",
  transfer_account_number: "",
  transfer_email: "",
  smtp_host: "",
  smtp_port: "587",
  smtp_user: "",
  smtp_password: "",
  smtp_from: "",
};

const SettingsContext = createContext<SiteSettings>(defaultSettings);

export function SettingsProvider({ children, initial }: { children: ReactNode; initial?: SiteSettings }) {
  const [settings, setSettings] = useState<SiteSettings>(initial ?? defaultSettings);

  useEffect(() => {
    if (initial) return;
    const supabase = createClient();
    supabase.from("site_settings").select("key, value").then(({ data }) => {
      if (!data) return;
      const map: Record<string, string> = {};
      for (const row of data) {
        map[row.key] = row.value;
      }
      setSettings({
        site_name: map.site_name ?? defaultSettings.site_name,
        site_url: map.site_url ?? defaultSettings.site_url,
        contact_email: map.contact_email ?? defaultSettings.contact_email,
        contact_phone: map.contact_phone ?? defaultSettings.contact_phone,
        contact_address: map.contact_address ?? defaultSettings.contact_address,
        maps_url: map.maps_url ?? defaultSettings.maps_url,
        store_hours_weekday: map.store_hours_weekday ?? defaultSettings.store_hours_weekday,
        store_hours_saturday: map.store_hours_saturday ?? defaultSettings.store_hours_saturday,
        facebook_url: map.facebook_url ?? defaultSettings.facebook_url,
        instagram_url: map.instagram_url ?? defaultSettings.instagram_url,
        tiktok_url: map.tiktok_url ?? defaultSettings.tiktok_url,
        whatsapp_url: map.whatsapp_url ?? defaultSettings.whatsapp_url,
        transfer_company_name: map.transfer_company_name ?? defaultSettings.transfer_company_name,
        transfer_company_rut: map.transfer_company_rut ?? defaultSettings.transfer_company_rut,
        transfer_bank_name: map.transfer_bank_name ?? defaultSettings.transfer_bank_name,
        transfer_account_type: map.transfer_account_type ?? defaultSettings.transfer_account_type,
        transfer_account_number: map.transfer_account_number ?? defaultSettings.transfer_account_number,
        transfer_email: map.transfer_email ?? defaultSettings.transfer_email,
        smtp_host: map.smtp_host ?? defaultSettings.smtp_host,
        smtp_port: map.smtp_port ?? defaultSettings.smtp_port,
        smtp_user: map.smtp_user ?? defaultSettings.smtp_user,
        smtp_password: map.smtp_password ?? defaultSettings.smtp_password,
        smtp_from: map.smtp_from ?? defaultSettings.smtp_from,
      });
    });
  }, [initial]);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
