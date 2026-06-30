import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import type { QuoteResponseItem } from "@/lib/types";

async function getSettingsMap() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("key, value");
  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    map[row.key] = row.value;
  }
  return map;
}

function generatePdfBuffer(
  quote: { id: string; name: string; email: string; phone?: string | null },
  items: QuoteResponseItem[],
  s: Record<string, string>
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const siteName = s.site_name || "Spartaco Repuestos";
    const contactPhone = s.contact_phone || "";
    const contactEmail = s.contact_email || "";
    const contactAddress = s.contact_address || "";

    doc.fontSize(22).font("Helvetica-Bold").text(siteName, 50, 50);
    doc.fontSize(9).font("Helvetica").fillColor("#64748b");
    if (contactAddress) doc.text(contactAddress, 50, 80, { width: 250 });
    if (contactPhone) doc.text(`Tel: ${contactPhone}`, 50, doc.y + 2);
    if (contactEmail) doc.text(`Email: ${contactEmail}`, 50, doc.y + 2);
    doc.fillColor("#000");

    doc.fontSize(26).font("Helvetica-Bold").fillColor("#2563eb");
    doc.text("COTIZACIÓN", 330, 50, { align: "right" });
    doc.fillColor("#000");
    doc.fontSize(10).font("Helvetica").fillColor("#64748b");
    doc.text(`N° ${quote.id.slice(0, 8).toUpperCase()}`, 330, 78, { align: "right" });
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-CL")}`, 330, 92, { align: "right" });
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    doc.text(`Válida hasta: ${expiry.toLocaleDateString("es-CL")}`, 330, 106, { align: "right" });
    doc.fillColor("#000");

    doc.fontSize(11).font("Helvetica-Bold").text("Cliente:", 50, 150);
    doc.fontSize(10).font("Helvetica").fillColor("#334155");
    doc.text(quote.name, 50, 166);
    doc.text(quote.email, 50, 180);
    if (quote.phone) doc.text(quote.phone, 50, 194);
    doc.fillColor("#000");

    let y = 210;
    const colX = [50, 270, 320, 430];
    const colW = [220, 50, 110, 115];
    const tableW = colW.reduce((a, b) => a + b, 0);
    const tableEnd = colX[0] + tableW;

    doc.rect(colX[0], y, tableW, 20).fill("#f8fafc").fillColor("#fff");
    doc.fillColor("#64748b").fontSize(9).font("Helvetica-Bold");
    doc.text("Producto", colX[0], y + 5, { width: colW[0] });
    doc.text("Cant.", colX[1], y + 5, { width: colW[1], align: "center" });
    doc.text("P. Unit.", colX[2], y + 5, { width: colW[2], align: "right" });
    doc.text("Total", colX[3], y + 5, { width: colW[3], align: "right" });
    doc.fillColor("#000");

    y += 25;
    let total = 0;
    for (const item of items) {
      const lineTotal = item.quantity * item.unit_price;
      total += lineTotal;
      doc.fontSize(9).font("Helvetica");
      doc.text(item.product_name, colX[0], y, { width: colW[0], lineBreak: false });
      doc.text(String(item.quantity), colX[1], y, { width: colW[1], align: "center", lineBreak: false });
      doc.text(`$${item.unit_price.toLocaleString("es-CL")}`, colX[2], y, { width: colW[2], align: "right", lineBreak: false });
      doc.text(`$${lineTotal.toLocaleString("es-CL")}`, colX[3], y, { width: colW[3], align: "right", lineBreak: false });
      y += 24;
    }

    doc.moveTo(colX[0], y).lineTo(tableEnd, y).stroke("#e2e8f0");
    y += 12;
    doc.fontSize(12).font("Helvetica-Bold");
    doc.text("TOTAL", colX[2], y, { width: colW[2], align: "right" });
    doc.text(`$${total.toLocaleString("es-CL")}`, colX[3], y, { width: colW[3], align: "right" });

    doc.fontSize(8).font("Helvetica").fillColor("#94a3b8");
    doc.text(
      `Esta cotización es válida por 7 días corridos, hasta el ${expiry.toLocaleDateString("es-CL")}. ` +
        "Los precios están sujetos a disponibilidad de stock.",
      50,
      700,
      { align: "center", width: 500 }
    );

    doc.end();
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const rl = await checkRateLimit(request, "admin_quote_send", 30, 15);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Demasiadas solicitudes. Intenta más tarde." }, { status: 429 });
    }

    const { id } = await params;
    const body = await request.json();
    const { message } = body;

    const supabase = auth.supabase;
    const { data: quote } = await supabase.from("quotes").select("*").eq("id", id).single();
    if (!quote) {
      return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 });
    }

    const { data: items } = await supabase
      .from("quote_items")
      .select("*")
      .eq("quote_id", id)
      .order("created_at");

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Agrega productos antes de enviar" }, { status: 400 });
    }

    const s = await getSettingsMap();
    const smtpHost = process.env.SMTP_HOST || s.smtp_host;
    const smtpPort = process.env.SMTP_PORT || s.smtp_port;
    const smtpUser = process.env.SMTP_USER || s.smtp_user;
    const smtpPass = process.env.SMTP_PASSWORD || s.smtp_password;
    const smtpFrom = process.env.SMTP_FROM || s.smtp_from || "no-reply@codspace.cl";
    const siteName = s.site_name || "Spartaco Repuestos";

    if (!smtpHost || !smtpUser || !smtpPass) {
      return NextResponse.json({ error: "SMTP no configurado" }, { status: 500 });
    }

    const pdfBuffer = await generatePdfBuffer(quote, items, s);

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort || 587),
      secure: Number(smtpPort) === 465,
      auth: { user: smtpUser, pass: smtpPass },
      tls: { rejectUnauthorized: false },
    });

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);

    const html = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: sans-serif; background: #f1f5f9; padding: 20px;">
          <div style="max-width: 560px; background: #fff; border-radius: 8px; margin: 0 auto; overflow: hidden;">
            <div style="background: #2563eb; padding: 24px; text-align: center; color: #fff;">
              <h1 style="margin:0; font-size: 20px;">Cotización ${siteName}</h1>
            </div>
            <div style="padding: 24px;">
              <p style="margin-top:0; font-size: 15px; color: #334155;">Hola <strong>${quote.name}</strong>,</p>
              <p style="font-size: 14px; color: #475569; line-height: 1.5;">
                Adjunto encontrarás tu cotización solicitada. 
                <strong>Válida por 7 días, hasta el ${expiry.toLocaleDateString("es-CL")}.</strong>
              </p>
              ${message ? `<div style="background: #f8fafc; padding: 16px; border-radius: 6px; margin: 16px 0;"><p style="margin:0; font-size: 14px; color: #334155; white-space: pre-wrap;">${message}</p></div>` : ""}
              <p style="font-size: 13px; color: #ef4444; font-weight: 500;">
                * Los precios están sujetos a disponibilidad de stock.
              </p>
              <p style="font-size: 13px; color: #64748b;">
                Para concretar tu compra o resolver dudas, responde este correo o contáctanos.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: smtpFrom,
      to: quote.email,
      subject: `Cotización ${siteName} - N° ${id.slice(0, 8).toUpperCase()}`,
      html,
      attachments: [
        {
          filename: `cotizacion-${id.slice(0, 8)}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al enviar cotización por email:", error);
    return NextResponse.json({ error: "Error al enviar email" }, { status: 500 });
  }
}
