"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { Search, Upload, CheckCircle2, XCircle, Loader2, ImageIcon, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  image_url: string | null;
}

export function BatchImageUploader() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const supabase = createClient();

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase.from("products").select("id, name, image_url").order("name");

    if (search.trim()) {
      query = query.ilike("name", `%${search.trim()}%`);
    }

    const { data, error } = await query;
    if (!error && data) setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleUpload = async (productId: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Solo imágenes");
      return;
    }

    setUploading((prev) => ({ ...prev, [productId]: true }));

    try {
      const ext = "webp";
      const fileName = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      let uploadFile: File | Blob = file;

      if (file.type !== "image/webp") {
        const img = await createImageBitmap(file);
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/webp", 0.8)
        );
        if (blob) uploadFile = blob;
        img.close();
      }

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(fileName, uploadFile, { contentType: "image/webp", upsert: true });

      if (uploadError) {
        toast.error("Error al subir");
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from("images").getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("products")
        .update({ image_url: publicUrl })
        .eq("id", productId);

      if (updateError) {
        toast.error("Error al actualizar producto");
        return;
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, image_url: publicUrl } : p))
      );

      toast.success("Imagen subida");
    } catch {
      toast.error("Error al procesar la imagen");
    } finally {
      setUploading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleUrlUpload = async (productId: string, url: string) => {
    if (!url) return;
    setUploading((prev) => ({ ...prev, [productId]: true }));

    try {
      const res = await fetch("/api/upload-image-from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        toast.error("No se pudo descargar la imagen");
        return;
      }

      const blob = await res.blob();
      const ext = "webp";
      const fileName = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(fileName, blob, { contentType: blob.type || "image/webp", upsert: true });

      if (uploadError) {
        toast.error("Error al subir");
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from("images").getPublicUrl(fileName);

      await supabase.from("products").update({ image_url: publicUrl }).eq("id", productId);

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, image_url: publicUrl } : p))
      );

      toast.success("Imagen asignada");
    } catch {
      toast.error("Error al procesar la imagen");
    } finally {
      setUploading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const filtered = search.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  const withoutImage = filtered.filter((p) => !p.image_url);
  const withImage = filtered.filter((p) => p.image_url);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Asignar imágenes a productos</CardTitle>
          <CardDescription>Sube imágenes individualmente o pega una URL para cada producto sin imagen.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Cargando productos...
            </div>
          ) : (
            <>
              {withoutImage.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    Sin imagen <Badge variant="destructive">{withoutImage.length}</Badge>
                  </h3>
                  <div className="space-y-2">
                    {withoutImage.map((p) => (
                      <ProductImageRow
                        key={p.id}
                        product={p}
                        uploading={!!uploading[p.id]}
                        inputRef={(el) => { inputRefs.current[p.id] = el; }}
                        onFile={(file) => handleUpload(p.id, file)}
                        onUrl={(url) => handleUrlUpload(p.id, url)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {withImage.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    Con imagen <Badge className="bg-green-600">{withImage.length}</Badge>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {withImage.map((p) => (
                      <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg border text-sm">
                        <div className="relative w-10 h-10 rounded overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.image_url!}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback display if image fails to load
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                        <span className="truncate flex-1">{p.name}</span>
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filtered.length === 0 && (
                <p className="text-center py-12 text-muted-foreground">No se encontraron productos</p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProductImageRow({
  product,
  uploading,
  inputRef,
  onFile,
  onUrl,
}: {
  product: Product;
  uploading: boolean;
  inputRef: (el: HTMLInputElement | null) => void;
  onFile: (file: File) => void;
  onUrl: (url: string) => void;
}) {
  const [urlInput, setUrlInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg border text-sm">
      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0">
        <ImageIcon className="h-5 w-5 text-muted-foreground" />
      </div>
      <span className="truncate flex-1">{product.name}</span>
      {uploading ? (
        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
      ) : (
        <div className="flex items-center gap-1 shrink-0">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileRef}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              if (fileRef.current) fileRef.current.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-3 w-3 mr-1" /> Subir
          </Button>
          <div className="flex gap-1">
            <input
              ref={inputRef}
              type="url"
              placeholder="URL de imagen..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-40 h-8 px-2 text-xs border rounded"
              onKeyDown={(e) => {
                if (e.key === "Enter" && urlInput.trim()) {
                  onUrl(urlInput.trim());
                  setUrlInput("");
                }
              }}
            />
            {urlInput.trim() && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  onUrl(urlInput.trim());
                  setUrlInput("");
                }}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
