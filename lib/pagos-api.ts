import { ApiHttpError, apiJson } from '@/lib/api-fetch';
import { FlujoPagoError } from '@/lib/flujo-pago-error';

// Paso 2 — POST /pagos (Peticion a ParkNear para crear un pago).
export type DatosPagoReservaInput = {
  transaction_amount: number;
  token: string;
  installments: number;
  payment_method_id: string;
  payer: { email: string };
};

export type CrearPagoReservaInput = {
  idReserva: number;
  datosPago: DatosPagoReservaInput;
};

export type PagoRegistroApi = {
  id: number;
  id_reserva: number | null;
  mp_id_transaccion: string | null;
  monto: string;
  metodo: 'efectivo' | 'mercadopago';
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'reembolsado';
  anotaciones: string | null;
  fecha_creacion: string | null;
  fecha_actualizacion: string | null;
};

export type CrearPagoReservaResponse = {
  pago?: PagoRegistroApi;
  mercadopago: {
    id: unknown;
    status: unknown;
    status_detail: unknown;
  };
};

// POST /pagos — Bearer JWT conductor + idReserva + token (sin datos de tarjeta).
export async function crearPagoReserva(input: CrearPagoReservaInput): Promise<CrearPagoReservaResponse> {
  const json: CrearPagoReservaInput = {
    ...input,
    datosPago: {
      ...input.datosPago,
      transaction_amount: Math.round(input.datosPago.transaction_amount),
      installments: input.datosPago.installments || 1,
    },
  };
  return apiJson<CrearPagoReservaResponse>('/pagos', {
    method: 'POST',
    json,
  });
}

export type ProcesarPagoMercadoPagoDirectoResponse = {
  status: string;
  status_detail: string;
  id: string | number;
};

// POST /mercadopago/procesar-pago — solo MP (sin registro en tabla pagos).
// Fallback si POST /pagos responde 500 por error no controlado en el servidor.
export async function procesarPagoMercadoPagoDirecto(
  datosPago: DatosPagoReservaInput,
): Promise<ProcesarPagoMercadoPagoDirectoResponse> {
  return apiJson<ProcesarPagoMercadoPagoDirectoResponse>('/mercadopago/procesar-pago', {
    method: 'POST',
    json: {
      ...datosPago,
      transaction_amount: Math.round(datosPago.transaction_amount),
      installments: datosPago.installments || 1,
    },
  });
}

export async function obtenerPago(idPago: number): Promise<PagoRegistroApi> {
  return apiJson<PagoRegistroApi>(`/pagos/${idPago}`);
}

export async function obtenerPagosPorUsuario(idUsuario: string): Promise<PagoRegistroApi[]> {
  return apiJson<PagoRegistroApi[]>(`/pagos/usuario/${idUsuario}`);
}

export function mensajeErrorPago(err: unknown): string {
  if (err instanceof FlujoPagoError) return err.message;
  if (err instanceof ApiHttpError) {
    try {
      const body = JSON.parse(err.bodyText) as {
        message?: string | string[];
        error?: string;
      };
      const msg = body.message;
      if (Array.isArray(msg)) return msg.join('\n');
      if (typeof msg === 'string' && msg.trim()) {
        if (err.status >= 500 && /^internal server error$/i.test(msg.trim())) {
          return `Error interno del servidor (${err.status}). Revisa Metro (POST /reservas o POST /pagos).`;
        }
        return msg;
      }
      if (body.error) return body.error;
    } catch {
      if (err.bodyText.trim()) return err.bodyText;
    }
    if (err.status >= 500) {
      return `Error interno del servidor (${err.status}). Revisa la consola de Metro para el detalle.`;
    }
    return `Error del servidor (${err.status}).`;
  }
  if (err instanceof Error) return err.message;
  return 'No se pudo procesar el pago.';
}

export function pagoMercadoPagoAprobado(status: unknown): boolean {
  return String(status).toLowerCase() === 'approved';
}
