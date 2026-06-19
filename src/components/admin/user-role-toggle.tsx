"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Shield, ShieldOff } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

export function UserRoleToggle({ userId, currentRole, email }: { userId: string; currentRole: string; email: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const newRole = currentRole === "admin" ? "customer" : "admin";
  const isGranting = newRole === "admin";

  async function handleToggle() {
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);
    setLoading(false);

    if (error) {
      toast.error("Error al cambiar rol", { description: "No se pudo actualizar el rol del usuario." });
      setOpen(false);
      return;
    }

    toast.success("Rol actualizado", { description: `${email} ahora es ${isGranting ? "Administrador" : "Cliente"}.` });
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button variant={currentRole === "admin" ? "destructive" : "secondary"} size="sm" onClick={() => setOpen(true)} disabled={loading}>
        {currentRole === "admin" ? (
          <><ShieldOff className="h-4 w-4 mr-1" /> Quitar Admin</>
        ) : (
          <><Shield className="h-4 w-4 mr-1" /> Hacer Admin</>
        )}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={isGranting ? "Otorgar permisos de admin" : "Quitar permisos de admin"}
        description={isGranting
          ? `¿Otorgar permisos de administrador a ${email}? Tendrá acceso completo al panel de administración.`
          : `¿Quitar permisos de administrador a ${email}? Perderá acceso al panel de administración.`
        }
        confirmLabel={isGranting ? "Otorgar admin" : "Quitar admin"}
        variant={isGranting ? "default" : "destructive"}
        loading={loading}
        onConfirm={handleToggle}
      />
    </>
  );
}
