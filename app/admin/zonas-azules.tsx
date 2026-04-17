import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ParkNearColors } from '@/constants/parknear-theme';
import { useAdminZonas } from '@/contexts/admin-zonas-context';
import {
  detalleIndicacionesAdicional,
  tituloListaDesdeIndicaciones,
  type ZonaAzulVista,
} from '@/models';

const zoneStatusStyle: Record<ZonaAzulVista['estado_operacion'], string> = {
  operativa: 'bg-emerald-500/20 text-emerald-900',
  mantenimiento: 'bg-amber-500/20 text-amber-900',
  inactiva: 'bg-slate-400/25 text-slate-800',
};

const zoneStatusLabel: Record<ZonaAzulVista['estado_operacion'], string> = {
  operativa: 'Operativa',
  mantenimiento: 'Mantenimiento',
  inactiva: 'Inactiva',
};

export default function AdminZonasAzulesScreen() {
  const { zonas } = useAdminZonas();

  return (
    <SafeAreaView className="flex-1 bg-pn-sky-fade" edges={['bottom']}>
      <ScrollView
        className="flex-1 px-5 pt-2"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}>
        <Text className="text-md text-pn-navy/65">
          Ubicación y referencias van en indicaciones. Toca una zona para verla y editarla.
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Nueva zona azul"
          onPress={() => router.push({ pathname: '/admin/zona/[id]', params: { id: 'nueva' } })}
          className="mt-4 overflow-hidden rounded-2xl active:opacity-92 active:scale-[0.99]">
          <LinearGradient
            colors={[ParkNearColors.navy, '#2A4F72']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              paddingVertical: 14,
              paddingHorizontal: 20,
              borderRadius: 16,
            }}>
            <Ionicons name="add-circle-outline" size={22} color="#fff" />
            <Text className="text-[16px] font-bold text-white">Nueva zona azul</Text>
          </LinearGradient>
        </Pressable>

        {zonas.map((z) => {
          const extra = detalleIndicacionesAdicional(z.indicaciones);
          return (
            <Pressable
              key={z.id}
              accessibilityRole="button"
              accessibilityLabel={`Zona ${tituloListaDesdeIndicaciones(z.indicaciones)}`}
              onPress={() =>
                router.push({ pathname: '/admin/zona/[id]', params: { id: String(z.id) } })
              }
              className="mt-3 rounded-2xl border border-white/55 bg-white/95 p-4 shadow-sm shadow-pn-navy/8 active:opacity-90">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-2">
                  <Text className="text-lg font-bold text-pn-navy">
                    {tituloListaDesdeIndicaciones(z.indicaciones)}
                  </Text>
                  {extra ? (
                    <Text className="mt-1 text-sm leading-5 text-pn-navy/65">{extra}</Text>
                  ) : null}
                  <Text className="mt-3 text-sm font-medium text-pn-navy">
                    Cupos:{' '}
                    <Text className="font-bold text-blue-700">
                      {z.capacidad}/{z.capacidad_total}
                    </Text>{' '}
                    disponibles / total
                  </Text>
                  <View className="mt-3.5 self-start flex-row items-center gap-1.5 rounded-full border border-pn-navy/12 bg-white/80 py-2 pl-3.5 pr-3 shadow-sm shadow-pn-navy/6">
                    <Ionicons name="create-outline" size={16} color={ParkNearColors.navy} />
                    <Text className="pr-0.5 text-[13px] font-semibold text-pn-navy">Ver y editar</Text>
                  </View>
                </View>
                <View
                  className={`rounded-full px-2.5 py-1 ${zoneStatusStyle[z.estado_operacion] ?? 'bg-slate-200'}`}>
                  <Text className="text-xs font-semibold">
                    {zoneStatusLabel[z.estado_operacion] ?? z.estado_operacion}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
