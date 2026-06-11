"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Upload, X, ImageIcon } from "lucide-react";

interface ImageUploadProps {
  currentUrl: string | null;
  folder: string;
  onUpload: (url: string | null) => void;
}

export function ImageUpload({ currentUrl, folder, onUpload }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten archivos de imagen");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe superar los 5MB");
      return;
    }

    setUploading(true);

    const ext = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from("images")
      .upload(fileName, file, { upsert: true });

    if (error) {
      toast.error("Error al subir la imagen");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("images")
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;
    setPreview(publicUrl);
    onUpload(publicUrl);
    setUploading(false);
    toast.success("Imagen subida correctamente");
  }

  function handleRemove() {
    setPreview(null);
    onUpload(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative w-full h-40 rounded-lg overflow-hidden border bg-muted">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-contain"
            sizes="400px"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 h-7 w-7 bg-background/80 hover:bg-background"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-40 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground"
        >
          <ImageIcon className="h-8 w-8" />
          <span className="text-sm">Haz clic para subir una imagen</span>
          <span className="text-xs">JPG, PNG o WebP (máx. 5MB)</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
      {preview && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="h-4 w-4 mr-1" />
          {uploading ? "Subiendo..." : "Cambiar imagen"}
        </Button>
      )}
      {!preview && uploading && (
        <p className="text-sm text-muted-foreground text-center">Subiendo imagen...</p>
      )}
    </div>
  );
}
