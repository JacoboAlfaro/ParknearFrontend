import type { EstadoUsuario } from '@/models/enums';

/**
 * Pruebas: documento 1 + 123 → admin; 2 + 123 → encargado; 3 + 123 → conductor.
 * Alias: admin, encargado, conductor (misma contraseña).
 */
export type UserRole = 'admin' | 'encargado' | 'conductor';

export type MockUserRecord = {
  id_usuario: string;
  document: string;
  password: string;
  role: UserRole;
  displayName: string;
  loginAliases?: string[];
  email?: string;
  celular?: string;
  estado?: EstadoUsuario;
};

export const MOCK_USERS_WHITELIST: MockUserRecord[] = [
  {
    id_usuario: '550e8400-e29b-41d4-a716-446655440099',
    document: '1',
    loginAliases: ['admin'],
    password: '123',
    role: 'admin',
    displayName: 'Administrador',
    email: 'admin@parknear.app',
    celular: '3000100001',
    estado: 'activo',
  },
  {
    id_usuario: '550e8400-e29b-41d4-a716-446655440002',
    document: '2',
    loginAliases: ['encargado'],
    password: '123',
    role: 'encargado',
    displayName: 'Encargado',
    email: 'encargado@parknear.app',
    celular: '3000100002',
    estado: 'activo',
  },
  {
    id_usuario: '550e8400-e29b-41d4-a716-446655440001',
    document: '3',
    loginAliases: ['conductor'],
    password: '123',
    role: 'conductor',
    displayName: 'Conductor',
    email: 'conductor@parknear.app',
    celular: '3000100003',
    estado: 'activo',
  },
];

function loginMatchesRecord(u: MockUserRecord, docTrim: string, docLower: string): boolean {
  if (u.document === docTrim) return true;
  const aliases = u.loginAliases ?? [];
  return aliases.some((a) => a.toLowerCase() === docLower);
}

export function findWhitelistedUser(
  document: string,
  password: string
): MockUserRecord | null {
  const docTrim = document.trim();
  const docLower = docTrim.toLowerCase();
  const passTrim = password.trim();

  const match = MOCK_USERS_WHITELIST.find(
    (u) => u.password === passTrim && loginMatchesRecord(u, docTrim, docLower)
  );
  return match ?? null;
}
