import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useEncargadoReservas } from '@/contexts/encargado-reservas-context';
import { ESTADO_RESERVA_LABELS, ventanaReservaLegible } from '@/data/mock-encargado-reservas';
import type { EstadoReserva } from '@/models';

const detailBadge: Record<EstadoReserva, string> = {
  pendiente: 'bg-amber-500/25 text-amber-950',
  activa: 'bg-sky-500/25 text-sky-950',
  cancelada: 'bg-red-500/15 text-red-900',
  completada: 'bg-emerald-500/20 text-emerald-900',
};

export default function EncargadoReservaDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getReserva, aceptarReserva, rechazarReserva, confirmarLlegadaPlacaCoincide } =
    useEncargadoReservas();
  const reserva = typeof id === 'string' ? getReserva(id) : undefined;

  if (!reserva) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-pn-sky-fade px-6" edges={['bottom']}>
        <Text className="text-center text-base text-pn-navy">Reserva no encontrada.</Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 rounded-xl bg-pn-navy px-6 py-3 active:opacity-90">
          <Text className="font-semibold text-white">Volver</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const onAceptar = () => {
    Alert.alert('Aceptar reserva', `¿Confirmas la reserva de ${reserva.nombre_conductor}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Aceptar', onPress: () => aceptarReserva(String(reserva.id)) },
    ]);
  };

  const onRechazar = () => {
    Alert.alert('Rechazar reserva', `¿Rechazar la solicitud de ${reserva.nombre_conductor}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Rechazar',
        style: 'destructive',
        onPress: () => rechazarReserva(String(reserva.id)),
      },
    ]);
  };

  const onPlacaCoincide = () => {
    const result = confirmarLlegadaPlacaCoincide(String(reserva.id));
    if (!result.ok) {
      Alert.alert('No se pudo confirmar', result.message);
      return;
    }
    Alert.alert('Llegada confirmada', 'Se registró que la placa del vehículo coincide con la reserva.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const onPlacaNoCoincide = () => {
    Alert.alert(
      'Placa distinta',
      'No se completó la reserva. Revisa con el conductor o la documentación del vehículo; si hace falta, pide una corrección en la app antes de volver a intentar.',
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Detalle reserva' }} />
      <SafeAreaView className="flex-1 bg-pn-sky-fade" edges={['bottom']}>
        <ScrollView
          className="flex-1 px-5 pt-2"
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className={`self-start rounded-full px-3 py-1 ${detailBadge[reserva.estado]}`}>
            <Text className="text-xs font-bold">{ESTADO_RESERVA_LABELS[reserva.estado]}</Text>
          </View>

          <Text className="mt-4 text-xl font-bold text-pn-navy">{reserva.nombre_conductor}</Text>
          <Text className="text-sm text-pn-navy/65">Documento {reserva.documento_conductor}</Text>

          <View className="mt-6 rounded-2xl border border-white/55 bg-white/95 p-4">
            <Row label="Zona azul" value={reserva.nombre_zona} />
            <Row label="Ubicación" value="Dentro de la zona azul (sin puesto numerado)" />
            <Row label="Ventana" value={ventanaReservaLegible(reserva)} />
            <Row label="Precio (COP)" value={reserva.precio.toLocaleString('es-CO')} />
            <Row label="Placa en reserva" value={reserva.placa_vehiculo} emphasize />
          </View>

          {reserva.estado === 'pendiente' ? (
            <View className="mt-6 gap-3">
              <Text className="text-sm font-medium text-pn-navy/70">
                Revisa los datos y decide si aceptas o rechazas esta solicitud.
              </Text>
              <Pressable
                onPress={onAceptar}
                className="items-center rounded-2xl bg-emerald-600 py-4 active:opacity-90">
                <Text className="text-base font-bold text-white">Aceptar reserva</Text>
              </Pressable>
              <Pressable
                onPress={onRechazar}
                className="items-center rounded-2xl border-2 border-red-500/70 bg-red-500/10 py-4 active:opacity-90">
                <Text className="text-base font-bold text-red-800">Rechazar reserva</Text>
              </Pressable>
            </View>
          ) : null}

          {reserva.estado === 'activa' ? (
            <View className="mt-6 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4">
              <Text className="text-base font-bold text-pn-navy">Confirmar llegada del vehículo</Text>
              <Text className="mt-2 text-sm leading-5 text-pn-navy/75">
                Con el vehículo en la zona azul, comprueba la placa frente a la reserva y responde:
              </Text>
              <View className="mt-4 rounded-xl border border-sky-600/25 bg-white/90 py-4">
                <Text className="text-center text-xs font-semibold uppercase tracking-wide text-pn-navy/50">
                  Placa en esta reserva
                </Text>
                <Text className="mt-1 text-center text-2xl font-bold tracking-wider text-blue-900">
                  {reserva.placa_vehiculo}
                </Text>
              </View>
              <Text className="mt-4 text-center text-sm font-medium text-pn-navy/80">
                ¿Es la misma placa que ves en el vehículo?
              </Text>
              <Pressable
                onPress={onPlacaCoincide}
                className="mt-4 items-center rounded-2xl bg-emerald-600 py-4 active:opacity-90">
                <Text className="text-base font-bold text-white">Sí, coincide</Text>
              </Pressable>
              <Pressable
                onPress={onPlacaNoCoincide}
                className="mt-3 items-center rounded-2xl border-2 border-amber-600/55 bg-amber-500/12 py-4 active:opacity-90">
                <Text className="text-base font-bold text-amber-950">No, es otra placa</Text>
              </Pressable>
            </View>
          ) : null}

          {reserva.estado === 'cancelada' ? (
            <Text className="mt-6 text-center text-sm text-pn-navy/65">
              Esta reserva fue cancelada. No hay acciones disponibles.
            </Text>
          ) : null}

          {reserva.estado === 'completada' ? (
            <View className="mt-6 rounded-2xl border border-emerald-500/35 bg-emerald-500/10 p-4">
              <Text className="text-base font-bold text-emerald-900">Llegada verificada</Text>
              <Text className="mt-2 text-sm text-pn-navy/75">
                Placa registrada al confirmar:{' '}
                <Text className="font-bold text-pn-navy">{reserva.placa_observada ?? '—'}</Text>
              </Text>
              {reserva.fecha_confirmacion_llegada ? (
                <Text className="mt-1 text-xs text-pn-navy/50">
                  {new Date(reserva.fecha_confirmacion_llegada).toLocaleString()}
                </Text>
              ) : null}
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function Row({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <View className="mb-3 border-b border-pn-border/25 pb-3 last:mb-0 last:border-0 last:pb-0">
      <Text className="text-xs font-medium uppercase tracking-wide text-pn-navy/45">{label}</Text>
      <Text className={`mt-0.5 text-base ${emphasize ? 'font-bold text-blue-800' : 'text-pn-navy'}`}>
        {value}
      </Text>
    </View>
  );
}
