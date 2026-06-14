import { createClient } from "@/lib/supabase/server";

const BRANDS: [string, string[], string][] = [
  ["BYD", ["Dolphin Mini", "Dolphin", "Yuan Pro", "Song Pro", "Seal", "Tang EV", "Han EV"], "https://upload.wikimedia.org/wikipedia/commons/e/e2/BYD_Auto_2022_logo.svg"],
  ["MG", ["3", "5", "GT", "ZS", "ZX", "ONE", "HS", "RX5", "ZS EV", "4", "Marvel R"], "https://upload.wikimedia.org/wikipedia/commons/5/5e/Mg_logo.svg"],
  ["Chery", ["Tiggo 2 Pro Max", "Tiggo 3 Pro", "Tiggo 7 Pro Max", "Tiggo 8 Pro Max", "Tiggo 8 Pro Híbrido"], "https://www.carlogos.org/logo/Chery-logo-2013-2560x1440.png"],
  ["Changan", ["Alsvin", "CS15", "CS35 Plus", "CS55", "X7 Plus", "UNI-T", "UNI-K", "Hunter"], "https://www.carlogos.org/logo/Changan-logo-2560x1440.png"],
  ["Great Wall", ["Haval Jolion", "Haval Jolion Híbrido", "Haval H6", "Haval Dargo", "Poer Elite", "Wingle 7"], "https://upload.wikimedia.org/wikipedia/commons/7/7f/Great_Wall_Motors_logo.svg"],
  ["Geely", ["GX3 Pro", "Coolray", "Starray", "Okavango"], "https://www.carlogos.org/logo/Geely-logo-2560x1440.png"],
  ["BAIC", ["X35", "X55", "X55 Plus", "X7", "BJ40P"], "https://www.carlogos.org/logo/BAIC-logo-2560x1440.png"],
  ["GAC", ["GS3 Power", "GS4 Power", "Emkoo", "Emzoom", "GS8", "Aion S"], "https://www.carlogos.org/logo/GAC-logo-2560x1440.png"],
  ["JAC", ["JS2", "JS3", "JS4", "JS6", "JS8", "T6", "T8", "T8 Pro", "E-JS1", "E-JS4"], "https://www.carlogos.org/logo/JAC-logo-2560x1440.png"],
  ["Jetour", ["Dashing", "X70", "X90 Plus", "T2"], "https://www.carlogos.org/logo/Jetour-logo-2560x1440.png"],
  ["DFSK", ["500", "560", "580", "600", "D1", "EC35"], "https://www.carlogos.org/logo/DFSK-logo-2560x1440.png"],
  ["Omoda", ["C5", "C5 Luxury", "C5 Prestige", "E5"], ""],
  ["Dongfeng", ["Aeolus Y3", "T5", "Aeolus GS Cross", "T5 EVO"], "https://www.carlogos.org/logo/Dongfeng-logo-2560x1440.png"],
  ["Kaiyi", ["KYX3", "KYX3 Pro", "KYE5"], ""],
  ["Foton", ["G7", "G9", "FT 2.8", "Midi"], "https://www.carlogos.org/logo/Foton-logo-2560x1440.png"],
  ["JMC", ["Vigus Work", "Vigus Plus", "Vigus Pro", "Grand Avenue", "Touring"], "https://www.carlogos.org/logo/JMC-logo-2560x1440.png"],
  ["Maxus", ["T60", "T90", "D60", "D90", "G10", "Deliver 9"], "https://www.carlogos.org/logo/Maxus-logo-2560x1440.png"],
  ["ZX Auto", ["Terralord", "New Grandlion"], ""],
  ["Karry", ["Q22", "Q51"], ""],
];

const PRODUCTS = [
  { name: "BYD Dolphin Mini", description: "Hatchback eléctrico 100% EV", price: 20990000, stock: 0, brand: "BYD", car_model: "Dolphin Mini", featured: true },
  { name: "BYD Dolphin", description: "Hatchback eléctrico 100% EV", price: 28990000, stock: 0, brand: "BYD", car_model: "Dolphin", featured: false },
  { name: "BYD Yuan Pro", description: "SUV eléctrico 100% EV", price: 26990000, stock: 0, brand: "BYD", car_model: "Yuan Pro", featured: false },
  { name: "BYD Song Pro", description: "SUV eléctrico 100% EV", price: 31990000, stock: 0, brand: "BYD", car_model: "Song Pro", featured: false },
  { name: "BYD Seal", description: "Sedán eléctrico 100% EV", price: 56990000, stock: 0, brand: "BYD", car_model: "Seal", featured: false },
  { name: "MG ZS", description: "SUV compacto gasolinero", price: 12790000, stock: 0, brand: "MG", car_model: "ZS", featured: true },
  { name: "MG 3", description: "Hatchback compacto gasolinero", price: 10590000, stock: 0, brand: "MG", car_model: "3", featured: false },
  { name: "MG GT", description: "Sedán deportivo gasolinero", price: 14790000, stock: 0, brand: "MG", car_model: "GT", featured: false },
  { name: "MG ONE", description: "SUV moderno gasolinero", price: 17990000, stock: 0, brand: "MG", car_model: "ONE", featured: false },
  { name: "MG HS", description: "SUV mediano gasolinero", price: 17990000, stock: 0, brand: "MG", car_model: "HS", featured: false },
  { name: "Chery Tiggo 2 Pro Max", description: "SUV compacto gasolinero", price: 12990000, stock: 0, brand: "Chery", car_model: "Tiggo 2 Pro Max", featured: true },
  { name: "Chery Tiggo 7 Pro Max", description: "SUV mediano gasolinero", price: 19990000, stock: 0, brand: "Chery", car_model: "Tiggo 7 Pro Max", featured: false },
  { name: "Chery Tiggo 8 Pro Max", description: "SUV 7 asientos gasolinero", price: 23990000, stock: 0, brand: "Chery", car_model: "Tiggo 8 Pro Max", featured: false },
  { name: "Haval Jolion", description: "SUV compacto gasolinero", price: 17390000, stock: 0, brand: "Great Wall", car_model: "Haval Jolion", featured: false },
  { name: "Haval H6", description: "SUV mediano gasolinero", price: 22090000, stock: 0, brand: "Great Wall", car_model: "Haval H6", featured: false },
  { name: "Haval Dargo", description: "SUV off-road gasolinero", price: 24390000, stock: 0, brand: "Great Wall", car_model: "Haval Dargo", featured: false },
  { name: "Changan Alsvin", description: "Sedán compacto gasolinero", price: 10490000, stock: 0, brand: "Changan", car_model: "Alsvin", featured: false },
  { name: "Changan CS35 Plus", description: "SUV compacto gasolinero", price: 16890000, stock: 0, brand: "Changan", car_model: "CS35 Plus", featured: false },
  { name: "Changan UNI-T", description: "SUV coupe gasolinero", price: 22690000, stock: 0, brand: "Changan", car_model: "UNI-T", featured: false },
  { name: "Geely GX3 Pro", description: "SUV compacto gasolinero", price: 10790000, stock: 0, brand: "Geely", car_model: "GX3 Pro", featured: false },
  { name: "Geely Coolray", description: "SUV coupe gasolinero", price: 16990000, stock: 0, brand: "Geely", car_model: "Coolray", featured: true },
  { name: "Geely Okavango", description: "SUV 7 asientos gasolinero", price: 24690000, stock: 0, brand: "Geely", car_model: "Okavango", featured: false },
  { name: "BAIC X35", description: "SUV compacto gasolinero", price: 12090000, stock: 0, brand: "BAIC", car_model: "X35", featured: false },
  { name: "BAIC X55 Plus", description: "SUV mediano gasolinero", price: 17990000, stock: 0, brand: "BAIC", car_model: "X55 Plus", featured: false },
  { name: "GAC GS3 Power", description: "SUV compacto gasolinero", price: 12990000, stock: 0, brand: "GAC", car_model: "GS3 Power", featured: true },
  { name: "GAC Emkoo", description: "SUV coupe gasolinero", price: 18490000, stock: 0, brand: "GAC", car_model: "Emkoo", featured: false },
  { name: "JAC JS2", description: "SUV compacto gasolinero", price: 12090000, stock: 0, brand: "JAC", car_model: "JS2", featured: false },
  { name: "JAC JS4", description: "SUV mediano gasolinero", price: 13940000, stock: 0, brand: "JAC", car_model: "JS4", featured: false },
  { name: "Jetour Dashing", description: "SUV juvenil gasolinero", price: 17490000, stock: 0, brand: "Jetour", car_model: "Dashing", featured: false },
  { name: "Jetour X70", description: "SUV familiar gasolinero", price: 17490000, stock: 0, brand: "Jetour", car_model: "X70", featured: false },
  { name: "Omoda C5", description: "SUV compacto gasolinero", price: 15990000, stock: 0, brand: "Omoda", car_model: "C5", featured: false },
];

const CATEGORIES = ["SUV", "Sedán", "Hatchback", "Camioneta", "Eléctrico", "Comercial", "Híbrido", "Coupé"];

export async function GET() {
  try {
    const supabase = await createClient();
    const log = [];

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return Response.json({ error: "No autenticado" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return Response.json({ error: "No eres admin" }, { status: 403 });

    log.push(`✅ Admin autenticado: ${user.email}`);

    // ── Categorías ──
    for (const name of CATEGORIES) {
      const { data: existing } = await supabase.from("categories").select("id").eq("name", name).maybeSingle();
      if (existing) { log.push(`↳ Categoría "${name}" ya existe`); continue; }
      await supabase.from("categories").insert({ name });
      log.push(`✓ Categoría "${name}" creada`);
    }

    // ── Marcas y modelos ──
    const brandMap: Record<string, string> = {};
    for (const [brandName, models, logoUrl] of BRANDS) {
      const { data: existingBrand } = await supabase.from("brands").select("id, image_url").eq("name", brandName).maybeSingle();
      let brandId: string;
      let needsLogoUpdate = false;

      if (existingBrand) {
        brandId = existingBrand.id;
        needsLogoUpdate = !existingBrand.image_url && !!logoUrl;
        log.push(`↳ Marca "${brandName}" ya existe` + (needsLogoUpdate ? " (falta logo)" : ""));
      } else {
        const { data: newBrand } = await supabase.from("brands").insert({ name: brandName }).select("id").single();
        if (!newBrand) { log.push(`✗ "${brandName}" — error al crear`); continue; }
        brandId = newBrand.id;
        needsLogoUpdate = !!logoUrl;
        log.push(`✓ Marca "${brandName}" creada`);
      }

      // Descargar logo y subirlo a Supabase Storage
      if (needsLogoUpdate && logoUrl) {
        try {
          const res = await fetch(logoUrl, { signal: AbortSignal.timeout(15000) });
          if (res.ok) {
            const blob = await res.blob();
            const ext = (blob.type?.split("/")[1] || "png").replace("svg+xml", "svg");
            const fileName = `brands/${brandName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.${ext}`;

            const { error: uploadErr } = await supabase.storage
              .from("images")
              .upload(fileName, blob, { contentType: blob.type || "image/png", upsert: true });

            if (!uploadErr) {
              const { data: { publicUrl } } = supabase.storage.from("images").getPublicUrl(fileName);
              await supabase.from("brands").update({ image_url: publicUrl }).eq("id", brandId);
              log.push(`  ✓ Logo de "${brandName}" subido a Supabase`);
            } else {
              log.push(`  ⚠ No se pudo subir logo a Storage: ${uploadErr.message}`);
            }
          } else {
            log.push(`  ⚠ No se pudo descargar logo desde ${logoUrl}`);
          }
        } catch (e) {
          log.push(`  ⚠ Error al procesar logo: ${e instanceof Error ? e.message : "desconocido"}`);
        }
      }

      brandMap[brandName] = brandId;

      for (const modelName of models) {
        const { data: existingModel } = await supabase.from("car_models").select("id").eq("name", modelName).eq("brand_id", brandId).maybeSingle();
        if (existingModel) { log.push(`  ↳ Modelo "${modelName}" ya existe`); continue; }
        await supabase.from("car_models").insert({ name: modelName, brand_id: brandId });
        log.push(`  ✓ Modelo "${modelName}" (${brandName}) creado`);
      }
    }

    // ── Productos ──
    for (const p of PRODUCTS) {
      const brandId = brandMap[p.brand];
      if (!brandId) { log.push(`↳ "${p.name}" — marca "${p.brand}" no encontrada`); continue; }

      const { data: existing } = await supabase.from("products").select("id").eq("name", p.name).maybeSingle();
      if (existing) { log.push(`↳ "${p.name}" ya existe`); continue; }

      const { data: modelData } = await supabase.from("car_models").select("id").eq("name", p.car_model).eq("brand_id", brandId).maybeSingle();

      const { data: newProduct } = await supabase.from("products").insert({
        name: p.name, description: p.description, price: p.price, stock: p.stock,
        brand: p.brand, car_model: p.car_model, featured: p.featured,
      }).select("id").single();

      if (newProduct) {
        try { await supabase.from("product_brands").insert({ product_id: newProduct.id, brand_id: brandId }); } catch {}
        if (modelData) { try { await supabase.from("product_car_models").insert({ product_id: newProduct.id, car_model_id: modelData.id }); } catch {} }
        log.push(`✓ "${p.name}" creado`);
      }
    }

    return Response.json({ ok: true, log });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
