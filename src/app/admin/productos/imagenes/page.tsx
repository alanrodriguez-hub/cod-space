import { BatchImageUploader } from "@/components/admin/batch-image-uploader";
import { getSiteName } from "@/lib/data-cache";

export async function generateMetadata() {
  const siteName = await getSiteName();
  return { title: `Imágenes de productos | ${siteName}` };
}

export default function ProductImagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Imágenes de productos</h1>
        <p className="text-muted-foreground">Asigna imágenes a productos sin imagen, ya sea subiendo archivos o pegando URLs.</p>
      </div>
      <BatchImageUploader />
    </div>
  );
}
