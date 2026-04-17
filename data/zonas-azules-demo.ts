import type { MarcadorZonaMapa, ZonaAzulVista } from '@/models';
import { tituloListaDesdeIndicaciones } from '@/models';

/** Zona con datos extra usados solo al armar el marcador del mapa. */
type ZonaFuenteMapa = ZonaAzulVista & {
  precio_cop: number;
  distancia_aprox_km: number;
};

const ZONAS_FUENTE: ZonaFuenteMapa[] = [
  {
    id: 1,
    latitud: 5.0704,
    longitud: -75.5178,
    indicaciones:
      'Centro · Plaza de Bolívar\nCarrera 23\nCra. 23 #65-10, Centro, Manizales.\nIngreso peatonal junto a la plaza.',
    capacidad: 6,
    capacidad_total: 45,
    estado_operacion: 'operativa',
    precio_cop: 7000,
    distancia_aprox_km: 3.9,
  },
  {
    id: 2,
    latitud: 5.0625,
    longitud: -75.5095,
    indicaciones: 'Av. Santander\nCalle 67\nAv. Kevin Ángel, frente al Cable, Manizales.',
    capacidad: 12,
    capacidad_total: 28,
    estado_operacion: 'mantenimiento',
    precio_cop: 6500,
    distancia_aprox_km: 2.1,
  },
  {
    id: 3,
    latitud: 5.0592,
    longitud: -75.4938,
    indicaciones: 'Palogrande\nCarrera 18\nCalle 68, sector norte Palogrande, Manizales.',
    capacidad: 0,
    capacidad_total: 60,
    estado_operacion: 'operativa',
    precio_cop: 8000,
    distancia_aprox_km: 4.5,
  },
  {
    id: 4,
    latitud: 5.0425,
    longitud: -75.5065,
    indicaciones: 'Cable La Enea\nCalle 50\nSector Cable a La Enea, Manizales.',
    capacidad: 3,
    capacidad_total: 24,
    estado_operacion: 'operativa',
    precio_cop: 7500,
    distancia_aprox_km: 5.2,
  },
  {
    id: 5,
    latitud: 5.06361,
    longitud: -75.4779,
    indicaciones: 'Milan\nCarrera 21\nZona Milan, Manizales.',
    capacidad: 20,
    capacidad_total: 55,
    estado_operacion: 'operativa',
    precio_cop: 7000,
    distancia_aprox_km: 1.8,
  },
  {
    id: 6,
    latitud: 5.08361,
    longitud: -75.4979,
    indicaciones: 'Parque de la 93\nCarrera 21\nSector norte, frente al parque.',
    capacidad: 20,
    capacidad_total: 50,
    estado_operacion: 'operativa',
    precio_cop: 7000,
    distancia_aprox_km: 1.8,
  },
  {
    id: 7,
    latitud: 5.07361,
    longitud: -75.4739,
    indicaciones: 'Parque de la 93\nCarrera 21\nSector oriente, frente al parque.',
    capacidad: 20,
    capacidad_total: 50,
    estado_operacion: 'operativa',
    precio_cop: 7000,
    distancia_aprox_km: 1.8,
  },
];

function lineaCalleDesdeIndicaciones(indicaciones: string | null): string {
  const lineas = (indicaciones ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  return lineas[1] ?? '';
}

function marcadorDesdeZona(z: ZonaFuenteMapa): MarcadorZonaMapa {
  return {
    id: z.id,
    latitud: z.latitud,
    longitud: z.longitud,
    titulo: tituloListaDesdeIndicaciones(z.indicaciones),
    linea_calle: lineaCalleDesdeIndicaciones(z.indicaciones),
    cupos_disponibles: z.capacidad,
    distancia_aprox_km: z.distancia_aprox_km,
    precio_cop: z.precio_cop,
  };
}

export const MOCK_BLUE_ZONES: ZonaAzulVista[] = ZONAS_FUENTE.map(
  ({ precio_cop: _p, distancia_aprox_km: _d, ...zona }) => zona,
);

export const MOCK_PARKING_MARKERS: MarcadorZonaMapa[] = ZONAS_FUENTE.map(marcadorDesdeZona);
