import type { EstadoReserva, ReservaEncargadoVista } from '@/models';

export type { ReservaEncargadoVista };

export type ReservaEncargadoStatus = EstadoReserva;

export const ESTADO_RESERVA_LABELS: Record<EstadoReserva, string> = {
  pendiente: 'Pendiente',
  activa: 'Aceptada',
  cancelada: 'Cancelada',
  completada: 'Completada',
};

function iso(d: string, t: string): string {
  return `${d}T${t.length === 5 ? `${t}:00` : t}.000Z`;
}

export const INITIAL_ENCARGADO_RESERVAS: ReservaEncargadoVista[] = [
  {
    id: 1,
    id_conductor: '00000000-0000-4000-8000-000000000001',
    id_zona: 1,
    id_vehiculo: 'MNZ450',
    fecha_real_inicio: iso('2026-04-10', '08:00:00'),
    fecha_fin: iso('2026-04-10', '10:00:00'),
    precio: 14000,
    estado: 'pendiente',
    fecha_creacion: '2026-04-09T18:00:00.000Z',
    fecha_actualizacion: '2026-04-09T18:00:00.000Z',
    nombre_zona: 'Zona azul Centro',
    nombre_conductor: 'Pedro Ramírez',
    documento_conductor: '80123456',
    placa_vehiculo: 'MNZ-450',
  },
  {
    id: 2,
    id_conductor: '00000000-0000-4000-8000-000000000002',
    id_zona: 1,
    id_vehiculo: 'ABC123',
    fecha_real_inicio: iso('2026-04-10', '14:00:00'),
    fecha_fin: iso('2026-04-10', '16:00:00'),
    precio: 14000,
    estado: 'pendiente',
    fecha_creacion: '2026-04-09T19:00:00.000Z',
    fecha_actualizacion: '2026-04-09T19:00:00.000Z',
    nombre_zona: 'Zona azul Centro',
    nombre_conductor: 'Laura Díaz',
    documento_conductor: '52901122',
    placa_vehiculo: 'ABC-123',
  },
  {
    id: 3,
    id_conductor: '00000000-0000-4000-8000-000000000003',
    id_zona: 3,
    id_vehiculo: 'XYZ990',
    fecha_real_inicio: iso('2026-04-09', '09:30:00'),
    fecha_fin: iso('2026-04-09', '11:30:00'),
    precio: 16000,
    estado: 'activa',
    fecha_creacion: '2026-04-08T10:00:00.000Z',
    fecha_actualizacion: '2026-04-08T11:00:00.000Z',
    nombre_zona: 'Palogrande norte',
    nombre_conductor: 'Jorge Castro',
    documento_conductor: '1002987654',
    placa_vehiculo: 'XYZ-990',
  },
  {
    id: 4,
    id_conductor: '00000000-0000-4000-8000-000000000004',
    id_zona: 1,
    id_vehiculo: 'LOG001',
    fecha_real_inicio: iso('2026-04-08', '07:00:00'),
    fecha_fin: iso('2026-04-08', '18:00:00'),
    precio: 77000,
    estado: 'cancelada',
    fecha_creacion: '2026-04-07T12:00:00.000Z',
    fecha_actualizacion: '2026-04-07T14:00:00.000Z',
    nombre_zona: 'Zona azul Centro',
    nombre_conductor: 'Empresa Logística S.A.',
    documento_conductor: '901556778',
    placa_vehiculo: 'LOG-001',
  },
  {
    id: 5,
    id_conductor: '00000000-0000-4000-8000-000000000005',
    id_zona: 3,
    id_vehiculo: 'JKL808',
    fecha_real_inicio: iso('2026-04-07', '10:00:00'),
    fecha_fin: iso('2026-04-07', '12:00:00'),
    precio: 16000,
    estado: 'completada',
    fecha_creacion: '2026-04-06T09:00:00.000Z',
    fecha_actualizacion: '2026-04-07T10:12:00.000Z',
    nombre_zona: 'Palogrande norte',
    nombre_conductor: 'Carmen Ruiz',
    documento_conductor: '43789123',
    placa_vehiculo: 'JKL-808',
    fecha_confirmacion_llegada: '2026-04-07T10:12:00.000Z',
    placa_observada: 'JKL-808',
  },
];

export function ventanaReservaLegible(r: ReservaEncargadoVista): string {
  const inicio = new Date(r.fecha_real_inicio);
  const fin = r.fecha_fin ? new Date(r.fecha_fin) : inicio;
  const fecha = inicio.toLocaleDateString('es-CO', { dateStyle: 'medium' });
  const hi = inicio.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  const hf = fin.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  return `${fecha} · ${hi} – ${hf}`;
}
