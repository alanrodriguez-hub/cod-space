"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

interface SettingRow {
  key: string;
  value: string;
}

const fieldGroups = [
  {
    label: "Configuración del Sitio",
    fields: [
      { key: "site_name", label: "Nombre del Sitio", type: "text" },
      { key: "site_url", label: "URL del Sitio", type: "text" },
    ],
  },
  {
    label: "Contacto",
    fields: [
      { key: "contact_email", label: "Email de Contacto", type: "email" },
      { key: "contact_phone", label: "Teléfono", type: "text" },
      { key: "contact_address", label: "Dirección", type: "text" },
      { key: "maps_url", label: "URL Google Maps", type: "url" },
    ],
  },
  {
    label: "Horarios de Atención",
    fields: [
      { key: "store_hours_weekday", label: "Lunes a Viernes", type: "text" },
      { key: "store_hours_saturday", label: "Sábados", type: "text" },
    ],
  },
  {
    label: "Redes Sociales",
    fields: [
      { key: "facebook_url", label: "Facebook URL", type: "url" },
      { key: "instagram_url", label: "Instagram URL", type: "url" },
      { key: "tiktok_url", label: "TikTok URL", type: "url" },
      { key: "whatsapp_url", label: "WhatsApp URL", type: "url" },
    ],
  },
  {
    label: "Datos de Transferencia Bancaria",
    fields: [
      { key: "transfer_company_name", label: "Nombre Empresa", type: "text" },
      { key: "transfer_company_rut", label: "RUT Empresa", type: "text" },
      { key: "transfer_bank_name", label: "Banco", type: "text" },
      { key: "transfer_account_type", label: "Tipo de Cuenta", type: "text" },
      { key: "transfer_account_number", label: "Número de Cuenta", type: "text" },
      { key: "transfer_email", label: "Email de Cobros", type: "email" },
    ],
  },
  {
    label: "Configuración SMTP",
    fields: [
      { key: "smtp_host", label: "SMTP Host", type: "text" },
      { key: "smtp_port", label: "SMTP Puerto", type: "text" },
      { key: "smtp_user", label: "SMTP Usuario", type: "text" },
      { key: "smtp_password", label: "SMTP Contraseña", type: "password" },
      { key: "smtp_from", label: "SMTP From Email", type: "email" },
    ],
  },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.from("site_settings").select("key, value").then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {};
        for (const row of data) {
          map[row.key] = row.value;
        }
        setSettings(map);
      }
      setLoading(false);
    });
  }, [supabase]);

  function handleChange(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const upserts = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
    }));
    const { error } = await supabase.from("site_settings").upsert(upserts, {
      onConflict: "key",
      ignoreDuplicates: false,
    });
    setSaving(false);
    if (error) {
      toast.error("Error al guardar: " + error.message);
    } else {
      toast.success("Configuración guardada exitosamente");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Configuración del Sitio</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-1" />
          )}
          Guardar Cambios
        </Button>
      </div>

      <div className="grid gap-6">
        {fieldGroups.map((group) => (
          <Card key={group.label}>
            <CardHeader>
              <CardTitle>{group.label}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {group.fields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <Input
                    id={field.key}
                    type={field.type}
                    value={settings[field.key] ?? ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
