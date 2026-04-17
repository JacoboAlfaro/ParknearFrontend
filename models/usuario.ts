import type { EstadoUsuario } from '@/models/enums';

export type Usuario = {
  id: string;
  documento_identidad: string;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  email: string;
  contrasena: string;
  celular: string;
  estado: EstadoUsuario;
  fecha_creacion: string;
  fecha_actualizacion: string;
};
