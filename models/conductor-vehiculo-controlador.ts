import type { EstadoUsuario } from '@/models/enums';

export type Conductor = {
  id: string;
  puntos_fidelidad: number;
  estado: EstadoUsuario;
};

export type Vehiculo = {
  placa: string;
  id_conductor: string | null;
  marca: string | null;
  color: string | null;
};

export type Controlador = {
  id: string;
  estado: EstadoUsuario | null;
};
