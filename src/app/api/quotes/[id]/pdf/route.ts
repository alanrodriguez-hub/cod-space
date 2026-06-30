import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import PDFDocument from "pdfkit";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
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

    const { data: settings } = await supabase
      .from("site_settings")
      .select("key, value");
    const s: Record<string, string> = {};
    for (const row of settings ?? []) {
      s[row.key] = row.value;
    }

    const siteName = s.site_name || "Spartaco Repuestos";
    const contactPhone = s.contact_phone || "";
    const contactEmail = s.contact_email || "";
    const contactAddress = s.contact_address || "";

    const doc = new PDFDocument({ margin: 50, size: "A4" });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));

    function drawHeader() {
      doc.fontSize(22).font("Helvetica-Bold").text(siteName, 50, 50);
      doc.fontSize(9).font("Helvetica").fillColor("#64748b");
      if (contactAddress) doc.text(contactAddress, 50, 80, { width: 250 });
      if (contactPhone) doc.text(`Tel: ${contactPhone}`, 50, doc.y + 2);
      if (contactEmail) doc.text(`Email: ${contactEmail}`, 50, doc.y + 2);
      doc.fillColor("#000");
    }

    function drawTitle() {
      doc.fontSize(26).font("Helvetica-Bold").fillColor("#2563eb");
      doc.text("COTIZACIÓN", 330, 50, { align: "right" });
      doc.fillColor("#000");
      doc.fontSize(10).font("Helvetica").fillColor("#64748b");
      doc.text(`N° ${id.slice(0, 8).toUpperCase()}`, 330, 78, { align: "right" });
      doc.text(`Fecha: ${new Date().toLocaleDateString("es-CL")}`, 330, 92, { align: "right" });

      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 7);
      doc.text(`Válida hasta: ${expiry.toLocaleDateString("es-CL")}`, 330, 106, { align: "right" });
      doc.fillColor("#000");
    }

    function drawClient() {
      const y = 150;
      doc.fontSize(11).font("Helvetica-Bold").text("Cliente:", 50, y);
      doc.fontSize(10).font("Helvetica").fillColor("#334155");
      doc.text(quote.name, 50, y + 16);
      doc.text(quote.email, 50, y + 30);
      if (quote.phone) doc.text(quote.phone, 50, y + 44);
      doc.fillColor("#000");
    }

    function drawItems() {
      const itemsData = items || [];
      let y = 210;

      const colX = [50, 270, 320, 430];
      const colW = [220, 50, 110, 115];
      const tableW = colW.reduce((a, b) => a + b, 0);
      const tableEnd = colX[0] + tableW;

      doc.rect(50, y, tableW, 20).fill("#f8fafc").fillColor("#fff");

      doc.fillColor("#64748b").fontSize(9).font("Helvetica-Bold");
      doc.text("Producto", colX[0], y + 5, { width: colW[0] });
      doc.text("Cant.", colX[1], y + 5, { width: colW[1], align: "center" });
      doc.text("P. Unit.", colX[2], y + 5, { width: colW[2], align: "right" });
      doc.text("Total", colX[3], y + 5, { width: colW[3], align: "right" });
      doc.fillColor("#000");

      y += 25;
      let rowCount = 0;
      let total = 0;

      for (const item of itemsData) {
        const lineTotal = item.quantity * item.unit_price;
        total += lineTotal;

        if (rowCount % 2 === 0) {
          doc.rect(colX[0], y - 4, tableW, 24).fill("#fafafa").fillColor("#000");
        }

        doc.fontSize(9).font("Helvetica");
        doc.text(item.product_name, colX[0], y, { width: colW[0], lineBreak: false });
        doc.text(String(item.quantity), colX[1], y, { width: colW[1], align: "center", lineBreak: false });
        doc.text(
          `$${item.unit_price.toLocaleString("es-CL")}`,
          colX[2],
          y,
          { width: colW[2], align: "right", lineBreak: false }
        );
        doc.text(
          `$${lineTotal.toLocaleString("es-CL")}`,
          colX[3],
          y,
          { width: colW[3], align: "right", lineBreak: false }
        );

        y += 24;
        rowCount++;

        if (y > 650) {
          doc.addPage();
          y = 50;
        }
      }

      doc.moveTo(colX[0], y).lineTo(tableEnd, y).stroke("#e2e8f0");
      y += 12;

      doc.fontSize(12).font("Helvetica-Bold");
      doc.text("TOTAL", colX[2], y, { width: colW[2], align: "right" });
      doc.text(
        `$${total.toLocaleString("es-CL")}`,
        colX[3],
        y,
        { width: colW[3], align: "right" }
      );
    }

    function drawFooter() {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 7);

      doc.fontSize(8).font("Helvetica").fillColor("#94a3b8");
      doc.text(
        `Esta cotización es válida por 7 días corridos, hasta el ${expiry.toLocaleDateString("es-CL")}. ` +
          "Los precios están sujetos a disponibilidad de stock. " +
          "Para confirmar tu compra, contáctanos a través de nuestro sitio web o llámanos.",
        50,
        700,
        { align: "center", width: 500 }
      );
    }

    drawHeader();
    drawTitle();
    drawClient();
    drawItems();
    drawFooter();

    doc.end();

    return new Promise<NextResponse>((resolve) => {
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(
          new NextResponse(pdfBuffer, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="cotizacion-${id.slice(0, 8)}.pdf"`,
            },
          })
        );
      });
    });
  } catch (error) {
    console.error("Error generando PDF:", error);
    return NextResponse.json({ error: "Error generando PDF" }, { status: 500 });
  }
}
