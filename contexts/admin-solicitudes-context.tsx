import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { MOCK_SOLICITUDES } from '@/data/mock-admin-dashboard';
import type { ResultadoRevisionSolicitud, SolicitudSoporteVista } from '@/models';

type AdminSolicitudesContextValue = {
  solicitudes: SolicitudSoporteVista[];
  getSolicitud: (id: number) => SolicitudSoporteVista | undefined;
  resolverSolicitud: (
    id: number,
    resultado: ResultadoRevisionSolicitud,
    motivo: string
  ) => boolean;
};

const AdminSolicitudesContext = createContext<AdminSolicitudesContextValue | null>(null);

export function AdminSolicitudesProvider({ children }: { children: ReactNode }) {
  const [solicitudes, setSolicitudes] = useState<SolicitudSoporteVista[]>(() => [
    ...MOCK_SOLICITUDES,
  ]);

  const getSolicitud = useCallback(
    (id: number) => solicitudes.find((s) => s.id === id),
    [solicitudes],
  );

  const resolverSolicitud = useCallback(
    (id: number, resultado: ResultadoRevisionSolicitud, motivo: string): boolean => {
      const m = motivo.trim();
      if (m.length < 4) return false;
      const now = new Date().toISOString();
      setSolicitudes((prev) =>
        prev.map((s) =>
          s.id === id && s.estado === 'pendiente'
            ? {
                ...s,
                estado: 'resuelta',
                fecha_actualizacion: now,
                resultado_admin: resultado,
                motivo_admin: m,
              }
            : s,
        ),
      );
      return true;
    },
    [],
  );

  const value = useMemo(
    () => ({ solicitudes, getSolicitud, resolverSolicitud }),
    [solicitudes, getSolicitud, resolverSolicitud],
  );

  return (
    <AdminSolicitudesContext.Provider value={value}>{children}</AdminSolicitudesContext.Provider>
  );
}

export function useAdminSolicitudes() {
  const ctx = useContext(AdminSolicitudesContext);
  if (!ctx) {
    throw new Error('useAdminSolicitudes debe usarse dentro de AdminSolicitudesProvider');
  }
  return ctx;
}
