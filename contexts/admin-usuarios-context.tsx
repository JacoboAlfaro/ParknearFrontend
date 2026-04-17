import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  INITIAL_ADMIN_USUARIOS,
  newUsuarioId,
  type EstadoUsuario,
  type UsuarioConRol,
} from '@/data/admin-usuarios';
import type { UserRole } from '@/data/mock-users';
import { partirNombreCompuesto } from '@/models';

export type AddUsuarioInput = {
  documento_identidad: string;
  nombres: string;
  apellidos: string;
  email: string;
  contrasena: string;
  celular: string;
  estado: EstadoUsuario;
  rol: UserRole;
};

type AdminUsuariosContextValue = {
  usuarios: UsuarioConRol[];
  addUsuario: (input: AddUsuarioInput) => UsuarioConRol;
  setEstado: (id: string, estado: EstadoUsuario) => void;
  setRol: (id: string, rol: UserRole) => void;
  getUsuario: (id: string) => UsuarioConRol | undefined;
};

const AdminUsuariosContext = createContext<AdminUsuariosContextValue | null>(null);

export function AdminUsuariosProvider({ children }: { children: ReactNode }) {
  const [usuarios, setUsuarios] = useState<UsuarioConRol[]>(() => [...INITIAL_ADMIN_USUARIOS]);

  const addUsuario = useCallback((input: AddUsuarioInput) => {
    const now = new Date().toISOString();
    const n = partirNombreCompuesto(input.nombres);
    const a = partirNombreCompuesto(input.apellidos);
    const nuevo: UsuarioConRol = {
      id: newUsuarioId(),
      documento_identidad: input.documento_identidad,
      primer_nombre: n.primero,
      segundo_nombre: n.segundo,
      primer_apellido: a.primero,
      segundo_apellido: a.segundo,
      email: input.email,
      contrasena: input.contrasena,
      celular: input.celular,
      estado: input.estado,
      fecha_creacion: now,
      fecha_actualizacion: now,
      rol: input.rol,
    };
    setUsuarios((prev) => [nuevo, ...prev]);
    return nuevo;
  }, []);

  const setEstado = useCallback((id: string, estado: EstadoUsuario) => {
    const now = new Date().toISOString();
    setUsuarios((prev) =>
      prev.map((u) => (u.id === id ? { ...u, estado, fecha_actualizacion: now } : u)),
    );
  }, []);

  const setRol = useCallback((id: string, rol: UserRole) => {
    const now = new Date().toISOString();
    setUsuarios((prev) =>
      prev.map((u) => (u.id === id ? { ...u, rol, fecha_actualizacion: now } : u)),
    );
  }, []);

  const getUsuario = useCallback(
    (id: string) => usuarios.find((u) => u.id === id),
    [usuarios],
  );

  const value = useMemo(
    () => ({ usuarios, addUsuario, setEstado, setRol, getUsuario }),
    [usuarios, addUsuario, setEstado, setRol, getUsuario],
  );

  return (
    <AdminUsuariosContext.Provider value={value}>{children}</AdminUsuariosContext.Provider>
  );
}

export function useAdminUsuarios() {
  const ctx = useContext(AdminUsuariosContext);
  if (!ctx) {
    throw new Error('useAdminUsuarios debe usarse dentro de AdminUsuariosProvider');
  }
  return ctx;
}
