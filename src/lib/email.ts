// Servicio de Email usando Resend API
// Para recuperación de contraseña

const RESEND_API_KEY = 're_52fyxwqU_Mw6P6VK4bznw3FVE4bzfcX8V';
const FROM_EMAIL = 'Rocky Cuentas <onboarding@resend.dev>';

export async function sendPasswordResetEmail(
  toEmail: string,
  resetCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: toEmail,
        subject: '🔐 Recuperación de Contraseña - Rocky Cuentas',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
            <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              <div style="background: linear-gradient(135deg, #f97316, #dc2626); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">🔐 Rocky Cuentas</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Recuperación de Contraseña</p>
              </div>
              <div style="padding: 30px;">
                <p style="color: #333; font-size: 16px;">Hola,</p>
                <p style="color: #666; font-size: 14px; line-height: 1.6;">
                  Recibimos una solicitud para restablecer la contraseña de tu cuenta en Rocky Cuentas.
                </p>
                <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                  <p style="color: #666; font-size: 12px; margin: 0 0 10px;">Tu código de verificación es:</p>
                  <p style="color: #1a1a2e; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 0;">${resetCode}</p>
                </div>
                <p style="color: #666; font-size: 14px; line-height: 1.6;">
                  Ingresa este código en la aplicación para crear una nueva contraseña.
                </p>
                <p style="color: #999; font-size: 12px; margin-top: 20px;">
                  Si no solicitaste este cambio, puedes ignorar este email. Este código expira en 15 minutos.
                </p>
              </div>
              <div style="background: #f8f9fa; padding: 20px; text-align: center;">
                <p style="color: #999; font-size: 11px; margin: 0;">
                  © ${new Date().getFullYear()} Rocky Cuentas. Todos los derechos reservados.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Rocky Cuentas - Recuperación de Contraseña

          Hola,

          Recibimos una solicitud para restablecer tu contraseña.

          Tu código de verificación es: ${resetCode}

          Ingresa este código en la aplicación para crear una nueva contraseña.

          Si no solicitaste este cambio, puedes ignorar este email.
          Este código expira en 15 minutos.
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Error al enviar email' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error enviando email:', error);
    return { success: false, error: 'Error de conexión' };
  }
}
