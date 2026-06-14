#!/usr/bin/env node

/**
 * Script de importación directa a Supabase.
 * Carga marcas, modelos y productos desde datos embebidos.
 * Verifica duplicados antes de insertar.
 *
 * Uso:
 *   node scripts/import-data.mjs                # importa todo
 *   node scripts/import-data.mjs --dry-run       # solo muestra qué haría
 *   node scripts/import-data.mjs --brands        # solo marcas
 *   node scripts/import-data.mjs --models        # solo modelos
 *   node scripts/import-data.mjs --products      # solo productos
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Leer .env.local ────────────────────────────────────────────
function loadEnv() {
  const envPath = resolve(__dirname, "..", ".env.local");
  if (!existsSync(envPath)) {
    console.error("❌ .env.local no encontrado. Copiá .env.example a .env.local y completá las variables.");
    process.exit(1);
  }
  const text = readFileSync(envPath, "utf-8");
  const vars = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    vars[key] = val;
  }
  return vars;
}

// ── Datos embebidos ────────────────────────────────────────────
// Formato: [nombre_marca, [modelo1, modelo2, ...]]
const BRANDS = [
  ["BYD", ["Dolphin Mini", "Dolphin", "Yuan Pro", "Song Pro", "Seal", "Tang EV", "Han EV"]],
  ["MG", ["3", "5", "GT", "ZS", "ZX", "ONE", "HS", "RX5", "ZS EV", "4", "Marvel R"]],
  ["Chery", ["Tiggo 2 Pro Max", "Tiggo 3 Pro", "Tiggo 7 Pro Max", "Tiggo 8 Pro Max", "Tiggo 8 Pro Híbrido"]],
  ["Changan", ["Alsvin", "CS15", "CS35 Plus", "CS55", "X7 Plus", "UNI-T", "UNI-K", "Hunter"]],
  ["Great Wall", ["Haval Jolion", "Haval Jolion Híbrido", "Haval H6", "Haval Dargo", "Poer Elite", "Wingle 7"]],
  ["Geely", ["GX3 Pro", "Coolray", "Starray", "Okavango"]],
  ["BAIC", ["X35", "X55", "X55 Plus", "X7", "BJ40P"]],
  ["GAC", ["GS3 Power", "GS4 Power", "Emkoo", "Emzoom", "GS8", "Aion S"]],
  ["JAC", ["JS2", "JS3", "JS4", "JS6", "JS8", "T6", "T8", "T8 Pro", "E-JS1", "E-JS4"]],
  ["Jetour", ["Dashing", "X70", "X90 Plus", "T2"]],
  ["DFSK", ["500", "560", "580", "600", "D1", "EC35"]],
  ["Omoda", ["C5", "C5 Luxury", "C5 Prestige", "E5"]],
  ["Dongfeng", ["Aeolus Y3", "T5", "Aeolus GS Cross", "T5 EVO"]],
  ["Kaiyi", ["KYX3", "KYX3 Pro", "KYE5"]],
  ["Foton", ["G7", "G9", "FT 2.8", "Midi"]],
  ["JMC", ["Vigus Work", "Vigus Plus", "Vigus Pro", "Grand Avenue", "Touring"]],
  ["Maxus", ["T60", "T90", "D60", "D90", "G10", "Deliver 9"]],
  ["ZX Auto", ["Terralord", "New Grandlion"]],
  ["Karry", ["Q22", "Q51"]],
];

const CATEGORIES = ["SUV", "Sedán", "Hatchback", "Camioneta", "Eléctrico", "Comercial", "Híbrido", "Coupé"];

// ── Cliente Supabase ───────────────────────────────────────────
let supabase;

function initClient() {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL no está en .env.local");
    process.exit(1);
  }
  if (!anonKey && !serviceKey) {
    console.error("❌ No hay SUPABASE_SERVICE_ROLE_KEY ni NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en .env.local");
    process.exit(1);
  }

  // 1) Service role key → bypass total de RLS
  if (serviceKey) {
    supabase = createClient(url, serviceKey);
    console.log("  ✓ Usando service_role key (bypass RLS)");
    return true;
  }

  // 2) Anon key + autenticación como admin
  supabase = createClient(url, anonKey);

  if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
    // Iniciar sesión como admin
    throw new Error(
      "ADMIN_EMAIL/ADMIN_PASSWORD no implementado. Usá SUPABASE_SERVICE_ROLE_KEY en .env.local"
    );
  }

  if (env.SUPABASE_ACCESS_TOKEN) {
    // Usar token de sesión existente
    throw new Error(
      "SUPABASE_ACCESS_TOKEN no implementado. Usá SUPABASE_SERVICE_ROLE_KEY en .env.local"
    );
  }

  throw new Error(
    "Con la anon key no podés insertar desde un script porque RLS bloquea.\n" +
    "        Agregá SUPABASE_SERVICE_ROLE_KEY a .env.local (desde Supabase Dashboard → Project Settings → API)"
  );
}

// ── Importar categorías ────────────────────────────────────────
async function importCategories(dryRun) {
  let count = 0;
  for (const name of CATEGORIES) {
    const { data: existing } = await supabase.from("categories").select("id").eq("name", name).maybeSingle();
    if (existing) {
      console.log(`  ↳ ${name} — ya existe (id=${existing.id})`);
      continue;
    }
    if (!dryRun) {
      const { data, error } = await supabase.from("categories").insert({ name }).select("id").single();
      if (error) {
        console.error(`  ✗ ${name} — error: ${error.message}`);
        continue;
      }
      console.log(`  ✓ ${name} — creada (id=${data.id})`);
    } else {
      console.log(`  → ${name} — se crearía`);
    }
    count++;
  }
  return count;
}

// ── Importar marcas y modelos ──────────────────────────────────
async function importBrandsAndModels(dryRun) {
  const brandIds = {};
  let brandCount = 0;
  let modelCount = 0;

  for (const [brandName, models] of BRANDS) {
    const { data: existingBrand } = await supabase.from("brands").select("id").eq("name", brandName).maybeSingle();
    let brandId;
    if (existingBrand) {
      brandId = existingBrand.id;
      console.log(`  ↳ ${brandName} — ya existe (id=${brandId})`);
    } else {
      if (!dryRun) {
        const { data, error } = await supabase.from("brands").insert({ name: brandName }).select("id").single();
        if (error) {
          console.error(`  ✗ ${brandName} — error: ${error.message}`);
          continue;
        }
        brandId = data.id;
        console.log(`  ✓ ${brandName} — creada (id=${brandId})`);
      } else {
        console.log(`  → ${brandName} — se crearía`);
      }
      brandCount++;
    }

    if (!brandId) {
      // En dry-run, usar un placeholder
      brandIds[brandName] = null;
      continue;
    }
    brandIds[brandName] = brandId;

    if (!dryRun) {
      // Si no existía, puede que no tengamos brandId en dry-run
    }

    for (const modelName of models) {
      if (!brandId) {
        console.log(`  ↳ ${modelName} (${brandName}) — sin brand_id`);
        continue;
      }
      const { data: existingModel } = await supabase
        .from("car_models")
        .select("id")
        .eq("name", modelName)
        .eq("brand_id", brandId)
        .maybeSingle();
      if (existingModel) {
        console.log(`    ↳ ${modelName} — ya existe (id=${existingModel.id})`);
        continue;
      }
      if (!dryRun) {
        const { data, error } = await supabase.from("car_models").insert({ name: modelName, brand_id: brandId }).select("id").single();
        if (error) {
          console.error(`    ✗ ${modelName} (${brandName}) — error: ${error.message}`);
          continue;
        }
        console.log(`    ✓ ${modelName} (${brandName}) — creado (id=${data.id})`);
      } else {
        console.log(`    → ${modelName} (${brandName}) — se crearía`);
      }
      modelCount++;
    }
  }

  return { brandIds, brandCount, modelCount };
}

// ── Productos de ejemplo ───────────────────────────────────────
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

async function importProducts(dryRun, brandMap) {
  let count = 0;
  let skippedDuplicate = 0;
  let skippedNoBrand = 0;
  let skippedNoModel = 0;

  for (const p of PRODUCTS) {
    const brandId = brandMap[p.brand];
    if (!brandId) {
      console.log(`  ↳ ${p.name} — marca "${p.brand}" no encontrada (no se creó antes?)`);
      skippedNoBrand++;
      continue;
    }

    // Buscar car_model_id
    const { data: model } = await supabase
      .from("car_models")
      .select("id")
      .eq("name", p.car_model)
      .eq("brand_id", brandId)
      .maybeSingle();
    const carModelId = model?.id;
    if (!carModelId && p.car_model) {
      console.log(`  ↳ ${p.name} — modelo "${p.car_model}" no encontrado`);
      skippedNoModel++;
      continue;
    }

    // Verificar duplicado por nombre
    const { data: existing } = await supabase.from("products").select("id").eq("name", p.name).maybeSingle();
    if (existing) {
      console.log(`  ↳ ${p.name} — ya existe (id=${existing.id})`);
      skippedDuplicate++;
      continue;
    }

    if (!dryRun) {
      const payload = {
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        brand: p.brand,
        car_model: p.car_model,
        featured: p.featured,
      };
      const { data, error } = await supabase.from("products").insert(payload).select("id").single();
      if (error) {
        console.error(`  ✗ ${p.name} — error: ${error.message}`);
        continue;
      }

      // Vincular marca si existe product_brands
      await supabase.from("product_brands").insert({ product_id: data.id, brand_id: brandId }).catch(() => {});
      if (carModelId) {
        await supabase.from("product_car_models").insert({ product_id: data.id, car_model_id: carModelId }).catch(() => {});
      }

      console.log(`  ✓ ${p.name} — creado (id=${data.id})`);
    } else {
      console.log(`  → ${p.name} — se crearía`);
    }
    count++;
  }

  return { count, skippedDuplicate, skippedNoBrand, skippedNoModel };
}

// ── Main ───────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const onlyBrands = args.includes("--brands");
  const onlyModels = args.includes("--models");
  const onlyProducts = args.includes("--products");

  if (dryRun) console.log("\n🏁 MODO DRY RUN — no se ejecutarán cambios\n");

  console.log("🔌 Inicializando cliente Supabase...");
  initClient();

  // ── Categorías ──
  if (!onlyBrands && !onlyModels && !onlyProducts) {
    console.log("\n📁 Categorías:");
    const catCount = await importCategories(dryRun);
    console.log(`  → ${catCount} categorías ${dryRun ? "se crearían" : "creadas"}`);
  }

  // ── Marcas y modelos ──
  if (!onlyProducts) {
    console.log("\n🏢 Marcas y modelos:");
    const result = await importBrandsAndModels(dryRun);
    console.log(`  → ${result.brandCount} marcas ${dryRun ? "se crearían" : "creadas"}`);
    console.log(`  → ${result.modelCount} modelos ${dryRun ? "se crearían" : "creados"}`);

    if (!onlyBrands && !onlyModels && !dryRun) {
      // Reobtener brand_ids para la importación de productos
      console.log("\n📦 Productos:");
      const brandMap = {};
      for (const [brandName] of BRANDS) {
        const { data } = await supabase.from("brands").select("id").eq("name", brandName).single();
        if (data) brandMap[brandName] = data.id;
      }
      const prodResult = await importProducts(false, brandMap);
      console.log(`  → ${prodResult.count} productos creados`);
      if (prodResult.skippedDuplicate) console.log(`  → ${prodResult.skippedDuplicate} duplicados omitidos`);
      if (prodResult.skippedNoBrand) console.log(`  → ${prodResult.skippedNoBrand} sin marca omitidos`);
      if (prodResult.skippedNoModel) console.log(`  → ${prodResult.skippedNoModel} sin modelo omitidos`);
    }
  }

  // ── Solo productos (requiere brandMap) ──
  if (onlyProducts && !dryRun) {
    console.log("\n📦 Productos:");
    const brandMap = {};
    for (const [brandName] of BRANDS) {
      const { data } = await supabase.from("brands").select("id").eq("name", brandName).single();
      if (data) brandMap[brandName] = data.id;
    }
    const prodResult = await importProducts(false, brandMap);
    console.log(`  → ${prodResult.count} productos creados`);
    if (prodResult.skippedDuplicate) console.log(`  → ${prodResult.skippedDuplicate} duplicados omitidos`);
  }

  if (dryRun && onlyProducts) {
    console.log("\n📦 Productos:");
    const brandMap = {};
    for (const [brandName] of BRANDS) {
      const { data } = await supabase.from("brands").select("id").eq("name", brandName).single();
      if (data) brandMap[brandName] = data.id;
    }
    const prodResult = await importProducts(true, brandMap);
    console.log(`  → ${prodResult.count} productos (dry-run)`);
  }

  console.log("\n✅ Listo!");
}

main().catch((err) => {
  console.error("❌ Error general:", err.message);
  process.exit(1);
});
