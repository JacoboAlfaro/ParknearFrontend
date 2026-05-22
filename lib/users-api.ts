import { ApiHttpError, apiJson } from '@/lib/api-fetch';

export type RegistrarVehiculoInput = {
  placa: string;
  marca?: string;
  color?: string;
};

// POST /users/:documento/vehiculo (Peticion a ParkNear para registrar un vehiculo)
export async function registrarVehiculoConductor(
  documentoIdentidad: string,
  input: RegistrarVehiculoInput,
): Promise<void> {
  const doc = documentoIdentidad.trim();
  if (!doc) {
    throw new Error('Falta el documento del conductor.');
  }
  const placa = input.placa.trim().toUpperCase();
  await apiJson(`/users/${encodeURIComponent(doc)}/vehiculo`, {
    method: 'POST',
    json: {
      placa,
      marca: input.marca?.trim() || 'N/A',
      color: input.color?.trim() || 'N/A',
    },
  });
}

// Placa ya registrada (puede continuar el flujo de reserva)
export function esVehiculoYaRegistrado(err: unknown): boolean {
  if (err instanceof ApiHttpError) {
    if (err.status === 409) return true;
    try {
      const body = JSON.parse(err.bodyText) as { message?: string };
      return /ya existe.*placa/i.test(String(body.message ?? ''));
    } catch {
      return /ya existe.*placa/i.test(err.bodyText);
    }
  }
  return false;
}
