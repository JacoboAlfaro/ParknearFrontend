import type { Region } from 'react-native-maps';

const PADDING = 1.4;

// Por defecto, se muestra la ciudad de Manizales.
const DEFAULT_REGION: Region = {
  latitude: 5.0689,
  longitude: -75.5174,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export function regionFromMarkers(
  markers: { latitude: number; longitude: number }[]
): Region {
  if (markers.length === 0) {
    return DEFAULT_REGION;
  }

  const lats = markers.map((m) => m.latitude);
  const lngs = markers.map((m) => m.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const midLat = (minLat + maxLat) / 2;
  const midLng = (minLng + maxLng) / 2;
  let latDelta = (maxLat - minLat) * PADDING;
  let lngDelta = (maxLng - minLng) * PADDING;

  latDelta = Math.max(latDelta, 0.025);
  lngDelta = Math.max(lngDelta, 0.025);

  return {
    latitude: midLat,
    longitude: midLng,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
}
