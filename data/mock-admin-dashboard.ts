import type { SolicitudSoporteVista, TipoSolicitud, ZonaAzulVista } from '@/models';

export type { ZonaAzulVista, SolicitudSoporteVista };

export { MOCK_BLUE_ZONES } from '@/data/zonas-azules-demo';

export const MOCK_SOLICITUDES: SolicitudSoporteVista[] = [
  {
    id: 1,
    id_usuario: null,
    tipo: 'peticion',
    titulo: 'Registro como zona azul en sector La Enea',
    descripcion: 'Solicitud de registro como zona azul en sector La Enea',
    estado: 'pendiente',
    fecha_creacion: '2026-04-08T12:00:00.000Z',
    fecha_actualizacion: '2026-04-08T12:00:00.000Z',
    nombre_solicitante: 'Parking Los Yarumos',
  },
  {
    id: 2,
    id_usuario: null,
    tipo: 'sugerencia',
    titulo: 'Aumentar cupos de 20 a 35 por demanda',
    descripcion: 'Aumentar cupos de 20 a 35 por demanda',
    estado: 'pendiente',
    fecha_creacion: '2026-04-07T10:00:00.000Z',
    fecha_actualizacion: '2026-04-07T10:00:00.000Z',
    nombre_solicitante: 'Encargado Zona T',
  },
  {
    id: 3,
    id_usuario: null,
    tipo: 'reclamo',
    titulo: 'Baja solicitada por usuario 52987654',
    descripcion: 'Baja solicitada por usuario 52987654',
    estado: 'resuelta',
    fecha_creacion: '2026-04-05T09:00:00.000Z',
    fecha_actualizacion: '2026-04-06T15:00:00.000Z',
    nombre_solicitante: 'Sistema',
    resultado_admin: 'aceptada',
    motivo_admin: 'Baja aplicada según política interna.',
  },
  {
    id: 4,
    id_usuario: null,
    tipo: 'queja',
    titulo: 'Consulta tarifas especiales fin de semana',
    descripcion: 'Consulta tarifas especiales fin de semana',
    estado: 'resuelta',
    fecha_creacion: '2026-04-04T11:00:00.000Z',
    fecha_actualizacion: '2026-04-05T09:00:00.000Z',
    nombre_solicitante: 'Comercio Centro',
    resultado_admin: 'rechazada',
    motivo_admin: 'Las tarifas publicadas aplican también los fines de semana.',
  },
];

export const TIPO_SOLICITUD_LABELS: Record<TipoSolicitud, string> = {
  peticion: 'Petición',
  queja: 'Queja',
  reclamo: 'Reclamo',
  sugerencia: 'Sugerencia',
};

export function countPendingSolicitudes(list: SolicitudSoporteVista[]): number {
  return list.filter((s) => s.estado === 'pendiente').length;
}
