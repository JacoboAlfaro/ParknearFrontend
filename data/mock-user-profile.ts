import { nombreCompletoUsuario, type Usuario } from '@/models';

export type UsuarioPerfilVista = Pick<
  Usuario,
  'primer_nombre' | 'segundo_nombre' | 'primer_apellido' | 'segundo_apellido' | 'email'
> & {
  avatar_url: string | null;
};

export function greetingFirstNames(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Usuario';
  if (parts.length === 1) return parts[0]!;
  return `${parts[0]!} ${parts[1]!}`;
}

export function nombreMostradoPerfil(u: UsuarioPerfilVista): string {
  return nombreCompletoUsuario(u);
}

export function usuarioPerfilDesdeSesionMapa(displayName: string, email: string): UsuarioPerfilVista {
  const partes = displayName.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) {
    return {
      primer_nombre: 'Usuario',
      segundo_nombre: null,
      primer_apellido: '',
      segundo_apellido: null,
      email,
      avatar_url: null,
    };
  }
  if (partes.length === 1) {
    return {
      primer_nombre: partes[0]!,
      segundo_nombre: null,
      primer_apellido: '',
      segundo_apellido: null,
      email,
      avatar_url: null,
    };
  }
  if (partes.length === 2) {
    return {
      primer_nombre: partes[0]!,
      segundo_nombre: null,
      primer_apellido: partes[1]!,
      segundo_apellido: null,
      email,
      avatar_url: null,
    };
  }
  if (partes.length === 3) {
    return {
      primer_nombre: partes[0]!,
      segundo_nombre: null,
      primer_apellido: partes[1]!,
      segundo_apellido: partes[2]!,
      email,
      avatar_url: null,
    };
  }
  if (partes.length === 4) {
    return {
      primer_nombre: partes[0]!,
      segundo_nombre: partes[1]!,
      primer_apellido: partes[2]!,
      segundo_apellido: partes[3]!,
      email,
      avatar_url: null,
    };
  }
  return {
    primer_nombre: partes[0]!,
    segundo_nombre: partes[1]!,
    primer_apellido: partes.slice(2, -1).join(' '),
    segundo_apellido: partes[partes.length - 1]!,
    email,
    avatar_url: null,
  };
}
