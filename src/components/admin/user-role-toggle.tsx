"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Shield, ShieldOff } from "lucide-react";

export function UserRoleToggle({ userId, currentRole, email }: { userId: string; currentRole: string; email: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleToggle() {
    const newRole = currentRole === "admin" ? "customer" : "admin";
    const action = newRole === "admin" ? "otorgar admin a" : "quitar admin de";

    if (!confirm(`¿Estás seguro de ${action} ${email}?`)) return;

    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);
    setLoading(false);

    if (error) {
      toast.error("Error al cambiar el rol");
      return;
    }

    toast.success(`Rol actualizado a ${newRole === "admin" ? "Admin" : "Cliente"}`);
    router.refresh();
  }

  return (
    <Button variant={currentRole === "admin" ? "destructive" : "secondary"} size="sm" onClick={handleToggle} disabled={loading}>
      {currentRole === "admin" ? (
        <><ShieldOff className="h-4 w-4 mr-1" /> Quitar Admin</>
      ) : (
        <><Shield className="h-4 w-4 mr-1" /> Hacer Admin</>
      )}
    </Button>
  );
}
