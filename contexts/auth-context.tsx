import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { UserRole } from '@/data/mock-users';
import { ApiHttpError, apiJson, setApiAuthTokenGetter } from '@/lib/api-fetch';
import { tokenStorage } from '@/lib/token-storage';

export type SessionUser = {
  id: string;
  document: string;
  role: UserRole;
  displayName: string;
  email: string;
};

export type SignInResult =
  | { ok: true; role: UserRole }
  | { ok: false; message: string };

export type SignUpInput = {
  documento_identidad: string;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  email: string;
  contrasena: string;
  celular: string;
};

type AuthContextValue = {
  user: SessionUser | null;
  initialized: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signUp: (input: SignUpInput) => Promise<SignInResult>;
  signOut: () => Promise<void>;
};

type AuthApiResponse = {
  user: {
    id_usuario?: string;
    documento_identidad?: string;
    primer_nombre?: string;
    segundo_nombre?: string | null;
    primer_apellido?: string;
    segundo_apellido?: string | null;
    email?: string;
    tipo_usuario?: string | null;
  };
  access_token: string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Module-level variable so the getter closure always returns the latest token
let tokenInMemory: string | null = null;

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    const payloadB64 = parts[1];
    if (!payloadB64) return null;
    const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '==='.slice((base64.length + 3) % 4);
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function mapTipoUsuario(tipo: unknown): UserRole | null {
  if (tipo === 'conductor') return 'conductor';
  if (tipo === 'controlador') return 'encargado';
  if (tipo === 'admin') return 'admin';
  return null;
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  return Date.now() / 1000 > payload.exp;
}

function sessionFromApiResponse(data: AuthApiResponse): SessionUser | null {
  const payload = decodeJwtPayload(data.access_token);
  const tipo = data.user.tipo_usuario ?? payload?.tipo_usuario;
  const role = mapTipoUsuario(tipo);
  if (!role) return null;

  const nombres = [data.user.primer_nombre, data.user.segundo_nombre].filter(Boolean).join(' ');
  const apellidos = [data.user.primer_apellido, data.user.segundo_apellido].filter(Boolean).join(' ');
  const displayName = [nombres, apellidos].filter(Boolean).join(' ').trim() || data.user.email || 'Usuario';

  return {
    id: (payload?.sub as string | undefined) ?? data.user.id_usuario ?? '',
    document: data.user.documento_identidad ?? '',
    role,
    displayName,
    email: data.user.email ?? '',
  };
}

function sessionFromToken(token: string): SessionUser | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  const role = mapTipoUsuario(payload.tipo_usuario);
  if (!role) return null;
  return {
    id: (payload.sub as string | undefined) ?? '',
    document: (payload.documento_identidad as string | undefined) ?? '',
    role,
    displayName: (payload.nombre_completo as string | undefined) ?? (payload.email as string | undefined) ?? 'Usuario',
    email: (payload.email as string | undefined) ?? '',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setApiAuthTokenGetter(() => tokenInMemory);
    return () => setApiAuthTokenGetter(null);
  }, []);

  // Restore session from persisted token on app start
  useEffect(() => {
    tokenStorage.get().then((stored) => {
      if (stored && !isTokenExpired(stored)) {
        tokenInMemory = stored;
        const restored = sessionFromToken(stored);
        if (restored) setUser(restored);
      } else if (stored) {
        tokenStorage.delete();
      }
      setInitialized(true);
    });
  }, []);

  const applyAuthResponse = useCallback(async (data: AuthApiResponse): Promise<SignInResult> => {
    const session = sessionFromApiResponse(data);
    if (!session) {
      return { ok: false, message: 'Rol de usuario no reconocido. Contacta al administrador.' };
    }
    tokenInMemory = data.access_token;
    await tokenStorage.set(data.access_token);
    setUser(session);
    return { ok: true, role: session.role };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<SignInResult> => {
    setLoading(true);
    try {
      const data = await apiJson<AuthApiResponse>('/auth/login', {
        method: 'POST',
        json: { email, contrasena: password },
      });
      return await applyAuthResponse(data);
    } catch (err) {
      if (err instanceof ApiHttpError) {
        if (err.status === 401 || err.status === 403) {
          return { ok: false, message: 'Correo o contraseña incorrectos.' };
        }
        return { ok: false, message: `Error del servidor (${err.status}).` };
      }
      return { ok: false, message: 'Sin conexión. Verifica tu internet.' };
    } finally {
      setLoading(false);
    }
  }, [applyAuthResponse]);

  const signUp = useCallback(async (input: SignUpInput): Promise<SignInResult> => {
    setLoading(true);
    try {
      const data = await apiJson<AuthApiResponse>('/auth/register', {
        method: 'POST',
        json: {
          documento_identidad: input.documento_identidad,
          primer_nombre: input.primer_nombre,
          segundo_nombre: input.segundo_nombre ?? undefined,
          primer_apellido: input.primer_apellido,
          segundo_apellido: input.segundo_apellido ?? undefined,
          email: input.email,
          contrasena: input.contrasena,
          celular: input.celular,
        },
      });
      return await applyAuthResponse(data);
    } catch (err) {
      if (err instanceof ApiHttpError) {
        if (err.status === 409) {
          return { ok: false, message: 'Ya existe una cuenta con ese correo o documento.' };
        }
        if (err.status === 400) {
          return { ok: false, message: 'Datos inválidos. Revisa los campos ingresados.' };
        }
        return { ok: false, message: `Error del servidor (${err.status}).` };
      }
      return { ok: false, message: 'Sin conexión. Verifica tu internet.' };
    } finally {
      setLoading(false);
    }
  }, [applyAuthResponse]);

  const signOut = useCallback(async () => {
    tokenInMemory = null;
    setUser(null);
    await tokenStorage.delete();
  }, []);

  const value = useMemo(
    () => ({ user, initialized, loading, signIn, signUp, signOut }),
    [user, initialized, loading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
}
