import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { ReservaEncargadoVista } from '@/data/mock-encargado-reservas';
import { apiJson } from '@/lib/api-fetch';
import { actualizarEstadoReserva } from '@/lib/reservas-api';

type ConfirmarResult = { ok: true } | { ok: false; message: string };

type EncargadoReservasContextValue = {
  reservas: ReservaEncargadoVista[];
  loading: boolean;
  getReserva: (id: string) => ReservaEncargadoVista | undefined;
  aceptarReserva: (id: string) => Promise<void>;
  rechazarReserva: (id: string) => Promise<void>;
  /** El encargado confirma visualmente que la placa del vehículo es la de la reserva. */
  confirmarLlegadaPlacaCoincide: (id: string) => ConfirmarResult;
  recargar: () => void;
};

const EncargadoReservasContext = createContext<EncargadoReservasContextValue | null>(null);

export function EncargadoReservasProvider({ children }: { children: ReactNode }) {
  const [reservas, setReservas] = useState<ReservaEncargadoVista[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarReservas = useCallback(() => {
    setLoading(true);
    // El bus enruta con el token JWT del encargado.
    // Confirmar con el equipo de backend el path exacto para reservas del encargado.
    apiJson<ReservaEncargadoVista[]>('/reservas')
      .then((data) => setReservas(data))
      .catch(() => setReservas([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    cargarReservas();
  }, [cargarReservas]);

  const getReserva = useCallback(
    (id: string) => reservas.find((r) => String(r.id) === id),
    [reservas],
  );

  const aceptarReserva = useCallback(async (id: string) => {
    const now = new Date().toISOString();
    try {
      await actualizarEstadoReserva(Number(id), 'activa');
    } catch {
      // Si falla el API, actualizamos localmente de todas formas
    }
    setReservas((prev) =>
      prev.map((r) =>
        String(r.id) === id && r.estado === 'pendiente'
          ? { ...r, estado: 'activa' as const, fecha_actualizacion: now }
          : r,
      ),
    );
  }, []);

  const rechazarReserva = useCallback(async (id: string) => {
    const now = new Date().toISOString();
    try {
      await actualizarEstadoReserva(Number(id), 'cancelada');
    } catch {
      // Si falla el API, actualizamos localmente de todas formas
    }
    setReservas((prev) =>
      prev.map((r) =>
        String(r.id) === id && r.estado === 'pendiente'
          ? { ...r, estado: 'cancelada' as const, fecha_actualizacion: now }
          : r,
      ),
    );
  }, []);

  const confirmarLlegadaPlacaCoincide = useCallback(
    (id: string): ConfirmarResult => {
      const r = reservas.find((x) => String(x.id) === id);
      if (!r) {
        return { ok: false, message: 'Reserva no encontrada.' };
      }
      if (r.estado !== 'activa') {
        return {
          ok: false,
          message: 'Solo puedes confirmar llegada en reservas ya aceptadas.',
        };
      }

      const placaRegistro = r.placa_vehiculo.trim().toUpperCase();
      const now = new Date().toISOString();
      setReservas((prev) =>
        prev.map((x) =>
          String(x.id) === id
            ? {
                ...x,
                estado: 'completada' as const,
                fecha_actualizacion: now,
                fecha_confirmacion_llegada: now,
                placa_observada: placaRegistro,
              }
            : x,
        ),
      );
      return { ok: true };
    },
    [reservas],
  );

  const value = useMemo(
    () => ({
      reservas,
      loading,
      getReserva,
      aceptarReserva,
      rechazarReserva,
      confirmarLlegadaPlacaCoincide,
      recargar: cargarReservas,
    }),
    [reservas, loading, getReserva, aceptarReserva, rechazarReserva, confirmarLlegadaPlacaCoincide, cargarReservas],
  );

  return (
    <EncargadoReservasContext.Provider value={value}>{children}</EncargadoReservasContext.Provider>
  );
}

export function useEncargadoReservas() {
  const ctx = useContext(EncargadoReservasContext);
  if (!ctx) {
    throw new Error('useEncargadoReservas solo dentro del área encargado');
  }
  return ctx;
}
