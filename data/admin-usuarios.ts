import { MOCK_USERS_WHITELIST, type UserRole } from '@/data/mock-users';
import type { EstadoUsuario, Usuario } from '@/models';
import { newUsuarioId } from '@/data/usuario-id';

export type { EstadoUsuario };

export { newUsuarioId };

export type UsuarioConRol = Usuario & { rol: UserRole };

export const ROL_USUARIO_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  encargado: 'Encargado',
  conductor: 'Conductor',
};

export const ROLES_USUARIO: UserRole[] = ['admin', 'encargado', 'conductor'];

const FECHA_ALTA_USUARIO_INICIAL = '2026-01-01T08:00:00.000Z';
const FECHA_ACTUALIZACION_USUARIO_INICIAL = '2026-04-01T10:00:00.000Z';

function nombresDesdeDisplayName(displayName: string): {
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
} {
  const partes = displayName.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) {
    return {
      primer_nombre: 'Usuario',
      segundo_nombre: null,
      primer_apellido: '',
      segundo_apellido: null,
    };
  }
  if (partes.length === 1) {
    return {
      primer_nombre: partes[0],
      segundo_nombre: null,
      primer_apellido: '',
      segundo_apellido: null,
    };
  }
  if (partes.length === 2) {
    return {
      primer_nombre: partes[0],
      segundo_nombre: null,
      primer_apellido: partes[1],
      segundo_apellido: null,
    };
  }
  if (partes.length === 3) {
    return {
      primer_nombre: partes[0],
      segundo_nombre: null,
      primer_apellido: partes[1],
      segundo_apellido: partes[2],
    };
  }
  if (partes.length === 4) {
    return {
      primer_nombre: partes[0],
      segundo_nombre: partes[1],
      primer_apellido: partes[2],
      segundo_apellido: partes[3],
    };
  }
  return {
    primer_nombre: partes[0],
    segundo_nombre: partes[1],
    primer_apellido: partes.slice(2, -1).join(' '),
    segundo_apellido: partes[partes.length - 1],
  };
}

function usuarioConRolDesdeRegistro(m: (typeof MOCK_USERS_WHITELIST)[number]): UsuarioConRol {
  const n = nombresDesdeDisplayName(m.displayName);
  const email = (m.email ?? `${m.document}@parknear.app`).toLowerCase();
  const celular = m.celular ?? '3000000000';
  const estado: EstadoUsuario = m.estado ?? 'activo';

  return {
    id: m.id_usuario,
    documento_identidad: m.document,
    ...n,
    email,
    contrasena: m.password,
    celular,
    estado,
    fecha_creacion: FECHA_ALTA_USUARIO_INICIAL,
    fecha_actualizacion: FECHA_ACTUALIZACION_USUARIO_INICIAL,
    rol: m.role,
  };
}

export const INITIAL_ADMIN_USUARIOS: UsuarioConRol[] =
  MOCK_USERS_WHITELIST.map(usuarioConRolDesdeRegistro);
