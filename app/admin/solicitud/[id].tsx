import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LabeledField } from '@/components/molecules/labeled-field';
import { ParkNearColors } from '@/constants/parknear-theme';
import { useAdminSolicitudes } from '@/contexts/admin-solicitudes-context';
import { TIPO_SOLICITUD_LABELS } from '@/data/mock-admin-dashboard';
import { ESTADO_SOLICITUD_LABELS, type SolicitudSoporteVista } from '@/models';

function fechaLarga(iso: string) {
  try {
    return new Date(iso).toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function tituloResolucion(s: SolicitudSoporteVista): string {
  if (s.estado !== 'resuelta') return ESTADO_SOLICITUD_LABELS[s.estado];
  if (s.resultado_admin === 'aceptada') return 'Resuelta · Aceptada';
  if (s.resultado_admin === 'rechazada') return 'Resuelta · Rechazada';
  return ESTADO_SOLICITUD_LABELS.resuelta;
}

export default function AdminSolicitudDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const sid = typeof id === 'string' ? Number(id) : NaN;
  const { getSolicitud, resolverSolicitud } = useAdminSolicitudes();
  const solicitud = Number.isFinite(sid) ? getSolicitud(sid) : undefined;

  const [motivo, setMotivo] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      title: solicitud ? solicitud.titulo.slice(0, 40) : 'Solicitud',
    });
  }, [navigation, solicitud]);

  if (!solicitud) {
    return (
      <SafeAreaView className="flex-1 bg-pn-sky-fade px-5 pt-4" edges={['bottom']}>
        <Text className="text-base text-pn-navy/70">No se encontró la solicitud.</Text>
        <Pressable onPress={() => router.back()} className="mt-4 py-2 active:opacity-70">
          <Text className="font-semibold text-pn-navy">Volver</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const pendiente = solicitud.estado === 'pendiente';

  const onResolver = (aceptada: boolean) => {
    const m = motivo.trim();
    if (m.length < 4) {
      Alert.alert(
        'Motivo requerido',
        'Escribe un mensaje para el solicitante (mínimo 4 caracteres).',
      );
      return;
    }
    const ok = resolverSolicitud(solicitud.id, aceptada ? 'aceptada' : 'rechazada', m);
    if (!ok) {
      Alert.alert('No se pudo guardar', 'La solicitud ya no está pendiente.');
      return;
    }
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-pn-sky-fade" edges={['bottom']}>
      <ScrollView
        className="flex-1 px-5 pt-2"
        contentContainerStyle={{ paddingBottom: 28 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          <View className="rounded-lg bg-pn-navy/8 px-2 py-1">
            <Text className="text-xs font-semibold text-pn-navy">
              {TIPO_SOLICITUD_LABELS[solicitud.tipo]}
            </Text>
          </View>
          <View className="rounded-full bg-pn-navy/10 px-2.5 py-1">
            <Text className="text-xs font-semibold text-pn-navy">{tituloResolucion(solicitud)}</Text>
          </View>
        </View>

        <Text className="mt-4 text-lg font-bold text-pn-navy">{solicitud.titulo}</Text>
        <Text className="mt-1 text-sm font-semibold text-pn-navy/80">{solicitud.nombre_solicitante}</Text>
        <Text className="mt-3 text-base leading-6 text-pn-navy/80">{solicitud.descripcion}</Text>
        <Text className="mt-3 text-xs text-pn-navy/45">Recibida: {fechaLarga(solicitud.fecha_creacion)}</Text>

        {!pendiente && solicitud.motivo_admin ? (
          <View className="mt-6 rounded-2xl border border-white/55 bg-white/95 p-4">
            <Text className="text-xs font-semibold uppercase tracking-wider text-pn-navy/45">
              Respuesta registrada
            </Text>
            <Text className="mt-2 text-base text-pn-navy">{solicitud.motivo_admin}</Text>
            <Text className="mt-2 text-xs text-pn-navy/45">
              Actualizada: {fechaLarga(solicitud.fecha_actualizacion)}
            </Text>
          </View>
        ) : null}

        {pendiente ? (
          <View className="mt-8">
            <LabeledField
              label="Mensaje para el solicitante"
              placeholder="Explica la decisión (obligatorio al aceptar o rechazar)"
              value={motivo}
              onChangeText={setMotivo}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              containerClassName="mb-5"
              className="min-h-[120px] py-3"
            />

            <Pressable
              className="mb-3 overflow-hidden rounded-2xl active:opacity-92 active:scale-[0.99]"
              onPress={() => onResolver(true)}>
              <LinearGradient
                colors={[ParkNearColors.navy, '#2A4F72']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingVertical: 16, alignItems: 'center', borderRadius: 16 }}>
                <Text className="text-[17px] font-bold text-white">Aceptar solicitud</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={() => onResolver(false)}
              className="items-center rounded-2xl border-2 border-red-500/70 bg-red-500/10 py-4 active:opacity-90">
              <Text className="text-base font-bold text-red-800">Rechazar solicitud</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
