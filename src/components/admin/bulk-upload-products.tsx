"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, CheckCircle2, Loader2, Table2, Link, ImageIcon, BadgeAlert } from "lucide-react";
import { toast } from "sonner";

interface RowData {
  row: number;
  name: string;
  description: string;
  price: number | null;
  stock: number | null;
  category: string;
  brand: string;
  car_model: string;
  image_url: string;
  featured: boolean;
  errors: string[];
}

function extractSheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "\n" && !inQuotes) {
      lines.push(current);
      current = "";
    } else if (ch === "\r") {
    } else {
      current += ch;
    }
  }
  if (current.trim()) lines.push(current);

  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const result: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values: string[] = [];
    let val = "";
    let inQ = false;
    for (let j = 0; j < lines[i].length; j++) {
      const c = lines[i][j];
      if (c === '"') {
        inQ = !inQ;
      } else if (c === "," && !inQ) {
        values.push(val.trim());
        val = "";
      } else {
        val += c;
      }
    }
    values.push(val.trim());

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || "";
    });
    result.push(row);
  }

  return result;
}

function validateRow(data: Record<string, string>, index: number): RowData {
  const errors: string[] = [];
  const name = (data.name || "").trim();
  const description = (data.description || "").trim();
  const price = data.price != null && data.price !== "" ? Number(data.price) : null;
  const stock = data.stock != null && data.stock !== "" ? Number(data.stock) : null;
  const category = (data.category || "").trim();
  const brand = (data.brand || "").trim();
  const car_model = (data.car_model || "").trim();
  const image_url = (data.image_url || "").trim();
  const featured = data.featured === "true" || data.featured === "TRUE" || data.featured === "1";

  if (!name) errors.push("El nombre es obligatorio");
  if (price === null || isNaN(price) || price <= 0) errors.push("Precio inválido (debe ser > 0)");
  if (stock === null || isNaN(stock) || stock < 0 || !Number.isInteger(stock)) errors.push("Stock inválido (debe ser entero >= 0)");
  if (car_model && !brand) errors.push("Si hay modelo debe haber marca");

  return { row: index + 1, name, description, price, stock, category, brand, car_model, image_url, featured, errors };
}

export function BulkUploadProducts() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<RowData[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const fetchSheet = async () => {
    const sheetId = extractSheetId(url);
    if (!sheetId) {
      toast.error("URL inválida", { description: "Asegúrate de que sea una URL de Google Sheets válida" });
      return;
    }

    setLoading(true);
    setRows([]);

    try {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      const res = await fetch(csvUrl);

      if (!res.ok) {
        toast.error("No se pudo acceder a la hoja", {
          description: "Verifica que la hoja sea pública (Compartir → Cualquier persona con el enlace → Lector)",
        });
        setLoading(false);
        return;
      }

      const text = await res.text();
      const parsed = parseCSV(text);

      if (parsed.length === 0) {
        toast.error("La hoja está vacía o no tiene el formato esperado");
        setLoading(false);
        return;
      }

      if (parsed.length > 500) {
        toast.error("Máximo 500 filas");
        setLoading(false);
        return;
      }

      const validated = parsed.map((data, i) => validateRow(data, i));

      // Verificar duplicados en la BD (nombre + marca + modelo)
      const rowsToCheck = validated.filter((r) => r.errors.length === 0 && r.name);
      const uniqueNames = [...new Set(rowsToCheck.map((r) => r.name))];
      if (uniqueNames.length > 0) {
        const { data: existing } = await supabase
          .from("products")
          .select("name, brand, car_model")
          .in("name", uniqueNames);
        const existingSet = new Set(
          (existing ?? []).map((p) => `${p.name}|${p.brand || ""}|${p.car_model || ""}`)
        );
        for (const row of validated) {
          if (row.errors.length === 0) {
            const key = `${row.name}|${row.brand || ""}|${row.car_model || ""}`;
            if (existingSet.has(key)) {
              row.errors.push("duplicado");
            }
          }
        }
      }

      setRows(validated);

      const validCount = validated.filter((r) => r.errors.length === 0).length;
      const duplicateCount = validated.filter((r) => r.errors.includes("duplicado")).length;
      const errorCount = validated.filter((r) => r.errors.length > 0 && !r.errors.includes("duplicado")).length;
      toast.message(`${validated.length} filas leídas`, {
        description: `${validCount} para importar, ${duplicateCount} duplicados, ${errorCount} con errores`,
      });
    } catch {
      toast.error("Error al leer la hoja", { description: "Verifica la URL e intenta nuevamente" });
    } finally {
      setLoading(false);
    }
  };

  const importAll = async () => {
    const valid = rows.filter((r) => r.errors.length === 0);
    if (valid.length === 0) {
      toast.error("No hay filas válidas para importar");
      return;
    }

    setImporting(true);
    setProgress({ current: 0, total: valid.length });

    let imported = 0;
    let skipped = 0;

    for (let i = 0; i < valid.length; i++) {
      const r = valid[i];
      try {
        let category_id: string | null = null;
        if (r.category) {
          const { data: cat } = await supabase.from("categories").select("id").eq("name", r.category).maybeSingle();
          category_id = cat?.id ?? null;
        }

        let brand_id: string | null = null;
        if (r.brand) {
          const { data: existingBrand } = await supabase.from("brands").select("id").eq("name", r.brand).maybeSingle();
          if (existingBrand) {
            brand_id = existingBrand.id;
          } else {
            const { data: newBrand, error: brandErr } = await supabase.from("brands").insert({ name: r.brand }).select("id").single();
            if (!brandErr && newBrand) brand_id = newBrand.id;
          }
        }

        let car_model_id: string | null = null;
        if (r.car_model && brand_id) {
          const { data: existingModel } = await supabase.from("car_models").select("id").eq("name", r.car_model).eq("brand_id", brand_id).maybeSingle();
          if (existingModel) {
            car_model_id = existingModel.id;
          } else {
            const { data: newModel, error: modelErr } = await supabase.from("car_models").insert({ name: r.car_model, brand_id }).select("id").single();
            if (!modelErr && newModel) car_model_id = newModel.id;
          }
        }

        let image_url = r.image_url || null;
        if (image_url && !isSupabaseUrl(image_url)) {
          const uploaded = await downloadAndUploadImage(image_url);
          if (uploaded) image_url = uploaded;
        }

        const payload: Record<string, unknown> = {
          name: r.name,
          description: r.description,
          price: r.price,
          stock: r.stock,
          category_id,
          brand: brand_id ? r.brand : "",
          car_model: car_model_id ? r.car_model : "",
          image_url,
          featured: r.featured,
        };

        const { data: product, error: prodErr } = await supabase.from("products").insert(payload).select("id").single();
        if (prodErr || !product) {
          skipped++;
          continue;
        }

        if (brand_id) {
          await supabase.from("product_brands").insert({ product_id: product.id, brand_id });
        }
        if (car_model_id) {
          await supabase.from("product_car_models").insert({ product_id: product.id, car_model_id });
        }

        imported++;
      } catch {
        skipped++;
      }

      setProgress({ current: i + 1, total: valid.length });
    }

    setImporting(false);
    toast.success(`${imported} productos importados`, {
      description: skipped > 0 ? `${skipped} productos omitidos por errores` : undefined,
    });

    if (imported > 0) setRows([]);
  };

async function downloadAndUploadImage(imageUrl: string): Promise<string | null> {
  try {
    const proxyRes = await fetch("/api/upload-image-from-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: imageUrl }),
    });

    if (!proxyRes.ok) return null;

    const blob = await proxyRes.blob();
    const contentType = blob.type || "image/jpeg";
    const ext = contentType.split("/")[1] || "jpg";
    const fileName = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const supabase = createClient();
    const { error } = await supabase.storage
      .from("images")
      .upload(fileName, blob, { contentType, upsert: true });

    if (error) return null;

    const { data: { publicUrl } } = supabase.storage.from("images").getPublicUrl(fileName);
    return publicUrl;
  } catch {
    return null;
  }
}

function isSupabaseUrl(url: string) {
  return url.includes("supabase.co/storage");
}

const validCount = rows.filter((r) => r.errors.length === 0).length;
const duplicateCount = rows.filter((r) => r.errors.includes("duplicado")).length;
const errorCount = rows.filter((r) => r.errors.length > 0 && !r.errors.includes("duplicado")).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Carga masiva de productos</CardTitle>
          <CardDescription>
            Crea una hoja pública en Google Sheets y pega la URL. Las marcas y modelos se crearán automáticamente si no existen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="url"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-9"
                onKeyDown={(e) => e.key === "Enter" && fetchSheet()}
              />
            </div>
            <Button onClick={fetchSheet} disabled={loading || !url.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Table2 className="h-4 w-4 mr-1" />}
              {loading ? "Cargando..." : "Cargar datos"}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">1. Crea tu Google Sheets con estas columnas (primera fila = encabezados):</p>
            <p><code className="bg-muted px-1 rounded">name</code> (obligatorio) — Nombre del producto</p>
            <p><code className="bg-muted px-1 rounded">description</code> — Descripción</p>
            <p><code className="bg-muted px-1 rounded">price</code> (obligatorio) — Precio (ej: 99.99)</p>
            <p><code className="bg-muted px-1 rounded">stock</code> (obligatorio) — Stock (entero)</p>
            <p><code className="bg-muted px-1 rounded">category</code> — Nombre de categoría (debe existir)</p>
            <p><code className="bg-muted px-1 rounded">brand</code> — Marca (se crea automáticamente si no existe)</p>
            <p><code className="bg-muted px-1 rounded">car_model</code> — Modelo (requiere marca, se crea automáticamente)</p>
            <p><code className="bg-muted px-1 rounded">image_url</code> — URL pública de la imagen (opcional)</p>
            <p><code className="bg-muted px-1 rounded">featured</code> — true/false (opcional)</p>
            <p className="font-medium text-foreground mt-2">2. Comparte la hoja: Archivo → Compartir → Cualquier persona con el enlace → Lector</p>
            <p className="font-medium text-foreground">3. Copia la URL y pégala arriba</p>
          </div>
        </CardContent>
      </Card>

      {rows.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Previsualización</CardTitle>
              <CardDescription>
                {rows.length} filas ·{" "}
                <Badge variant="default" className="bg-green-600">{validCount} válidas</Badge>{" "}
                {duplicateCount > 0 && <Badge variant="secondary" className="bg-amber-600">{duplicateCount} duplicados</Badge>}{" "}
                <Badge variant={errorCount > 0 ? "destructive" : "secondary"}>{errorCount} con errores</Badge>
              </CardDescription>
            </div>
            {!importing && (
              <Button onClick={importAll} disabled={validCount === 0} size="lg">
                <CheckCircle2 className="h-4 w-4 mr-1" /> Importar {validCount} producto{validCount !== 1 ? "s" : ""}
              </Button>
            )}
            {importing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Importando {progress.current} de {progress.total}...
              </div>
            )}
          </CardHeader>
          <CardContent className="max-h-[500px] overflow-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-2 font-medium">#</th>
                  <th className="py-2 pr-2 font-medium">Nombre</th>
                  <th className="py-2 pr-2 font-medium">Precio</th>
                  <th className="py-2 pr-2 font-medium">Stock</th>
                  <th className="py-2 pr-2 font-medium">Categoría</th>
                  <th className="py-2 pr-2 font-medium">Marca</th>
                  <th className="py-2 pr-2 font-medium">Modelo</th>
                  <th className="py-2 pr-2 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.row} className={`border-b last:border-0 ${r.errors.includes("duplicado") ? "bg-amber-500/10" : r.errors.length > 0 ? "bg-destructive/5" : ""}`}>
                    <td className="py-2 pr-2 text-muted-foreground">{r.row}</td>
                    <td className="py-2 pr-2 font-medium max-w-[200px] truncate">{r.name || "—"}</td>
                    <td className="py-2 pr-2">{r.price != null ? `S/ ${r.price.toFixed(2)}` : "—"}</td>
                    <td className="py-2 pr-2">{r.stock != null ? r.stock : "—"}</td>
                    <td className="py-2 pr-2 max-w-[120px] truncate">{r.category || "—"}</td>
                    <td className="py-2 pr-2 max-w-[120px] truncate">{r.brand || "—"}</td>
                    <td className="py-2 pr-2 max-w-[120px] truncate">{r.car_model || "—"}</td>
                    <td className="py-2">
                      {r.errors.includes("duplicado") ? (
                        <span className="text-amber-600 text-xs" title="Ya existe en la base de datos">
                          <BadgeAlert className="h-4 w-4 inline mr-0.5" />Duplicado
                        </span>
                      ) : r.errors.length > 0 ? (
                        <span className="text-destructive text-xs" title={r.errors.join(", ")}>
                          <AlertCircle className="h-4 w-4 inline mr-0.5" />{r.errors.length} error(es)
                        </span>
                      ) : (
                        <span className="text-green-600"><CheckCircle2 className="h-4 w-4" /></span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
          {importing && (
            <CardFooter className="border-t">
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${(progress.current / progress.total) * 100}%` }} />
              </div>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
}
