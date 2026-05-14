import { apiJson } from '@/lib/api-fetch';
import type { EstadoReserva } from '@/models';

export type CreateReservaInput = {
  id_conductor: string;
  id_zona: number;
  id_vehiculo: string; // placa del vehículo (max 10 chars)
  fecha_fin: string;   // ISO 8601
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
  return apiJson<ReservaApi>('/reservas', {
    method: 'POST',
    json: {
      id_conductor: input.id_conductor,
      id_zona: input.id_zona,
      id_vehiculo: input.id_vehiculo,
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
