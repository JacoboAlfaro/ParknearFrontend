import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { ParkingMapMarker } from '@/data/mock-parking-markers';
import type { UserMapCoords } from '@/hooks/use-user-map-location';

const FIFTEEN_MIN_MS = 15 * 60 * 1000;

export type ActiveReservationState = {
  endTime: number;
  lineaCalle: string;
  distanceKm: number;
  zonaLatitud: number;
  zonaLongitud: number;
  origenLatitud?: number;
  origenLongitud?: number;
};

type Ctx = {
  active: ActiveReservationState | null;
  secondsLeft: number;
  hasActiveReservation: boolean;
  startReservation: (
    marker: ParkingMapMarker,
    distanceKm: number,
    origenUsuario: UserMapCoords | null,
  ) => void;
};

const ActiveReservationContext = createContext<Ctx | null>(null);

function formatMmSs(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

export function ActiveReservationProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ActiveReservationState | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!active) return;

    const id = setInterval(() => {
      setTick((t) => t + 1);
      if (Date.now() >= active.endTime) {
        setActive(null);
      }
    }, 1000);

    return () => clearInterval(id);
  }, [active]);

  const secondsLeft = useMemo(() => {
    if (!active) return 0;
    return Math.max(0, Math.ceil((active.endTime - Date.now()) / 1000));
  }, [active, tick]);

  const startReservation = useCallback(
    (marker: ParkingMapMarker, distanceKm: number, origenUsuario: UserMapCoords | null) => {
      const base: ActiveReservationState = {
        endTime: Date.now() + FIFTEEN_MIN_MS,
        lineaCalle: marker.linea_calle,
        distanceKm,
        zonaLatitud: marker.latitud,
        zonaLongitud: marker.longitud,
      };
      if (origenUsuario) {
        base.origenLatitud = origenUsuario.latitude;
        base.origenLongitud = origenUsuario.longitude;
      }
      setActive(base);
    },
    [],
  );

  const value = useMemo<Ctx>(
    () => ({
      active,
      secondsLeft,
      hasActiveReservation: active !== null && secondsLeft > 0,
      startReservation,
    }),
    [active, secondsLeft, startReservation]
  );

  return (
    <ActiveReservationContext.Provider value={value}>{children}</ActiveReservationContext.Provider>
  );
}

export function useActiveReservation(): Ctx {
  const ctx = useContext(ActiveReservationContext);
  if (!ctx) {
    throw new Error('useActiveReservation debe usarse dentro de ActiveReservationProvider');
  }
  return ctx;
}

export { formatMmSs };
