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
  created_at: string;
  category?: Category;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string;
  status: "pending" | "confirmed" | "completed";
  total: number;
  created_at: string;
  order_items?: OrderItem[];
}

export type UserRole = "customer" | "admin";

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
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

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: Product;
}
