import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserRoleToggle } from "@/components/admin/user-role-toggle";
import { UserAccessHistory } from "@/components/admin/user-access-history";

function formatDate(date: string | null) {
  if (!date) return "Nunca";
  return new Intl.DateTimeFormat("es-CL", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date));
}

export default async function AdminUsuariosPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Rol</th>
                  <th className="text-left p-3 font-medium">Último acceso</th>
                  <th className="text-left p-3 font-medium">Registrado</th>
                  <th className="text-left p-3 font-medium">Historial</th>
                  <th className="text-left p-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {profiles?.map((profile) => (
                  <tr key={profile.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3">{profile.email}</td>
                    <td className="p-3">
                      <Badge variant={profile.role === "admin" ? "default" : "secondary"}>
                        {profile.role === "admin" ? "Admin" : "Cliente"}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">{formatDate(profile.last_sign_in_at)}</td>
                    <td className="p-3 text-muted-foreground">{formatDate(profile.created_at)}</td>
                    <td className="p-3">
                      <UserAccessHistory userId={profile.id} email={profile.email} />
                    </td>
                    <td className="p-3">
                      <UserRoleToggle userId={profile.id} currentRole={profile.role} email={profile.email} />
                    </td>
                  </tr>
                ))}
                {(!profiles || profiles.length === 0) && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-muted-foreground">
                      No hay usuarios registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
