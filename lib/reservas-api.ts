import { apiJson } from '@/lib/api-fetch';
import type { EstadoReserva } from '@/models';

export {
  CARGO_FIJO_RESERVA_COP,
  desglosePrecioReserva,
  parseSeleccionTiempoReserva,
  SELECCION_TIEMPO_EFECTIVO,
  type MetodoPagoReservaUi,
  fechaFinReservaDesdeHoras,
  formatFechaFinReservaLegible,
  parseHorasReservaInput,
  precioReservaPorHorasCop,
  RESERVA_HORAS_DEFAULT,
  RESERVA_HORAS_MAX,
  RESERVA_HORAS_MIN,
} from '@/constants/reserva-tarifa';


export type CreateReservaInput = {
  id_conductor: string;
  id_zona: number;
  id_vehiculo: string;
  fecha_fin: string;
};

export type ReservaApi = {
  id: number;
  id_conductor: string | null;
  id_zona: number | null;
  id_vehiculo: string | null;
  fecha_real_inicio: string;
  fecha_fin: string | null;
  precio: number;
  estado: EstadoReserva;
  fecha_creacion: string; 
  fecha_actualizacion: string;
};

// Monto de la reserva tal como lo devuelve POST /reservas (para POST /pagos).
export function montoPagoDesdeReserva(reserva: Pick<ReservaApi, 'precio'>): number {
  const monto = Math.round(Number(reserva.precio));
  if (!Number.isFinite(monto) || monto <= 0) {
    throw new Error('La reserva no tiene un precio válido para procesar el pago.');
  }
  return monto;
}

export type ProcesarPagoInput = {
  idReserva: number;
  datosPago: {
    transaction_amount: number;
    token: string;            // token generado por Mercado Pago
    installments: number;
    payment_method_id: string; // ej: "master", "visa"
    payer: {
      email: string;
    };
  };
};

export type PagoApi = {
  pago?: {
    id: number;
    id_reserva: number | null;
    mp_id_transaccion: string | null;
    monto: string;
    metodo: 'efectivo' | 'mercadopago';
    estado: 'pendiente' | 'aprobado' | 'rechazado' | 'reembolzado';
    anotaciones: string | null;
    fecha_creacion: string | null;
    fecha_actualizacion: string | null;
  };
  mercadopago?: {
    id: unknown;
    status: unknown;
    status_detail: unknown;
  };
};

export async function crearReserva(input: CreateReservaInput): Promise<ReservaApi> {
  const placa = input.id_vehiculo.trim().toUpperCase();
  if (!placa || placa.length > 10) {
    throw new Error('La placa debe tener entre 1 y 10 caracteres (id_vehiculo).');
  }
  if (!input.id_conductor?.trim()) {
    throw new Error('Falta el conductor (id_conductor). Inicia sesión de nuevo.');
  }
  if (!Number.isFinite(input.id_zona) || input.id_zona < 1) {
    throw new Error('Zona inválida (id_zona).');
  }
  const finMs = new Date(input.fecha_fin).getTime();
  if (!Number.isFinite(finMs) || finMs <= Date.now()) {
    throw new Error('La fecha de fin debe ser posterior a ahora.');
  }

  return apiJson<ReservaApi>('/reservas', {
    method: 'POST',
    json: {
      id_conductor: input.id_conductor.trim(),
      id_zona: input.id_zona,
      id_vehiculo: placa,
      fecha_fin: input.fecha_fin,
    },
  });
}

export async function procesarPago(input: ProcesarPagoInput): Promise<PagoApi> {
  return apiJson<PagoApi>('/pagos', {
    method: 'POST',
    json: input,
  });
}

export async function obtenerReservasUsuario(userId: string): Promise<ReservaApi[]> {
  return apiJson<ReservaApi[]>(`/reservas/user/${userId}`);
}

export async function obtenerReservasZona(zonaId: number): Promise<ReservaApi[]> {
  return apiJson<ReservaApi[]>(`/reservas/zona/${zonaId}`);
}

export async function obtenerReserva(id: number): Promise<ReservaApi> {
  return apiJson<ReservaApi>(`/reservas/${id}`);
}

export async function actualizarEstadoReserva(
  id: number,
  estado: EstadoReserva,
): Promise<ReservaApi> {
  return apiJson<ReservaApi>(`/reservas/${id}/state`, {
    method: 'PUT',
    json: { estado },
  });
}
