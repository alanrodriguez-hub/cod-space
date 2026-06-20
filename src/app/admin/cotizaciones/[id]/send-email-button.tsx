"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SendEmailButton({ quoteId }: { quoteId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    setLoading(true);

    const res = await fetch(`/api/quotes/${quoteId}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message.trim() || null }),
    });

    setLoading(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || "Error al enviar email");
      return;
    }

    toast.success("Cotización enviada por email");
    setOpen(false);
    setMessage("");
    router.refresh();
  }

  if (!open) {
    return (
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="gap-2 cursor-pointer"
      >
        <Send className="h-4 w-4" />
        Enviar por Email
      </Button>
    );
  }

  return (
    <div className="w-full space-y-3 border rounded-lg p-4">
      <p className="text-sm font-medium">Enviar Cotización por Email</p>
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Mensaje adicional para el cliente..."
        rows={3}
      />
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={handleSend}
          disabled={loading}
          size="sm"
          className="cursor-pointer"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-1" />
          )}
          {loading ? "Enviando..." : "Enviar"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(false)}
          className="cursor-pointer"
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}
