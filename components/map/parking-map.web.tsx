import { Text, View } from 'react-native';

import type { ParkingMapMarker } from '@/data/mock-parking-markers';
import type { UserMapCoords } from '@/hooks/use-user-map-location';

export type ParkingMapProps = {
  markers: ParkingMapMarker[];
  userLocation?: UserMapCoords | null;
  routeToReservedZone?: { latitude: number; longitude: number } | null;
  routeOriginSnapshot?: UserMapCoords | null;
  onMarkerSelect?: (marker: ParkingMapMarker) => void;
};

// Muestra un resumen hasta integrar Maps JavaScript API o una vista solo móvil.
export function ParkingMap({
  markers,
  userLocation,
  routeToReservedZone,
  routeOriginSnapshot,
}: ParkingMapProps) {
  return (
    <View className="flex-1 items-center justify-center bg-pn-sky-fade px-6">
      <Text className="text-center text-base font-medium text-pn-navy">
        El mapa con Google Maps está pensado para iOS y Android.
      </Text>
      <Text className="mt-3 text-center text-sm text-pn-navy/75">
        Hay {markers.length} ubicaciones de ejemplo listas.
      </Text>
      {userLocation ? (
        <Text className="mt-4 text-center text-xs text-pn-navy/60">
          Ubicación detectada (web): {userLocation.latitude.toFixed(5)},{' '}
          {userLocation.longitude.toFixed(5)}
        </Text>
      ) : null}
      {routeToReservedZone ? (
        <Text className="mt-2 text-center text-xs text-pn-navy/50">
          Ruta simulada (solo en app nativa): destino {routeToReservedZone.latitude.toFixed(4)},{' '}
          {routeToReservedZone.longitude.toFixed(4)}
          {routeOriginSnapshot
            ? ` · origen ${routeOriginSnapshot.latitude.toFixed(4)}, ${routeOriginSnapshot.longitude.toFixed(4)}`
            : ''}
        </Text>
      ) : null}
    </View>
  );
}
