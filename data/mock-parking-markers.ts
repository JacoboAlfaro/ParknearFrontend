export type ParkingMapMarker = {
  id: string;
  title: string;
  streetLine: string;
  latitude: number;
  longitude: number;
  availableSpots: number;
  fallbackDistanceKm: number;
  priceCop: number;
};

export const MOCK_PARKING_MARKERS: ParkingMapMarker[] = [
  {
    id: 'mock-1',
    title: 'Centro · Plaza de Bolívar',
    streetLine: 'Carrera 23',
    latitude: 5.0704,
    longitude: -75.5178,
    availableSpots: 6,
    fallbackDistanceKm: 3.9,
    priceCop: 7000,
  },
  {
    id: 'mock-2',
    title: 'Av. Santander',
    streetLine: 'Calle 67',
    latitude: 5.0625,
    longitude: -75.5095,
    availableSpots: 12,
    fallbackDistanceKm: 2.1,
    priceCop: 6500,
  },
  {
    id: 'mock-3',
    title: 'Palogrande',
    streetLine: 'Carrera 18',
    latitude: 5.0592,
    longitude: -75.4938,
    availableSpots: 0,
    fallbackDistanceKm: 4.5,
    priceCop: 8000,
  },
  {
    id: 'mock-4',
    title: 'Cable La Enea',
    streetLine: 'Calle 50',
    latitude: 5.0425,
    longitude: -75.5065,
    availableSpots: 3,
    fallbackDistanceKm: 5.2,
    priceCop: 7500,
  },
  {
    id: 'mock-5',
    title: 'Milan',
    streetLine: 'Carrera 21',
    latitude: 5.06361,
    longitude: -75.4779,
    availableSpots: 20,
    fallbackDistanceKm: 1.8,
    priceCop: 7000,
  },
  {
    id: 'mock-6',
    title: 'Parque de la 93',
    streetLine: 'Carrera 21',
    latitude: 5.08361,
    longitude: -75.4979,
    availableSpots: 20,
    fallbackDistanceKm: 1.8,
    priceCop: 7000,
  },
  {
    id: 'mock-7',
    title: 'Parque de la 93',
    streetLine: 'Carrera 21',
    latitude: 5.07361,
    longitude: -75.4739,
    availableSpots: 20,
    fallbackDistanceKm: 1.8,
    priceCop: 7000,
  },
];
