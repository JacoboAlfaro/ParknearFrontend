import { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatMmSs, useActiveReservation } from '@/contexts/active-reservation-context';
import { formatDistanceEsKm } from '@/lib/distance-km';

const POPUP_BLUE = '#4d7bd4';

export function ReservationCountdownOverlay() {
  const { hasActiveReservation, active, secondsLeft } = useActiveReservation();
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(false);

  const toggle = useCallback(() => {
    setExpanded((e) => !e);
  }, []);

  useEffect(() => {
    if (!hasActiveReservation) {
      setExpanded(false);
    }
  }, [hasActiveReservation]);

  if (Platform.OS === 'web' || !hasActiveReservation || !active) {
    return null;
  }

  const label = formatMmSs(secondsLeft);
  const title = `Zonas azules ${active.lineaCalle}`;
  const top = Math.max(insets.top, 8) + 4;

  if (!expanded) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Tiempo restante de reserva: ${label}. Toca para ver detalle.`}
        onPress={toggle}
        className="absolute mt-2 z-20 rounded-full px-4 py-2.5 shadow-lg shadow-pn-navy/25"
        style={{ right: 12, top, backgroundColor: POPUP_BLUE, elevation: 12 }}>
        <Text className="text-[17px] font-bold tabular-nums text-white">{label}</Text>
      </Pressable>
    );
  }

  return (
    <View className="absolute z-20 px-3 mt-2" style={{ right: 0, top, maxWidth: '92%' }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Detalle de reserva activa"
        onPress={toggle}
        className="overflow-hidden rounded-2xl shadow-lg shadow-pn-navy/25"
        style={{ backgroundColor: POPUP_BLUE, elevation: 12, minWidth: 280 }}>
        <View className="flex-row items-start justify-between gap-3 px-4 pb-2 pt-4">
          <Text className="max-w-[72%] text-lg font-bold leading-tight text-white" numberOfLines={3}>
            {title}
          </Text>
          <Text className="text-xl font-bold tabular-nums text-white">{label}</Text>
        </View>
        <View className="mx-4 h-px bg-white/35" />
        <View className="px-4 pb-4 pt-3">
          <Text className="text-[15px] text-white/95">
            Distancia{' '}
            <Text className="font-semibold text-white">
              {formatDistanceEsKm(active.distanceKm)}
            </Text>
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
