"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { History } from "lucide-react";
import type { AccessLog } from "@/lib/types";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-CL", { dateStyle: "medium", timeStyle: "medium" }).format(new Date(date));
}

export function UserAccessHistory({ userId, email }: { userId: string; email: string }) {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function loadLogs() {
    setLoading(true);
    const { data } = await supabase
      .from("access_logs")
      .select("*")
      .eq("user_id", userId)
      .order("signed_in_at", { ascending: false })
      .limit(20);
    setLogs((data as AccessLog[]) ?? []);
    setLoading(false);
  }

  return (
    <Dialog>
      <DialogTrigger
        onClick={loadLogs}
        className="inline-flex shrink-0 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap transition-all hover:bg-muted hover:text-foreground h-7 gap-1 px-2.5 cursor-pointer"
      >
        <History className="h-4 w-4 mr-1" /> Ver
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Historial de acceso — {email}</DialogTitle>
        </DialogHeader>
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Cargando...</p>
          ) : logs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Sin registros de acceso</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Fecha</th>
                  <th className="text-left p-2 font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b last:border-0">
                    <td className="p-2">{formatDate(log.signed_in_at)}</td>
                    <td className="p-2 text-muted-foreground">{log.ip_address ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
