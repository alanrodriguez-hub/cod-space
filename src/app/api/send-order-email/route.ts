import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(price);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, userEmail, userName, paymentMethod, total, items } = body;

    if (!orderId || !userEmail) {
      return NextResponse.json({ error: "Faltan parámetros requeridos" }, { status: 400 });
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASSWORD;
    const smtpFrom = process.env.SMTP_FROM || "no-reply@codspace.cl";

    // Generar el desglose de productos en HTML
    const itemsHtml = items.map((item: { name: string; brand?: string; quantity: number; price: number }) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 8px; text-align: left; font-size: 14px; color: #334155;">
          <strong>${item.name}</strong><br>
          <span style="font-size: 12px; color: #64748b;">Marca: ${item.brand || "—"}</span>
        </td>
        <td style="padding: 12px 8px; text-align: center; font-size: 14px; color: #334155;">${item.quantity}</td>
        <td style="padding: 12px 8px; text-align: right; font-size: 14px; color: #334155;">${formatPrice(item.price)}</td>
        <td style="padding: 12px 8px; text-align: right; font-size: 14px; font-weight: bold; color: #0f172a;">${formatPrice(item.price * item.quantity)}</td>
      </tr>
    `).join("");

    // Instrucciones específicas del método de pago
    let paymentInstructions = "";
    if (paymentMethod === "transfer") {
      paymentInstructions = `
        <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; margin: 24px 0; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #1e293b; font-size: 16px;">Instrucciones para Transferencia Bancaria:</h3>
          <p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>Nombre Empresa:</strong> ${process.env.NEXT_PUBLIC_TRANSFER_COMPANY_NAME || "Importadora y Distribuidora CodSpace Ltda."}</p>
          <p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>RUT Empresa:</strong> ${process.env.NEXT_PUBLIC_TRANSFER_COMPANY_RUT || "76.123.456-K"}</p>
          <p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>Tipo de Cuenta:</strong> ${process.env.NEXT_PUBLIC_TRANSFER_ACCOUNT_TYPE || "Cuenta Corriente"}</p>
          <p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>Número de Cuenta:</strong> ${process.env.NEXT_PUBLIC_TRANSFER_ACCOUNT_NUMBER || "12-34567-89"}</p>
          <p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>Email de Envío:</strong> ${process.env.NEXT_PUBLIC_TRANSFER_EMAIL || "pagos@codspace.cl"}</p>
          <p style="margin-top: 12px; margin-bottom: 0; font-size: 12px; color: #64748b; font-style: italic;">
            * Por favor, envía el comprobante de transferencia a nuestro correo indicando tu ID de pedido <strong>#${orderId.slice(0, 8)}</strong> en el asunto.
          </p>
        </div>
      `;
    } else {
      paymentInstructions = `
        <div style="background-color: #fcf8e3; border-left: 4px solid #f0ad4e; padding: 16px; margin: 24px 0; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #8a6d3b; font-size: 16px;">Pago en Efectivo:</h3>
          <p style="margin: 4px 0; font-size: 14px; color: #8a6d3b;">Deberás realizar el pago en efectivo directamente al retirar tu repuesto en tienda o al recibir tu entrega a domicilio.</p>
        </div>
      `;
    }

    const htmlEmail = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Confirmación de Pedido - CodSpace</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 20px; margin: 0;">
          <div style="max-width: 600px; background-color: #ffffff; border-radius: 8px; margin: 0 auto; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <!-- Header -->
            <div style="background-color: #2563eb; padding: 32px 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: -0.025em;">¡Gracias por tu Pedido!</h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #bfdbfe;">ID de Pedido: #${orderId.slice(0, 8)}</p>
            </div>

            <!-- Content -->
            <div style="padding: 32px 24px;">
              <p style="margin-top: 0; font-size: 16px; color: #334155; line-height: 1.5;">Hola <strong>${userName}</strong>,</p>
              <p style="font-size: 16px; color: #334155; line-height: 1.5;">Tu pedido se ha recibido exitosamente. A continuación verás el resumen detallado y los próximos pasos para completar la entrega.</p>

              <!-- Payment Instructions -->
              ${paymentInstructions}

              <!-- Items Table -->
              <h3 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 32px;">Resumen del Pedido</h3>
              <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
                <thead>
                  <tr style="background-color: #f8fafc; border-bottom: 1px solid #cbd5e1;">
                    <th style="padding: 10px 8px; text-align: left; font-size: 13px; color: #64748b; font-weight: 600;">Producto</th>
                    <th style="padding: 10px 8px; text-align: center; font-size: 13px; color: #64748b; font-weight: 600; width: 10%;">Cant.</th>
                    <th style="padding: 10px 8px; text-align: right; font-size: 13px; color: #64748b; font-weight: 600; width: 20%;">Precio</th>
                    <th style="padding: 10px 8px; text-align: right; font-size: 13px; color: #64748b; font-weight: 600; width: 25%;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Total Card -->
              <div style="margin-top: 24px; padding: 16px; background-color: #f8fafc; border-radius: 4px; text-align: right;">
                <span style="font-size: 14px; color: #64748b; font-weight: 500; margin-right: 12px;">Total del Pedido:</span>
                <span style="font-size: 20px; color: #2563eb; font-weight: 800;">${formatPrice(total)}</span>
              </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px; text-align: center; font-size: 12px; color: #64748b;">
              <p style="margin: 0 0 8px;"><strong>CodSpace Autopartes y Repuestos</strong></p>
              <p style="margin: 0;">Este es un correo automático, por favor no respondas directamente.</p>
              <p style="margin: 12px 0 0; font-size: 11px; color: #94a3b8;">&copy; ${new Date().getFullYear()} CodSpace. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Si hay credenciales de SMTP, procedemos a enviar el correo real
    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(smtpPort || 587),
        secure: Number(smtpPort) === 465, // true para puerto 465, false para otros
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: smtpFrom,
        to: userEmail,
        subject: `Confirmación de Pedido #${orderId.slice(0, 8)} - CodSpace`,
        html: htmlEmail,
      });

      return NextResponse.json({ success: true, message: "Correo real enviado exitosamente" });
    } else {
      // Fallback: Modo Simulación (Logs en la consola del servidor)
      console.log("====================================================================");
      console.log(`[SIMULACIÓN EMAIL] Pedido #${orderId.slice(0, 8)}`);
      console.log(`Enviado a: ${userName} <${userEmail}>`);
      console.log(`Método de Pago: ${paymentMethod}`);
      console.log(`Monto Total: ${formatPrice(total)}`);
      console.log("====================================================================");

      return NextResponse.json({ 
        success: true, 
        message: "Simulación exitosa. Las credenciales SMTP no están configuradas en el .env",
        simulated: true 
      });
    }
  } catch (error) {
    console.error("Error en send-order-email:", error);
    return NextResponse.json({ error: "Error interno al enviar el correo" }, { status: 500 });
  }
}
