export interface Brand {
  id: string;
  name: string;
  image_url: string | null;
}

export interface CarModel {
  id: string;
  name: string;
  brand_id: string;
  brand?: Brand;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category_id: string;
  brand: string;
  car_model: string;
  stock: number;
  featured: boolean;
  sku: number | null;
  item_code: string | null;
  created_at: string;
  category?: Category;
  product_brands?: { brand: Brand }[];
  product_car_models?: { car_model: CarModel }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  total: number;
  payment_method: "cash" | "transfer";
  delivery_method: "shipping" | "pickup";
  created_at: string;
  order_items?: OrderItem[];
}

export type UserRole = "customer" | "admin";

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  rut: string | null;
  address_street: string | null;
  address_city: string | null;
  address_region: string | null;
  address_zip: string | null;
  privacy_accepted_at: string | null;
  last_sign_in_at: string | null;
  created_at: string;
}

export interface AccessLog {
  id: string;
  user_id: string;
  signed_in_at: string;
  ip_address: string | null;
  profile?: Profile;
}

export interface SiteSetting {
  key: string;
  value: string;
  updated_at: string;
}

export interface SiteSettings {
  site_name: string;
  site_url: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  maps_url: string;
  store_hours_weekday: string;
  store_hours_saturday: string;
  facebook_url: string;
  instagram_url: string;
  tiktok_url: string;
  whatsapp_url: string;
  transfer_company_name: string;
  transfer_company_rut: string;
  transfer_bank_name: string;
  transfer_account_type: string;
  transfer_account_number: string;
  transfer_email: string;
  smtp_host: string;
  smtp_port: string;
  smtp_user: string;
  smtp_password: string;
  smtp_from: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
}

export type QuoteStatus = "pending" | "contacted" | "completed" | "cancelled";

export interface QuoteItem {
  type: "product" | "custom";
  product_id?: string;
  product_name: string;
  quantity: number;
}

export interface Quote {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  user_id: string | null;
  items: QuoteItem[];
  message: string;
  status: QuoteStatus;
  created_at: string;
  updated_at: string;
}

export interface QuoteResponseItem {
  id: string;
  quote_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: Product;
}
