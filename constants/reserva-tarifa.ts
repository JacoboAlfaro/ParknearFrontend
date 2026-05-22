export const TARIFA_RESERVA_POR_HORA_COP = 3500;

/** Cargo fijo por crear la reserva */
export const CARGO_FIJO_RESERVA_COP = 5000;

export const RESERVA_HORAS_MIN = 1;
export const RESERVA_HORAS_MAX = 24;
export const RESERVA_HORAS_DEFAULT = 1;

const MS_POR_HORA = 60 * 60 * 1000;

export function fechaFinReservaDesdeHoras(
  horas: number,
  fechaInicioMs: number = Date.now(),
): string {
  const h = normalizarHorasReserva(horas);
  return new Date(fechaInicioMs + h * MS_POR_HORA).toISOString();
}

export function fechaFinReservaSoloCargoCop(
  fechaInicioMs: number = Date.now(),
): string {
  const horasEquivalentes = CARGO_FIJO_RESERVA_COP / TARIFA_RESERVA_POR_HORA_COP;
  return new Date(fechaInicioMs + horasEquivalentes * MS_POR_HORA).toISOString();
}

/** Subtotal por estacionamiento (horas × tarifa) */
export function subtotalHorasReservaCop(horas: number): number {
  const h = Math.max(0, normalizarHorasReserva(horas));
  return h * TARIFA_RESERVA_POR_HORA_COP;
}

/** Total = horas × tarifa + cargo fijo de reserva */
export function precioReservaPorHorasCop(horas: number): number {
  return subtotalHorasReservaCop(horas) + CARGO_FIJO_RESERVA_COP;
}

/** Cómo se paga la reserva desde la app */
export type MetodoPagoReservaUi = 'mercadopago' | 'efectivo_zona';

export type DesglosePrecioReserva = {
  horas: number;
  subtotalHoras: number;
  cargoReserva: number;
  total: number;
  metodoPago: MetodoPagoReservaUi;
  pagaEstacionamientoEnZona: boolean;
};

export const SELECCION_TIEMPO_EFECTIVO = 'efectivo';

export type SeleccionTiempoReserva = typeof SELECCION_TIEMPO_EFECTIVO | number;

export type CotizacionReserva = {
  seleccion: string;
  metodoPago: MetodoPagoReservaUi;
  horasPagoAdelantado: number;
  horasReservaApi: number;
  fechaFin: string;
  finLegible: string;
  desglose: DesglosePrecioReserva;
  precio: number;
};

export function parseSeleccionTiempoReserva(seleccion: string): CotizacionReserva | null {
  const key = seleccion.trim().toLowerCase();
  if (key === SELECCION_TIEMPO_EFECTIVO) {
    const fechaFin = fechaFinReservaSoloCargoCop();
    const horasReservaApi = CARGO_FIJO_RESERVA_COP / TARIFA_RESERVA_POR_HORA_COP;
    const desglose: DesglosePrecioReserva = {
      horas: 0,
      subtotalHoras: 0,
      cargoReserva: CARGO_FIJO_RESERVA_COP,
      total: CARGO_FIJO_RESERVA_COP,
      metodoPago: 'efectivo_zona',
      pagaEstacionamientoEnZona: true,
    };
    return {
      seleccion: SELECCION_TIEMPO_EFECTIVO,
      metodoPago: 'efectivo_zona',
      horasPagoAdelantado: 0,
      horasReservaApi,
      fechaFin,
      finLegible: formatFechaFinReservaLegible(fechaFin),
      desglose,
      precio: desglose.total,
    };
  }
  const horas = parseHorasReservaInput(seleccion);
  if (horas === null) return null;
  const fechaFin = fechaFinReservaDesdeHoras(horas);
  const desglose = desglosePrecioReserva(horas, 'mercadopago');
  return {
    seleccion: String(horas),
    metodoPago: 'mercadopago',
    horasPagoAdelantado: horas,
    horasReservaApi: horas,
    fechaFin,
    finLegible: formatFechaFinReservaLegible(fechaFin),
    desglose,
    precio: desglose.total,
  };
}

export function desglosePrecioReserva(
  horas: number,
  metodoPago: MetodoPagoReservaUi = 'mercadopago',
): DesglosePrecioReserva {
  const h = normalizarHorasReserva(horas);
  const subtotalHoras = subtotalHorasReservaCop(h);
  if (metodoPago === 'efectivo_zona') {
    return {
      horas: 0,
      subtotalHoras: 0,
      cargoReserva: CARGO_FIJO_RESERVA_COP,
      total: CARGO_FIJO_RESERVA_COP,
      metodoPago,
      pagaEstacionamientoEnZona: true,
    };
  }
  return {
    horas: h,
    subtotalHoras,
    cargoReserva: CARGO_FIJO_RESERVA_COP,
    total: subtotalHoras + CARGO_FIJO_RESERVA_COP,
    metodoPago,
    pagaEstacionamientoEnZona: false,
  };
}

export function normalizarHorasReserva(horas: number): number {
  const entero = Math.round(horas);
  return Math.min(RESERVA_HORAS_MAX, Math.max(RESERVA_HORAS_MIN, entero));
}

export function parseHorasReservaInput(text: string): number | null {
  const trimmed = text.trim();
  if (!trimmed || !/^\d+$/.test(trimmed)) return null;
  const n = parseInt(trimmed, 10);
  if (n < RESERVA_HORAS_MIN || n > RESERVA_HORAS_MAX) return null;
  return n;
}

export function formatFechaFinReservaLegible(fechaFinIso: string): string {
  try {
    return new Date(fechaFinIso).toLocaleString('es-CO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return fechaFinIso;
  }
}

/** Precio según ventana entre inicio y fecha fin */
export function calcularPrecioReservaCop(
  fechaFinIso: string,
  fechaInicioMs: number = Date.now(),
): number {
  const diffMs = new Date(fechaFinIso).getTime() - fechaInicioMs;
  const diffHours = Math.max(0, diffMs / MS_POR_HORA);
  return Number((diffHours * TARIFA_RESERVA_POR_HORA_COP + CARGO_FIJO_RESERVA_COP).toFixed(2));
}
