/** Error del flujo reserva → token MP → POST /pagos, con el paso que falló. */
export class FlujoPagoError extends Error {
  readonly paso: 'POST /reservas' | 'Mercado Pago card_tokens' | 'POST /pagos';

  constructor(paso: FlujoPagoError['paso'], message: string) {
    super(message);
    this.name = 'FlujoPagoError';
    this.paso = paso;
  }
}

const AYUDA_RESERVAS_500 =
  '\n\nRevisa en el servidor de reservas:\n' +
  '• Que la placa exista en la tabla vehículos (la app intenta registrarla antes).\n' +
  '• Que tu usuario sea conductor en la BD.\n' +
  '• Que la zona tenga cupos (capacidad > 0).\n' +
  '• Logs del microservicio parknear-reservations (el 500 suele ser error no controlado).';

const AYUDA_PAGOS_500 =
  '\n\nLa reserva ya se creó; falló el cobro en parknear-payments:\n' +
  '• MERCADOPAGO_ACCESS_TOKEN en el servidor (mismo proyecto TEST que la Public Key).\n' +
  '• Tarjeta de prueba: titular APRO, Mastercard 5254…, CVV 123, vence 11/30.\n' +
  '• El monto lo toma el servidor desde reserva.precio (horas × 3500), no el total con cargo $5.000 de la UI.\n' +
  '• Logs de parknear-payments al llamar a Mercado Pago.';

export function mensajeFlujoPago(paso: FlujoPagoError['paso'], err: unknown): string {
  const base = extraerMensajeHttp(err);
  if (paso === 'POST /reservas' && esErrorInternoServidor(err)) {
    return `${paso}: ${base}${AYUDA_RESERVAS_500}`;
  }
  if (paso === 'POST /pagos' && esErrorInternoServidor(err)) {
    return `${paso}: ${base}${AYUDA_PAGOS_500}`;
  }
  return `${paso}: ${base}`;
}

function esErrorInternoServidor(err: unknown): boolean {
  if (err && typeof err === 'object' && 'status' in err) {
    return (err as { status: number }).status >= 500;
  }
  return /internal server error/i.test(err instanceof Error ? err.message : String(err));
}

function extraerMensajeHttp(err: unknown): string {
  if (err && typeof err === 'object' && 'status' in err && 'bodyText' in err) {
    const http = err as { status: number; bodyText: string };
    try {
      const body = JSON.parse(http.bodyText) as {
        message?: string | string[];
        error?: string;
      };
      const msg = body.message;
      if (Array.isArray(msg)) return msg.join('\n');
      if (typeof msg === 'string' && msg.trim()) {
        if (http.status >= 500 && /internal server error/i.test(msg)) {
          return `Error interno del servidor (${http.status}).`;
        }
        return msg;
      }
      if (body.error) return body.error;
    } catch {
      if (http.bodyText.trim()) return http.bodyText;
    }
    if (http.status >= 500) {
      return `Error interno del servidor (${http.status}).`;
    }
    return `Error del servidor (${http.status}).`;
  }
  if (err instanceof Error) return err.message;
  return 'No se pudo completar la operación.';
}
