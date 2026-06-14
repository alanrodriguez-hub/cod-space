"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 flex justify-center"><p className="text-muted-foreground">Cargando...</p></div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const router = useRouter();
  const supabase = createClient();

  async function checkRateLimit(identifier: string, action: string): Promise<boolean> {
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_identifier: identifier,
      p_action: action,
      p_max_attempts: MAX_ATTEMPTS,
      p_window_minutes: WINDOW_MINUTES,
    });
    if (error) return true;
    return data as boolean;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const allowed = await checkRateLimit(email, "otp_send");
    if (!allowed) {
      toast.error(`Demasiados intentos. Espera ${WINDOW_MINUTES} minutos.`);
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    });

    setLoading(false);

    if (error) {
      toast.error("Error al enviar el código. Intenta nuevamente.");
      return;
    }

    setSent(true);
    toast.success("Código enviado a tu email");
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();

    const allowed = await checkRateLimit(email, "otp_verify");
    if (!allowed) {
      toast.error(`Demasiados intentos. Espera ${WINDOW_MINUTES} minutos.`);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    setLoading(false);

    if (error) {
      toast.error("Código inválido. Intenta nuevamente.");
      return;
    }

    toast.success("Sesión iniciada");
    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="container mx-auto px-4 py-20 flex justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-6">
          <div className="text-center">
            <Mail className="h-12 w-12 mx-auto text-primary mb-4" />
            <h1 className="text-2xl font-bold">Iniciar Sesión</h1>
            <p className="text-sm text-muted-foreground mt-2">
              {sent
                ? "Ingresa el código que enviamos a tu email"
                : "Te enviaremos un código de acceso a tu email"}
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Enviar Código"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <Label htmlFor="token">Código de verificación</Label>
                <Input
                  id="token"
                  name="token"
                  type="text"
                  placeholder="12345678"
                  value={token}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    if (v.length <= 8) setToken(v);
                  }}
                  maxLength={8}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  className="text-center text-2xl tracking-widest"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verificando..." : "Verificar Código"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setSent(false)}
              >
                Cambiar email
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
