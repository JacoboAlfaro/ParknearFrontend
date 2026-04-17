import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  INITIAL_ENCARGADO_RESERVAS,
  type ReservaEncargadoVista,
} from '@/data/mock-encargado-reservas';

type ConfirmarResult = { ok: true } | { ok: false; message: string };

type EncargadoReservasContextValue = {
  reservas: ReservaEncargadoVista[];
  getReserva: (id: string) => ReservaEncargadoVista | undefined;
  aceptarReserva: (id: string) => void;
  rechazarReserva: (id: string) => void;
  /** El encargado confirma visualmente que la placa del vehículo es la de la reserva. */
  confirmarLlegadaPlacaCoincide: (id: string) => ConfirmarResult;
};

const EncargadoReservasContext = createContext<EncargadoReservasContextValue | null>(null);

export function EncargadoReservasProvider({ children }: { children: ReactNode }) {
  const [reservas, setReservas] = useState<ReservaEncargadoVista[]>(() => [
    ...INITIAL_ENCARGADO_RESERVAS,
  ]);

  const getReserva = useCallback(
    (id: string) => reservas.find((r) => String(r.id) === id),
    [reservas],
  );

  const aceptarReserva = useCallback((id: string) => {
    const now = new Date().toISOString();
    setReservas((prev) =>
      prev.map((r) =>
        String(r.id) === id && r.estado === 'pendiente'
          ? { ...r, estado: 'activa' as const, fecha_actualizacion: now }
          : r,
      ),
    );
  }, []);

  const rechazarReserva = useCallback((id: string) => {
    const now = new Date().toISOString();
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
      getReserva,
      aceptarReserva,
      rechazarReserva,
      confirmarLlegadaPlacaCoincide,
    }),
    [reservas, getReserva, aceptarReserva, rechazarReserva, confirmarLlegadaPlacaCoincide],
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
