export type ZonaAzul = {
  id: number;
  latitud: number;
  longitud: number;
  indicaciones: string | null;
  capacidad: number;
  capacidad_total: number;
};

export type HorarioZona = {
  id_zona: number;
  id_controlador: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
};

export type ZonaAzulVista = ZonaAzul & {
  estado_operacion: 'operativa' | 'mantenimiento' | 'inactiva';
};

export type MarcadorZonaMapa = Pick<ZonaAzul, 'id' | 'latitud' | 'longitud'> & {
  titulo: string;
  linea_calle: string;
  cupos_disponibles: number;
  distancia_aprox_km: number;
  precio_cop: number;
};

export function tituloListaDesdeIndicaciones(indicaciones: string | null): string {
  const t = indicaciones?.trim();
  if (!t) return 'Zona sin indicaciones';
  const line = t.split('\n')[0]?.trim();
  return line && line.length > 0 ? line : 'Zona';
}

export function detalleIndicacionesAdicional(indicaciones: string | null): string | null {
  const t = indicaciones?.trim();
  if (!t) return null;
  const lines = t.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length <= 1) return null;
  return lines.slice(1).join('\n');
}
