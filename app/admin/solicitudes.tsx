import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ParkNearColors } from '@/constants/parknear-theme';
import { useAdminSolicitudes } from '@/contexts/admin-solicitudes-context';
import { TIPO_SOLICITUD_LABELS } from '@/data/mock-admin-dashboard';
import { ESTADO_SOLICITUD_LABELS, type EstadoSolicitud, type SolicitudSoporteVista } from '@/models';

type BadgeKey = EstadoSolicitud | 'aceptada' | 'rechazada';

function badgeKey(s: SolicitudSoporteVista): BadgeKey {
  if (s.estado === 'pendiente' || s.estado === 'activa') return s.estado;
  if (s.resultado_admin === 'aceptada') return 'aceptada';
  if (s.resultado_admin === 'rechazada') return 'rechazada';
  return 'resuelta';
}

function badgeLabel(s: SolicitudSoporteVista): string {
  const k = badgeKey(s);
  if (k === 'aceptada') return 'Aceptada';
  if (k === 'rechazada') return 'Rechazada';
  return ESTADO_SOLICITUD_LABELS[k];
}

const solStatusStyle: Record<BadgeKey, string> = {
  pendiente: 'bg-amber-500/20 text-amber-900',
  activa: 'bg-sky-500/20 text-sky-900',
  resuelta: 'bg-emerald-500/20 text-emerald-900',
  aceptada: 'bg-emerald-500/25 text-emerald-950',
  rechazada: 'bg-red-500/15 text-red-900',
};

function fechaCorta(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('es-CO', {
      dateStyle: 'medium',
    });
  } catch {
    return iso;
  }
}

export default function AdminSolicitudesScreen() {
  const { solicitudes } = useAdminSolicitudes();

  return (
    <SafeAreaView className="flex-1 bg-pn-sky-fade" edges={['bottom']}>
      <ScrollView
        className="flex-1 px-5 pt-2"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}>
        <Text className="text-md text-pn-navy/65">
          Solicitudes de soporte. Las pendientes puedes abrirlas para aceptarlas o rechazarlas con un
          mensaje al usuario.
        </Text>

        {solicitudes.map((s) => {
          const abierta = s.estado === 'pendiente';
          const CardInner = (
            <>
              <View className="flex-row flex-wrap items-center justify-between gap-2">
                <View className="rounded-lg bg-pn-navy/8 px-2 py-1">
                  <Text className="text-xs font-semibold text-pn-navy">
                    {TIPO_SOLICITUD_LABELS[s.tipo]}
                  </Text>
                </View>
                <View
                  className={`rounded-full px-2.5 py-1 ${solStatusStyle[badgeKey(s)] ?? 'bg-slate-200'}`}>
                  <Text className="text-xs font-semibold">{badgeLabel(s)}</Text>
                </View>
              </View>
              <Text className="mt-2 text-base font-bold text-pn-navy">{s.titulo}</Text>
              <Text className="mt-1 text-sm font-semibold text-pn-navy/80">{s.nombre_solicitante}</Text>
              <Text className="mt-1 text-sm leading-5 text-pn-navy/70" numberOfLines={3}>
                {s.descripcion}
              </Text>
              <Text className="mt-2 text-xs font-medium text-pn-navy/45">
                Recibida: {fechaCorta(s.fecha_creacion)}
              </Text>
              {abierta ? (
                <View className="mt-4 flex-row items-center justify-center gap-2 rounded-xl border border-pn-navy/20 bg-pn-navy/10 py-3.5 px-4">
                  <Text className="text-sm font-bold text-pn-navy">Ver y responder</Text>
                  <Ionicons name="arrow-forward-circle" size={22} color={ParkNearColors.navy} />
                </View>
              ) : null}
            </>
          );

          if (abierta) {
            return (
              <Pressable
                key={s.id}
                accessibilityRole="button"
                accessibilityLabel={`Abrir solicitud: ${s.titulo}`}
                onPress={() => router.push({ pathname: '/admin/solicitud/[id]', params: { id: String(s.id) } })}
                className="mt-3 rounded-2xl border border-white/55 bg-white/95 p-4 shadow-sm shadow-pn-navy/8 active:opacity-90">
                {CardInner}
              </Pressable>
            );
          }

          return (
            <View
              key={s.id}
              className="mt-3 rounded-2xl border border-white/55 bg-white/95 p-4 shadow-sm shadow-pn-navy/8">
              {CardInner}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
