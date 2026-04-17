import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useEncargadoReservas } from '@/contexts/encargado-reservas-context';
import {
  ESTADO_RESERVA_LABELS,
  ventanaReservaLegible,
  type ReservaEncargadoVista,
} from '@/data/mock-encargado-reservas';
import type { EstadoReserva } from '@/models';

const statusBadge: Record<EstadoReserva, string> = {
  pendiente: 'bg-amber-500/25 text-amber-950',
  activa: 'bg-sky-500/25 text-sky-950',
  cancelada: 'bg-red-500/15 text-red-900',
  completada: 'bg-emerald-500/20 text-emerald-900',
};

function sortReservas(list: ReservaEncargadoVista[]): ReservaEncargadoVista[] {
  const order: Record<EstadoReserva, number> = {
    pendiente: 0,
    activa: 1,
    cancelada: 2,
    completada: 3,
  };
  return [...list].sort((a, b) => order[a.estado] - order[b.estado]);
}

export default function EncargadoReservasScreen() {
  const { reservas, aceptarReserva, rechazarReserva } = useEncargadoReservas();
  const sorted = sortReservas(reservas);

  const goDetail = (id: number) => {
    router.push(`/encargado/reserva/${id}`);
  };

  const onAceptar = (r: ReservaEncargadoVista) => {
    Alert.alert('Aceptar reserva', `¿Confirmas la reserva de ${r.nombre_conductor}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Aceptar',
        onPress: () => aceptarReserva(String(r.id)),
      },
    ]);
  };

  const onRechazar = (r: ReservaEncargadoVista) => {
    Alert.alert('Rechazar reserva', `¿Rechazar la solicitud de ${r.nombre_conductor}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Rechazar',
        style: 'destructive',
        onPress: () => rechazarReserva(String(r.id)),
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-pn-sky-fade" edges={['bottom']}>
      <ScrollView
        className="flex-1 px-5 pt-2"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}>
        <Text className="text-sm text-pn-navy/65">
          Las solicitudes pendientes puedes aceptarlas o rechazarlas. Las aceptadas se completan cuando
          confirmas que la placa del vehículo coincide con la de la reserva.
        </Text>

        {sorted.map((r) => (
          <View
            key={r.id}
            className="mt-3 overflow-hidden rounded-2xl border border-white/55 bg-white/95 shadow-sm shadow-pn-navy/8">
            <Pressable onPress={() => goDetail(r.id)} className="p-4 active:bg-pn-sky-fade/40">
              <View className="flex-row flex-wrap items-center justify-between gap-2">
                <Text className="text-xs font-semibold uppercase tracking-wide text-pn-navy/45">
                  {r.nombre_zona}
                </Text>
                <View className={`rounded-full px-2.5 py-1 ${statusBadge[r.estado]}`}>
                  <Text className="text-xs font-bold">{ESTADO_RESERVA_LABELS[r.estado]}</Text>
                </View>
              </View>
              <Text className="mt-2 text-lg font-bold text-pn-navy">{r.nombre_conductor}</Text>
              <Text className="text-sm text-pn-navy/60">CC {r.documento_conductor}</Text>
              <Text className="mt-2 text-sm text-pn-navy">
                Placa <Text className="font-bold text-blue-800">{r.placa_vehiculo}</Text>
                <Text className="text-pn-navy/65"> · reserva en la zona</Text>
              </Text>
              <Text className="mt-1 text-sm text-pn-navy/55">{ventanaReservaLegible(r)}</Text>
              <Text className="mt-3 text-center text-xs font-medium text-pn-navy/45">
                Toca para abrir detalle
              </Text>
            </Pressable>
            {r.estado === 'pendiente' ? (
              <View className="flex-row gap-3 border-t border-pn-border/30 px-4 pb-4 pt-3">
                <Pressable
                  onPress={() => onAceptar(r)}
                  className="flex-1 items-center rounded-xl bg-emerald-600 py-3 active:opacity-90">
                  <Text className="font-bold text-white">Aceptar</Text>
                </Pressable>
                <Pressable
                  onPress={() => onRechazar(r)}
                  className="flex-1 items-center rounded-xl border border-red-400/80 bg-red-500/10 py-3 active:opacity-90">
                  <Text className="font-bold text-red-800">Rechazar</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
