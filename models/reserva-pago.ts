import type { EstadoPago, EstadoReserva, MetodoPago } from '@/models/enums';
import type { JsonValue } from '@/models/json';

export type Reserva = {
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

export type Pago = {
  id: number;
  id_reserva: number | null;
  mp_id_transaccion: string | null;
  mp_payload: JsonValue | null;
  monto: number;
  metodo: MetodoPago;
  estado: EstadoPago;
  anotaciones: string | null;
  fecha_creacion: string | null;
  fecha_actualizacion: string | null;
};

export type ReservaEncargadoVista = Reserva & {
  nombre_zona: string;
  nombre_conductor: string;
  documento_conductor: string;
  placa_vehiculo: string;
  fecha_confirmacion_llegada?: string;
  placa_observada?: string;
};
