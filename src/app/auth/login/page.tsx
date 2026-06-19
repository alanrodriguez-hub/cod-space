"use client";

import { Suspense, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { emailSchema } from "@/lib/validations";
import { toast } from "sonner";
import { Mail, KeyRound, Loader2, Send, ArrowLeft, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-[calc(100vh-16rem)]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm font-medium">Cargando...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const router = useRouter();
  const supabase = createClient();

  const validateEmail = useCallback((value: string) => {
    const result = emailSchema.safeParse(value);
    if (!result.success) {
      const issue = result.error.issues[0];
      return issue.message;
    }
    return null;
  }, []);

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

  function handleEmailChange(value: string) {
    setEmail(value);
    if (emailTouched) {
      setEmailError(validateEmail(value));
    }
  }

  function handleEmailBlur() {
    setEmailTouched(true);
    setEmailError(validateEmail(email));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const error = validateEmail(email);
    setEmailTouched(true);
    setEmailError(error);
    if (error) return;

    const allowed = await checkRateLimit(email, "otp_send");
    if (!allowed) {
      toast.error(`Demasiados intentos. Espera ${WINDOW_MINUTES} minutos.`);
      return;
    }

    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    });

    setLoading(false);

    if (authError) {
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
    <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-[calc(100vh-16rem)]">
      <Card className="w-full max-w-md shadow-lg border-muted/50 overflow-hidden transition-all duration-300">
        <CardHeader className="space-y-1 pt-8">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4 text-primary ring-8 ring-primary/5 transition-all duration-300">
              {sent ? (
                <KeyRound className="h-8 w-8 animate-pulse text-primary" />
              ) : (
                <Mail className="h-8 w-8 text-primary" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center tracking-tight">
            {sent ? "Ingresar Código" : "Iniciar Sesión"}
          </CardTitle>
          <CardDescription className="text-center text-sm text-muted-foreground pt-1.5 px-2">
            {sent ? (
              <span>
                Hemos enviado un código de acceso de un solo uso a{" "}
                <span className="font-semibold text-foreground break-all">{email}</span>
              </span>
            ) : (
              "Ingresa tu email y te enviaremos un código para iniciar sesión al instante sin contraseña."
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pb-8">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={handleEmailBlur}
                  required
                  className="h-10 text-base"
                  disabled={loading}
                  autoComplete="email"
                  aria-invalid={emailTouched && !!emailError}
                  aria-describedby={emailError ? "email-error" : undefined}
                />
                {emailTouched && emailError && (
                  <p id="email-error" className="flex items-center gap-1.5 text-xs text-destructive" role="alert">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {emailError}
                  </p>
                )}
              </div>
              <Button type="submit" size="lg" className="w-full cursor-pointer h-10 font-semibold" disabled={loading || (emailTouched && !!emailError)}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Código
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Código de Verificación
                </Label>
                <Input
                  id="token"
                  name="token"
                  type="text"
                  placeholder="••••••••"
                  value={token}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    if (v.length <= 8) setToken(v);
                  }}
                  maxLength={8}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  className="text-center text-2xl font-mono tracking-[0.4em] h-12 placeholder:opacity-40"
                  disabled={loading}
                  autoFocus
                />
                <p className="text-[11px] text-muted-foreground text-center">
                  El código tiene usualmente 6 u 8 dígitos y expira rápidamente.
                </p>
              </div>
              <Button type="submit" size="lg" className="w-full cursor-pointer h-10 font-semibold" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Verificar e Iniciar Sesión"
                )}
              </Button>
            </form>
          )}
        </CardContent>

        {sent && (
          <CardFooter className="flex justify-center border-t bg-muted/20 px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground hover:bg-transparent p-0 cursor-pointer h-auto"
              onClick={() => {
                setSent(false);
                setToken("");
              }}
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              ¿No es tu correo? Cambiar email
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
