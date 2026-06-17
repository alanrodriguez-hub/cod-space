import { Card, CardContent } from "@/components/ui/card";
import { getSiteName } from "@/lib/data-cache";

export async function generateMetadata() {
  const siteName = await getSiteName();
  return { title: `${siteName} - Política de Privacidad` };
}

export default async function PrivacidadPage() {
  const siteName = await getSiteName();
  const companyName = process.env.NEXT_PUBLIC_TRANSFER_COMPANY_NAME || siteName;
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "privacidad@autorepuestos.cl";
  const contactAddress = process.env.NEXT_PUBLIC_CONTACT_ADDRESS;
  const mapsUrl = process.env.NEXT_PUBLIC_MAPS_URL;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Política de Privacidad y Tratamiento de Datos Personales</h1>

      <Card>
        <CardContent className="p-6 prose prose-sm dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Última actualización: junio 2026
          </p>

          <section>
            <h2 className="text-xl font-semibold mt-0">1. Responsable del Tratamiento</h2>
            <p>
              {companyName} (en adelante, &quot;la Empresa&quot;) es responsable del tratamiento de los datos
              personales que los usuarios proporcionen a través de este sitio web, de acuerdo con la
              Ley N° 19.628 sobre Protección de la Vida Privada y la Ley N° 21.719 sobre Protección
              de Datos Personales de Chile.
            </p>
            {contactAddress && (
              <p className="text-sm text-muted-foreground">
                {companyName}, {contactAddress}
              </p>
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Datos que Recopilamos</h2>
            <p>Recopilamos los siguientes datos personales cuando el usuario se registra o actualiza su perfil:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Nombre completo</li>
              <li>Correo electrónico</li>
              <li>Número de teléfono</li>
              <li>RUT (Rol Único Tributario)</li>
              <li>Dirección de envío (calle, ciudad, región, código postal)</li>
            </ul>
            <p>
              Adicionalmente, se registran datos de acceso como la fecha y hora de inicio de sesión
              y la dirección IP, con fines de seguridad.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Finalidad del Tratamiento</h2>
            <p>Los datos personales son utilizados exclusivamente para:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Gestionar la cuenta del usuario en la plataforma.</li>
              <li>Procesar y entregar los pedidos realizados.</li>
              <li>Enviar notificaciones relacionadas con el estado de los pedidos.</li>
              <li>Emitir documentos tributarios (boletas o facturas).</li>
              <li>Mejorar la experiencia del usuario en el sitio.</li>
              <li>Cumplir con obligaciones legales y regulatorias.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Base Legal</h2>
            <p>
              El tratamiento de datos se realiza con el consentimiento expreso del titular,
              otorgado al aceptar esta política de privacidad. En algunos casos, el tratamiento
              puede ser necesario para la ejecución del contrato de compraventa o para el
              cumplimiento de obligaciones legales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Derechos del Titular (Derechos ARCO)</h2>
            <p>
              De acuerdo con la legislación vigente, el titular de los datos tiene derecho a:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Acceso:</strong> Solicitar información sobre los datos personales almacenados.</li>
              <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos.</li>
              <li><strong>Cancelación:</strong> Solicitar la eliminación de sus datos personales.</li>
              <li><strong>Oposición:</strong> Oponerse al tratamiento de sus datos para fines específicos.</li>
            </ul>
            <p>
              Para ejercer estos derechos, el usuario puede actualizar su información directamente
              desde su perfil o contactarnos a través del correo electrónico indicado más abajo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Seguridad de los Datos</h2>
            <p>
              Implementamos medidas técnicas y organizativas apropiadas para proteger los datos
              personales contra el acceso no autorizado, la alteración, divulgación o destrucción.
              Los datos se almacenan en servidores seguros con cifrado en tránsito y en reposo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Transferencia de Datos</h2>
            <p>
              Los datos personales no serán compartidos con terceros, salvo cuando sea necesario
              para la prestación del servicio (por ejemplo, empresas de transporte para el envío
              de pedidos) o cuando lo exija la ley.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Conservación de Datos</h2>
            <p>
              Los datos personales se conservarán mientras el usuario mantenga una cuenta activa
              en la plataforma. En caso de solicitar la eliminación de la cuenta, los datos serán
              eliminados en un plazo de 30 días, salvo aquellos que deban conservarse por
              obligaciones legales o tributarias.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">9. Cookies</h2>
            <p>
              Este sitio utiliza cookies técnicas necesarias para el funcionamiento de la plataforma,
              como la gestión de sesiones de usuario y el carrito de compras. No se utilizan
              cookies de seguimiento o publicidad de terceros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">10. Modificaciones</h2>
            <p>
              La Empresa se reserva el derecho de modificar esta política de privacidad en cualquier
              momento. Las modificaciones serán publicadas en esta misma página con la fecha de
              actualización correspondiente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">11. Contacto</h2>
            <p>
              Para consultas sobre el tratamiento de datos personales o para ejercer sus derechos,
              puede contactarnos a:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Correo electrónico:</strong> {contactEmail}</li>
              {contactAddress && (
                <li>
                  <strong>Dirección:</strong> {contactAddress}
                  {mapsUrl && (
                    <> (<a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">ver en mapa</a>)</>
                  )}
                </li>
              )}
            </ul>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
