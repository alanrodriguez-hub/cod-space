"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserRoleToggle } from "@/components/admin/user-role-toggle";
import { UserAccessHistory } from "@/components/admin/user-access-history";
import { Eye, Calendar, Shield, MapPin, Phone, Fingerprint, User } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
  phone: string | null;
  rut: string | null;
  address_street: string | null;
  address_city: string | null;
  address_region: string | null;
  address_zip: string | null;
  privacy_accepted_at: string | null;
  last_sign_in_at: string | null;
  created_at: string;
}

function formatDate(date: string | null) {
  if (!date) return "Nunca";
  return new Intl.DateTimeFormat("es-CL", { dateStyle: "long", timeStyle: "short" }).format(new Date(date));
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-muted-foreground shrink-0 mt-0.5">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm break-words">{value}</p>
      </div>
    </div>
  );
}

export function UserDetailDialog({ profile }: { profile: Profile }) {
  return (
    <Dialog>
      <DialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap transition-all hover:bg-muted hover:text-foreground h-7 gap-1 px-2.5 cursor-pointer">
        <Eye className="h-4 w-4 mr-1" /> Detalle
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">{profile.full_name || "Usuario"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow
              icon={<User className="h-4 w-4" />}
              label="Correo electrónico"
              value={profile.email}
            />
            <InfoRow
              icon={<Shield className="h-4 w-4" />}
              label="Rol"
              value={
                <Badge variant={profile.role === "admin" ? "default" : "secondary"}>
                  {profile.role === "admin" ? "Administrador" : "Cliente"}
                </Badge>
              }
            />
          </div>

          {(profile.phone || profile.rut) && <Separator />}

          {(profile.phone || profile.rut) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.phone && (
                <InfoRow
                  icon={<Phone className="h-4 w-4" />}
                  label="Teléfono"
                  value={profile.phone}
                />
              )}
              {profile.rut && (
                <InfoRow
                  icon={<Fingerprint className="h-4 w-4" />}
                  label="RUT"
                  value={profile.rut}
                />
              )}
            </div>
          )}

          {(profile.address_street || profile.address_city) && <Separator />}

          {(profile.address_street || profile.address_city) && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Dirección
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.address_street && (
                  <InfoRow
                    icon={<MapPin className="h-4 w-4" />}
                    label="Calle"
                    value={profile.address_street}
                  />
                )}
                {profile.address_city && (
                  <InfoRow
                    icon={<MapPin className="h-4 w-4" />}
                    label="Ciudad"
                    value={profile.address_city}
                  />
                )}
                {profile.address_region && (
                  <InfoRow
                    icon={<MapPin className="h-4 w-4" />}
                    label="Región"
                    value={profile.address_region}
                  />
                )}
                {profile.address_zip && (
                  <InfoRow
                    icon={<MapPin className="h-4 w-4" />}
                    label="Código Postal"
                    value={profile.address_zip}
                  />
                )}
              </div>
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow
              icon={<Calendar className="h-4 w-4" />}
              label="Registrado"
              value={formatDate(profile.created_at)}
            />
            <InfoRow
              icon={<Calendar className="h-4 w-4" />}
              label="Último acceso"
              value={formatDate(profile.last_sign_in_at)}
            />
            <InfoRow
              icon={<Shield className="h-4 w-4" />}
              label="Privacidad"
              value={
                profile.privacy_accepted_at
                  ? `Aceptada el ${formatDate(profile.privacy_accepted_at)}`
                  : "Pendiente"
              }
            />
          </div>

          <Separator />

          <div className="flex flex-wrap gap-2">
            <UserRoleToggle userId={profile.id} currentRole={profile.role} email={profile.email} />
            <UserAccessHistory userId={profile.id} email={profile.email} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
