const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Helper to parse .env file
function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      env[key] = value.trim();
    }
  });
  return env;
}

async function main() {
  const envPath = path.join(__dirname, '..', '.env.local');
  console.log('Reading env from:', envPath);
  const env = parseEnv(envPath);

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY not found in env');
    process.exit(1);
  }

  console.log('Connecting to Supabase URL:', supabaseUrl);
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('\n--- Checking Tables ---');
    
    // Products
    const { count: productCount, error: pError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    if (pError) console.error('Error querying products:', pError.message);
    else console.log('Products count:', productCount);

    // Categories
    const { count: categoryCount, error: cError } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });
    if (cError) console.error('Error querying categories:', cError.message);
    else console.log('Categories count:', categoryCount);

    // Brands
    const { count: brandCount, error: bError } = await supabase
      .from('brands')
      .select('*', { count: 'exact', head: true });
    if (bError) console.log('Brands table not available or error:', bError.message);
    else console.log('Brands count:', brandCount);

    // Car models
    const { count: modelCount, error: mError } = await supabase
      .from('car_models')
      .select('*', { count: 'exact', head: true });
    if (mError) console.log('Car models table not available or error:', mError.message);
    else console.log('Car models count:', modelCount);

    // Get sample products
    const { data: sampleProducts, error: sampleError } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    if (sampleError) {
      console.error('Error getting sample products:', sampleError.message);
    } else {
      console.log('\n--- Sample Products (First 5) ---');
      console.log(JSON.stringify(sampleProducts, null, 2));
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

main();
