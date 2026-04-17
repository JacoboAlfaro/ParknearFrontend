import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { findWhitelistedUser, type UserRole } from '@/data/mock-users';

export type SessionUser = {
  document: string;
  role: UserRole;
  displayName: string;
  email: string;
};

export type SignInResult =
  | { ok: true; role: UserRole }
  | { ok: false; message: string };

type AuthContextValue = {
  user: SessionUser | null;
  signIn: (document: string, password: string) => SignInResult;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);

  const signIn = useCallback((document: string, password: string): SignInResult => {
    const found = findWhitelistedUser(document, password);
    if (!found) {
      return {
        ok: false,
        message: 'Usuario o contraseña incorrectos.',
      };
    }
    setUser({
      document: found.document,
      role: found.role,
      displayName: found.displayName,
      email: (found.email ?? `${found.document}@parknear.app`).toLowerCase(),
    });
    return { ok: true, role: found.role };
  }, []);

  const signOut = useCallback(() => setUser(null), []);

  const value = useMemo(
    () => ({ user, signIn, signOut }),
    [user, signIn, signOut]
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
