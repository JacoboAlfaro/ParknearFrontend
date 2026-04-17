import type { EstadoSolicitud, TipoSolicitud } from '@/models/enums';

export type ResultadoRevisionSolicitud = 'aceptada' | 'rechazada';

export type SolicitudSoporte = {
  id: number;
  id_usuario: string | null;
  tipo: TipoSolicitud;
  titulo: string;
  descripcion: string;
  estado: EstadoSolicitud;
  fecha_creacion: string;
  fecha_actualizacion: string;
};

export type MensajeSoporte = {
  id: number;
  id_solicitud: number | null;
  id_usuario: string | null;
  mensaje: string;
  fecha: string;
};

export type SolicitudSoporteVista = SolicitudSoporte & {
  nombre_solicitante: string;
  resultado_admin?: ResultadoRevisionSolicitud | null;
  motivo_admin?: string | null;
};
