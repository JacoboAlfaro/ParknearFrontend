import type { Usuario } from '@/models/usuario';

export function nombreCompletoUsuario(
  u: Pick<Usuario, 'primer_nombre' | 'segundo_nombre' | 'primer_apellido' | 'segundo_apellido'>
): string {
  const nombres = [u.primer_nombre, u.segundo_nombre].filter(Boolean).join(' ');
  const apellidos = [u.primer_apellido, u.segundo_apellido].filter(Boolean).join(' ');
  return [nombres, apellidos].filter(Boolean).join(' ').trim() || 'Usuario';
}

export function partirNombreCompuesto(valor: string): { primero: string; segundo: string | null } {
  const partes = valor.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return { primero: '', segundo: null };
  if (partes.length === 1) return { primero: partes[0]!, segundo: null };
  return { primero: partes[0]!, segundo: partes.slice(1).join(' ') };
}
