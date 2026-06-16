import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserRoleToggle } from "@/components/admin/user-role-toggle";
import { UserAccessHistory } from "@/components/admin/user-access-history";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>RUT</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Privacidad</TableHead>
                <TableHead>Último acceso</TableHead>
                <TableHead>Registrado</TableHead>
                <TableHead>Historial</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles?.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell>{profile.email}</TableCell>
                  <TableCell>{profile.full_name || <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell>{profile.phone || <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell>{profile.rut || <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell className="max-w-48">
                    {profile.address_street ? (
                      <span className="text-xs">
                        {profile.address_street}, {profile.address_city}
                        {profile.address_region ? `, ${profile.address_region}` : ""}
                        {profile.address_zip ? ` (${profile.address_zip})` : ""}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={profile.role === "admin" ? "default" : "secondary"}>
                      {profile.role === "admin" ? "Admin" : "Cliente"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {profile.privacy_accepted_at ? (
                      <Badge variant="outline" className="text-xs">Aceptada</Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">Pendiente</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(profile.last_sign_in_at)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(profile.created_at)}</TableCell>
                  <TableCell>
                    <UserAccessHistory userId={profile.id} email={profile.email} />
                  </TableCell>
                  <TableCell>
                    <UserRoleToggle userId={profile.id} currentRole={profile.role} email={profile.email} />
                  </TableCell>
                </TableRow>
              ))}
              {(!profiles || profiles.length === 0) && (
                <TableRow>
                  <TableCell colSpan={11} className="h-24 text-center text-muted-foreground">
                    No hay usuarios registrados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
