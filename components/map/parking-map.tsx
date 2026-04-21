import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, type Region } from 'react-native-maps';

import type { ParkingMapMarker } from '@/data/mock-parking-markers';
import type { UserMapCoords } from '@/hooks/use-user-map-location';
import { regionFromMarkers } from '@/lib/map-region';

const MARKER_BLUE = '#1d4ed8';
const MARKER_LOW = '#ca8a04';
const MARKER_FULL = '#64748b';

const PIN_SIZE = 42;
const LOW_SPOTS_THRESHOLD = 3;

const USER_REGION_DELTA = 0.025;

const ROUTE_STROKE = '#2563eb';
const ROUTE_WIDTH = 5;

type MarkerAvailability = 'ok' | 'low' | 'none';

function markerAvailability(cuposDisponibles: number): MarkerAvailability {
  if (cuposDisponibles <= 0) return 'none';
  if (cuposDisponibles <= LOW_SPOTS_THRESHOLD) return 'low';
  return 'ok';
}

function markerA11yLabel(m: ParkingMapMarker): string {
  const tier = markerAvailability(m.cupos_disponibles);
  const spots =
    tier === 'none'
      ? 'sin cupos disponibles'
      : tier === 'low'
        ? `pocos cupos, ${m.cupos_disponibles} disponibles`
        : `${m.cupos_disponibles} cupos disponibles`;
  return `Zona: ${m.linea_calle}, ${m.titulo}. ${spots}`;
}

function CarMapPin({ cuposDisponibles }: { cuposDisponibles: number }) {
  const tier = markerAvailability(cuposDisponibles);
  const backgroundColor =
    tier === 'none' ? MARKER_FULL : tier === 'low' ? MARKER_LOW : MARKER_BLUE;

  return (
    <View
      style={[styles.pinOuter, { backgroundColor }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <View style={styles.pinInner}>
        <MaterialIcons name="directions-car" size={22} color="#ffffff" />
      </View>
      {tier === 'none' ? <View style={styles.pinSlash} pointerEvents="none" /> : null}
    </View>
  );
}

export type ParkingMapProps = {
  markers: ParkingMapMarker[];
  // Si no se pasa, se calcula a partir de `markers`.
  initialRegion?: Region;
  // Si hay coordenadas se muestra el punto del usuario y el mapa se anima hacia ellas.
  userLocation?: UserMapCoords | null;
  routeToReservedZone?: { latitude: number; longitude: number } | null;
  /** Origen guardado al pagar si el estado del hook aún no tenía coords. */
  routeOriginSnapshot?: UserMapCoords | null;
  onMarkerSelect?: (marker: ParkingMapMarker) => void;
};

export function ParkingMap({
  markers,
  initialRegion,
  userLocation,
  routeToReservedZone,
  routeOriginSnapshot,
  onMarkerSelect,
}: ParkingMapProps) {
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);
  const region = useMemo(
    () =>
      initialRegion ??
      regionFromMarkers(markers.map((m) => ({ latitude: m.latitud, longitude: m.longitud }))),
    [initialRegion, markers]
  );

  const [tracksViews, setTracksViews] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setTracksViews(false), 800);
    return () => clearTimeout(t);
  }, [markers]);

  useEffect(() => {
    if (!userLocation || !mapReady || !mapRef.current) return;

    mapRef.current.animateToRegion(
      {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: USER_REGION_DELTA,
        longitudeDelta: USER_REGION_DELTA,
      },
      650
    );
  }, [userLocation, mapReady]);

  const showUser = Boolean(userLocation);

  const routeCoordinates = useMemo(() => {
    if (!routeToReservedZone) return null;
    const origin = userLocation ?? routeOriginSnapshot ?? null;
    if (!origin) return null;
    return [
      { latitude: origin.latitude, longitude: origin.longitude },
      {
        latitude: routeToReservedZone.latitude,
        longitude: routeToReservedZone.longitude,
      },
    ];
  }, [userLocation, routeOriginSnapshot, routeToReservedZone]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        onMapReady={() => setMapReady(true)}
        showsUserLocation={showUser}
        showsMyLocationButton={false}
        mapType="standard">
        {markers.map((m) => (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.latitud, longitude: m.longitud }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={tracksViews}
            onPress={() => onMarkerSelect?.(m)}
            accessibilityLabel={markerA11yLabel(m)}>
            <CarMapPin cuposDisponibles={m.cupos_disponibles} />
          </Marker>
        ))}
        {routeCoordinates ? (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={ROUTE_STROKE}
            strokeWidth={ROUTE_WIDTH}
            geodesic
            lineCap="round"
            lineJoin="round"
            zIndex={2}
          />
        ) : null}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  pinOuter: {
    width: PIN_SIZE,
    height: PIN_SIZE,
    borderRadius: PIN_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 6,
  },
  pinInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinSlash: {
    position: 'absolute',
    width: PIN_SIZE * 1.35,
    height: 3,
    backgroundColor: '#fecaca',
    top: PIN_SIZE / 2 - 1.5,
    left: PIN_SIZE / 2 - (PIN_SIZE * 1.35) / 2,
    transform: [{ rotate: '-42deg' }],
  },
});
