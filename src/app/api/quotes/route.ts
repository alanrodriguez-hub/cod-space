import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import nodemailer from "nodemailer";
import type { QuoteItem } from "@/lib/types";

async function getSettingsMap() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("key, value");
  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    map[row.key] = row.value;
  }
  return map;
}

function itemsHtml(items: QuoteItem[]) {
  return items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 10px 8px; font-size: 14px; color: #334155;">
        ${item.product_name}
        ${item.product_id ? `<br><span style="font-size: 11px; color: #94a3b8;">ID: ${item.product_id}</span>` : ""}
      </td>
      <td style="padding: 10px 8px; text-align: center; font-size: 14px; color: #334155;">${item.quantity}</td>
    </tr>`
    )
    .join("");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, items, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Nombre, email y mensaje son requeridos" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Debes agregar al menos un producto" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();

    const { data: quote, error } = await supabase
      .from("quotes")
      .insert({
        name,
        email,
        phone: phone || null,
        user_id: user?.user?.id || null,
        items,
        message,
      })
      .select()
      .single();

    if (error) {
      console.error("Error al guardar cotización:", error);
      return NextResponse.json({ error: "Error al guardar la cotización" }, { status: 500 });
    }

    const s = await getSettingsMap();
    const smtpHost = s.smtp_host;
    const smtpPort = s.smtp_port;
    const smtpUser = s.smtp_user;
    const smtpPass = s.smtp_password;
    const smtpFrom = s.smtp_from || "no-reply@codspace.cl";
    const adminEmail = s.contact_email || "";
    const siteName = s.site_name || "Spartaco Repuestos";

    if (smtpHost && smtpUser && smtpPass && adminEmail) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(smtpPort || 587),
        secure: Number(smtpPort) === 465,
        auth: { user: smtpUser, pass: smtpPass },
        tls: { rejectUnauthorized: false },
      });

      await transporter.sendMail({
        from: smtpFrom,
        to: adminEmail,
        subject: `Nueva Cotización de ${name} - ${siteName}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head><meta charset="utf-8"><title>Nueva Cotización</title></head>
            <body style="font-family: sans-serif; background: #f1f5f9; padding: 20px;">
              <div style="max-width: 560px; background: #fff; border-radius: 8px; margin: 0 auto; overflow: hidden;">
                <div style="background: #2563eb; padding: 24px; text-align: center; color: #fff;">
                  <h1 style="margin:0; font-size: 20px;">Nueva Cotización</h1>
                </div>
                <div style="padding: 24px;">
                  <table style="width:100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; color: #64748b;">Nombre</td><td style="padding: 8px 0; font-weight: 600;">${name}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #2563eb;">${email}</a></td></tr>
                    ${phone ? `<tr><td style="padding: 8px 0; color: #64748b;">Teléfono</td><td style="padding: 8px 0; font-weight: 600;">${phone}</td></tr>` : ""}
                  </table>

                  <h3 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 24px;">Productos</h3>
                  <table style="width:100%; border-collapse: collapse; margin-top: 8px;">
                    <thead>
                      <tr style="background: #f8fafc; border-bottom: 1px solid #cbd5e1;">
                        <th style="padding: 8px; text-align: left; font-size: 13px; color: #64748b;">Producto</th>
                        <th style="padding: 8px; text-align: center; font-size: 13px; color: #64748b;">Cant.</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml(items)}
                    </tbody>
                  </table>

                  <div style="margin-top: 16px; padding: 16px; background: #f8fafc; border-radius: 6px;">
                    <p style="margin: 0 0 8px; font-weight: 600; color: #1e293b;">Mensaje:</p>
                    <p style="margin: 0; color: #475569; white-space: pre-wrap;">${message}</p>
                  </div>
                  <p style="margin-top: 24px; text-align: center;">
                    <a href="${s.site_url ? `https://${s.site_url}` : ""}/admin/cotizaciones" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600;">
                      Ver en Admin
                    </a>
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      });
    } else {
      console.log(`[SIMULACIÓN EMAIL] Nueva cotización de ${name} <${email}>`);
    }

    return NextResponse.json({ success: true, quote });
  } catch (error) {
    console.error("Error en POST /api/quotes:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
