export type EstadoUsuario = 'activo' | 'no_verificado' | 'inactivo' | 'eliminado';

export type EstadoSolicitud = 'activa' | 'pendiente' | 'resuelta';

export type TipoSolicitud = 'peticion' | 'queja' | 'reclamo' | 'sugerencia';

export type EstadoReserva = 'activa' | 'pendiente' | 'cancelada' | 'completada';

export type MetodoPago = 'efectivo' | 'mercadopago';

export type EstadoPago = 'pendiente' | 'aprobado' | 'rechazado' | 'reembolzado';

export const ESTADO_USUARIO_LABELS: Record<EstadoUsuario, string> = {
  activo: 'Activo',
  no_verificado: 'No verificado',
  inactivo: 'Inactivo',
  eliminado: 'Eliminado',
};

export const ESTADO_SOLICITUD_LABELS: Record<EstadoSolicitud, string> = {
  activa: 'Activa',
  pendiente: 'Pendiente',
  resuelta: 'Resuelta',
};
