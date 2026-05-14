import { apiJson } from '@/lib/api-fetch';
import type { MarcadorZonaMapa, ZonaAzulVista } from '@/models';
import { tituloListaDesdeIndicaciones } from '@/models';

type ZonaApiResponse = {
  id: number;
  latitud: number | string;
  longitud: number | string;
  indicaciones: string | null;
  capacidad: number;
  capacidad_total: number;
  estado_operacion?: 'operativa' | 'mantenimiento' | 'inactiva';
  precio_cop?: number;
};

function lineaCalleDesdeIndicaciones(indicaciones: string | null): string {
  const lineas = (indicaciones ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  return lineas[1] ?? '';
}

function toNum(v: number | string): number {
  return typeof v === 'string' ? parseFloat(v) : v;
}

function zonaApiAMarcador(z: ZonaApiResponse): MarcadorZonaMapa {
  return {
    id: z.id,
    latitud: toNum(z.latitud),
    longitud: toNum(z.longitud),
    titulo: tituloListaDesdeIndicaciones(z.indicaciones),
    linea_calle: lineaCalleDesdeIndicaciones(z.indicaciones),
    cupos_disponibles: z.capacidad,
    distancia_aprox_km: 0,
    precio_cop: z.precio_cop ?? 0,
  };
}

function zonaApiAVista(z: ZonaApiResponse): ZonaAzulVista {
  return {
    id: z.id,
    latitud: toNum(z.latitud),
    longitud: toNum(z.longitud),
    indicaciones: z.indicaciones,
    capacidad: z.capacidad,
    capacidad_total: z.capacidad_total,
    estado_operacion: z.estado_operacion ?? 'operativa',
  };
}

export async function fetchZonasMarcadores(): Promise<MarcadorZonaMapa[]> {
  const zonas = await apiJson<ZonaApiResponse[]>('/zonas');
  return zonas.map(zonaApiAMarcador);
}

export async function fetchZonasVista(): Promise<ZonaAzulVista[]> {
  const zonas = await apiJson<ZonaApiResponse[]>('/zonas');
  return zonas.map(zonaApiAVista);
}
