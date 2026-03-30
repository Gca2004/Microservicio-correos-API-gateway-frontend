import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv
import os

load_dotenv()

CORREO_EMISOR = os.getenv("CORREO_EMISOR")
CLAVE_CORREO  = os.getenv("CLAVE_CORREO")
NOMBRE_PLATAFORMA = "GCA Correos"

# Colores corporativos
COLOR_FONDO        = "#1a1f1a"
COLOR_TARJETA      = "#242924"
COLOR_VERDE        = "#7B9669"
COLOR_VERDE_CLARO  = "#BAC8B1"
COLOR_TEXTO        = "#e8ede5"
COLOR_TEXTO_SUAVE  = "#8a9e84"
COLOR_BORDE        = "#333a33"

def _base_html(contenido: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>{NOMBRE_PLATAFORMA}</title>
    </head>
    <body style="margin:0;padding:0;background-color:{COLOR_FONDO};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:{COLOR_FONDO};padding:40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

              <!-- Header -->
              <tr>
                <td style="background-color:{COLOR_TARJETA};border-radius:12px 12px 0 0;padding:32px 40px;border-bottom:2px solid {COLOR_VERDE};">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <span style="font-size:22px;font-weight:700;color:{COLOR_VERDE_CLARO};letter-spacing:2px;text-transform:uppercase;">
                          {NOMBRE_PLATAFORMA}
                        </span>
                      </td>
                      <td align="right">
                        <span style="display:inline-block;width:10px;height:10px;background-color:{COLOR_VERDE};border-radius:50%;margin-right:4px;"></span>
                        <span style="font-size:11px;color:{COLOR_TEXTO_SUAVE};letter-spacing:1px;text-transform:uppercase;">Sistema activo</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Contenido -->
              <tr>
                <td style="background-color:{COLOR_TARJETA};padding:40px 40px 32px;">
                  {contenido}
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color:#161b16;border-radius:0 0 12px 12px;padding:24px 40px;border-top:1px solid {COLOR_BORDE};">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <p style="margin:0;font-size:11px;color:{COLOR_TEXTO_SUAVE};letter-spacing:0.5px;">
                          © 2025 {NOMBRE_PLATAFORMA} · Todos los derechos reservados
                        </p>
                        <p style="margin:6px 0 0;font-size:11px;color:#4a5a44;">
                          Este correo fue generado automáticamente, por favor no respondas a este mensaje.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """

def enviar_correo(destino: str, asunto: str, cuerpo_html: str):
    mensaje = MIMEMultipart("alternative")
    mensaje["Subject"] = asunto
    mensaje["From"]    = f"{NOMBRE_PLATAFORMA} <{CORREO_EMISOR}>"
    mensaje["To"]      = destino

    parte_html = MIMEText(cuerpo_html, "html")
    mensaje.attach(parte_html)

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as servidor:
        servidor.login(CORREO_EMISOR, CLAVE_CORREO)
        servidor.sendmail(CORREO_EMISOR, destino, mensaje.as_string())

# ── 1. Correo de bienvenida ────────────────────────────────────────
def correo_bienvenida(nombres: str, destino: str):
    contenido = f"""
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background-color:#2d3d2d;border:1px solid {COLOR_VERDE};border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;text-align:center;">
        🌿
      </div>
    </div>

    <h1 style="margin:0 0 8px;font-size:28px;font-weight:300;color:{COLOR_TEXTO};text-align:center;letter-spacing:1px;">
      Bienvenido a nuestra plataforma
    </h1>
    <p style="margin:0 0 32px;font-size:15px;color:{COLOR_TEXTO_SUAVE};text-align:center;">
      {nombres}
    </p>

    <div style="background-color:#1e261e;border-left:3px solid {COLOR_VERDE};border-radius:0 8px 8px 0;padding:20px 24px;margin-bottom:28px;">
      <p style="margin:0;font-size:15px;color:{COLOR_TEXTO};line-height:1.7;">
        Gracias por confiar en nosotros. Tu cuenta ha sido creada exitosamente
        y ya puedes acceder a todos los servicios de la plataforma.
      </p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td style="background-color:#1e261e;border:1px solid {COLOR_BORDE};border-radius:8px;padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:11px;color:{COLOR_TEXTO_SUAVE};text-transform:uppercase;letter-spacing:1px;">Cuenta registrada</p>
          <p style="margin:0;font-size:15px;color:{COLOR_VERDE_CLARO};font-weight:500;">{destino}</p>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:13px;color:#4a5a44;text-align:center;line-height:1.6;">
      Si no solicitaste este registro, puedes ignorar este mensaje con seguridad.
    </p>
    """
    enviar_correo(destino, f"Bienvenido a {NOMBRE_PLATAFORMA}", _base_html(contenido))


# ── 2. Correo de código de verificación ───────────────────────────
def correo_verificacion(nombres: str, destino: str, codigo: str):
    contenido = f"""
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:300;color:{COLOR_TEXTO};text-align:center;letter-spacing:1px;">
      Verifica tu cuenta
    </h1>
    <p style="margin:0 0 36px;font-size:14px;color:{COLOR_TEXTO_SUAVE};text-align:center;">
      Hola {nombres}, usa el siguiente código para activar tu cuenta
    </p>

    <!-- Código -->
    <div style="text-align:center;margin-bottom:36px;">
      <div style="display:inline-block;background-color:#1a2a1a;border:2px solid {COLOR_VERDE};border-radius:12px;padding:24px 48px;">
        <span style="font-size:48px;font-weight:700;color:{COLOR_VERDE_CLARO};letter-spacing:16px;font-family:'Courier New',monospace;">
          {codigo}
        </span>
      </div>
      <p style="margin:16px 0 0;font-size:12px;color:{COLOR_TEXTO_SUAVE};">
        Este código expira en <strong style="color:{COLOR_VERDE_CLARO};">15 minutos</strong>
      </p>
    </div>

    <div style="background-color:#1e261e;border:1px solid {COLOR_BORDE};border-radius:8px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:{COLOR_TEXTO_SUAVE};line-height:1.6;">
        🔒 Por tu seguridad, nunca compartas este código con nadie.
        {NOMBRE_PLATAFORMA} jamás te lo solicitará por otro medio.
      </p>
    </div>

    <p style="margin:0;font-size:12px;color:#4a5a44;text-align:center;">
      Si no creaste una cuenta, ignora este mensaje.
    </p>
    """
    enviar_correo(destino, f"Tu código de verificación — {NOMBRE_PLATAFORMA}", _base_html(contenido))


# ── 3. Correo de restablecimiento de clave ────────────────────────
def correo_restablecer_clave(nombres: str, destino: str):
    contenido = f"""
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;font-size:36px;">🔑</div>
    </div>

    <h1 style="margin:0 0 8px;font-size:26px;font-weight:300;color:{COLOR_TEXTO};text-align:center;letter-spacing:1px;">
      Clave actualizada
    </h1>
    <p style="margin:0 0 32px;font-size:14px;color:{COLOR_TEXTO_SUAVE};text-align:center;">
      Hola {nombres}
    </p>

    <div style="background-color:#1e261e;border-left:3px solid {COLOR_VERDE};border-radius:0 8px 8px 0;padding:20px 24px;margin-bottom:28px;">
      <p style="margin:0;font-size:15px;color:{COLOR_TEXTO};line-height:1.7;">
        Tu clave de acceso ha sido restablecida exitosamente.
        Ya puedes iniciar sesión con tu nueva clave.
      </p>
    </div>

    <div style="background-color:#2a1e1e;border:1px solid #5a3333;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#c09090;line-height:1.6;">
        ⚠️ Si no realizaste este cambio, contacta con el administrador
        de la plataforma de inmediato.
      </p>
    </div>

    <p style="margin:0;font-size:12px;color:#4a5a44;text-align:center;">
      Por tu seguridad, te recomendamos no compartir tu clave con nadie.
    </p>
    """
    enviar_correo(destino, f"Tu clave fue actualizada — {NOMBRE_PLATAFORMA}", _base_html(contenido))


# ── 4. Correo personalizado del admin ─────────────────────────────
def correo_personalizado(nombres: str, destino: str, asunto: str, mensaje: str):
    contenido = f"""
    <div style="margin-bottom:8px;">
      <span style="font-size:11px;color:{COLOR_TEXTO_SUAVE};text-transform:uppercase;letter-spacing:1px;">
        Mensaje del administrador
      </span>
    </div>

    <h1 style="margin:0 0 32px;font-size:24px;font-weight:300;color:{COLOR_TEXTO};letter-spacing:0.5px;">
      {asunto}
    </h1>

    <p style="margin:0 0 8px;font-size:14px;color:{COLOR_TEXTO_SUAVE};">
      Hola {nombres},
    </p>

    <div style="background-color:#1e261e;border:1px solid {COLOR_BORDE};border-radius:8px;padding:24px;margin:16px 0 28px;">
      <p style="margin:0;font-size:15px;color:{COLOR_TEXTO};line-height:1.8;white-space:pre-line;">
        {mensaje}
      </p>
    </div>

    <div style="border-top:1px solid {COLOR_BORDE};padding-top:20px;">
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-right:12px;">
            <div style="width:32px;height:32px;background-color:#2d3d2d;border:1px solid {COLOR_VERDE};border-radius:50%;text-align:center;line-height:32px;font-size:14px;">
              A
            </div>
          </td>
          <td>
            <p style="margin:0;font-size:13px;color:{COLOR_TEXTO_SUAVE};">Enviado por el equipo de</p>
            <p style="margin:2px 0 0;font-size:13px;color:{COLOR_VERDE_CLARO};font-weight:500;">{NOMBRE_PLATAFORMA}</p>
          </td>
        </tr>
      </table>
    </div>
    """
    enviar_correo(destino, asunto, _base_html(contenido))