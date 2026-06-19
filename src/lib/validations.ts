import { z } from "zod";

export const emailSchema = z.string().email("Email inválido").max(255);

export const otpSchema = z.string().length(8, "El código debe tener 8 dígitos").regex(/^\d+$/, "Solo números");

export const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(200),
  description: z.string().max(2000).default(""),
  price: z.number().positive("El precio debe ser mayor a 0"),
  stock: z.number().int().min(0, "El stock no puede ser negativo"),
  category_id: z.string().uuid().nullable(),
  image_url: z.string().url().nullable().or(z.literal("")),
  featured: z.boolean().default(false),
});

export const categorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug inválido (solo minúsculas, números y guiones)"),
  image_url: z.string().url().nullable().or(z.literal("")),
});

export const brandSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  image_url: z.string().url().nullable().or(z.literal("")),
});

export const carModelSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  brand_id: z.string().uuid("Marca inválida"),
});

export const bannerSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(200),
  subtitle: z.string().max(500).nullable().or(z.literal("")),
  image_url: z.string().url().nullable().or(z.literal("")),
  link_url: z.string().max(500).nullable().or(z.literal("")),
  active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
});

export const orderItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive("La cantidad debe ser mayor a 0"),
  unit_price: z.number().positive("El precio debe ser mayor a 0"),
});

export const createOrderSchema = z.object({
  p_user_id: z.string().uuid(),
  p_items: z.array(orderItemSchema).min(1, "Debe haber al menos un producto"),
});

export const profileSchema = z.object({
  full_name: z.string().max(200).nullable().or(z.literal("")),
  phone: z.string().max(50).nullable().or(z.literal("")),
  rut: z.string().max(20).nullable().or(z.literal("")),
  address_street: z.string().max(300).nullable().or(z.literal("")),
  address_city: z.string().max(100).nullable().or(z.literal("")),
  address_region: z.string().max(100).nullable().or(z.literal("")),
  address_zip: z.string().max(20).nullable().or(z.literal("")),
});
