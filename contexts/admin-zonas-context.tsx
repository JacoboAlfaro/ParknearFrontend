import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { MOCK_BLUE_ZONES } from '@/data/mock-admin-dashboard';
import type { ZonaAzulVista } from '@/models';

type AdminZonasContextValue = {
  zonas: ZonaAzulVista[];
  getZona: (id: number) => ZonaAzulVista | undefined;
  addZona: (data: Omit<ZonaAzulVista, 'id'>) => ZonaAzulVista;
  updateZona: (id: number, patch: Partial<ZonaAzulVista>) => void;
};

const AdminZonasContext = createContext<AdminZonasContextValue | null>(null);

export function AdminZonasProvider({ children }: { children: ReactNode }) {
  const [zonas, setZonas] = useState<ZonaAzulVista[]>(() => [...MOCK_BLUE_ZONES]);

  const getZona = useCallback(
    (id: number) => zonas.find((z) => z.id === id),
    [zonas],
  );

  const addZona = useCallback((data: Omit<ZonaAzulVista, 'id'>): ZonaAzulVista => {
    let creada: ZonaAzulVista | null = null;
    setZonas((prev) => {
      const nextId = prev.reduce((m, z) => Math.max(m, z.id), 0) + 1;
      creada = { id: nextId, ...data };
      return [creada, ...prev];
    });
    return creada!;
  }, []);

  const updateZona = useCallback((id: number, patch: Partial<ZonaAzulVista>) => {
    setZonas((prev) => prev.map((z) => (z.id === id ? { ...z, ...patch } : z)));
  }, []);

  const value = useMemo(
    () => ({ zonas, getZona, addZona, updateZona }),
    [zonas, getZona, addZona, updateZona],
  );

  return <AdminZonasContext.Provider value={value}>{children}</AdminZonasContext.Provider>;
}

export function useAdminZonas() {
  const ctx = useContext(AdminZonasContext);
  if (!ctx) {
    throw new Error('useAdminZonas debe usarse dentro de AdminZonasProvider');
  }
  return ctx;
}
