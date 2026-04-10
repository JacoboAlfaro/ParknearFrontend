import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export type UserMapCoords = {
  latitude: number;
  longitude: number;
};


// Pide permiso y obtiene la posición actual, queda null mientras carga o si deniegan permiso o falla el GPS.
export function useUserMapLocation() {
  const [coords, setCoords] = useState<UserMapCoords | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (cancelled || status !== 'granted') {
          return;
        }

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (cancelled) return;

        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      } catch {
        // permiso denegado o falla el GPS.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return coords;
}
