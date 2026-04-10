import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useMemo, useRef } from 'react';
import type { ElementRef } from 'react';
import { Alert, Platform, Pressable, Text, View } from 'react-native';

import { ParkNearColors } from '@/constants/parknear-theme';
import type { ParkingMapMarker } from '@/data/mock-parking-markers';
import { formatDistanceEsKm } from '@/lib/distance-km';

type Props = {
  marker: ParkingMapMarker | null;
  distanceKm: number;
  onClose: () => void;
  onReservePress?: () => void;
};

export function ZoneDetailBottomSheet({ marker, distanceKm, onClose, onReservePress }: Props) {
  const sheetRef = useRef<ElementRef<typeof BottomSheet>>(null);
  const snapPoints = useMemo(() => ['44%', '62%'], []);
  const sheetIndex = marker ? 0 : -1;

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.4}
        pressBehavior="close"
      />
    ),
    []
  );

  const handleChange = useCallback(
    (index: number) => {
      if (index === -1) onClose();
    },
    [onClose]
  );

  const handleClosePress = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  const onReserve = useCallback(() => {
    if (!marker || marker.availableSpots <= 0) return;
    onReservePress?.();
  }, [marker, onReservePress]);

  if (Platform.OS === 'web') {
    return null;
  }

  return (
    <BottomSheet
      ref={sheetRef}
      index={sheetIndex}
      snapPoints={snapPoints}
      enablePanDownToClose
      onChange={handleChange}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: '#cbd5e1', width: 40 }}
      backgroundStyle={{
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }}>
      <BottomSheetView style={{ flex: 1 }}>
        <View className="flex-1 px-5 pb-8 pt-1">
          {marker ? (
            <>
              <View className="mb-4 flex-row items-start justify-between gap-3">
                <View className="min-w-0 flex-1">
                  <Text className="text-xs font-semibold uppercase tracking-wide text-pn-navy/45">
                    Zonas azules
                  </Text>
                  <Text className="mt-1 text-2xl font-bold text-pn-navy" numberOfLines={2}>
                    {marker.streetLine}
                  </Text>
                  <Text className="mt-0.5 text-sm text-pn-navy/50" numberOfLines={1}>
                    {marker.title}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Añadir"
                    hitSlop={8}
                    onPress={() => Alert.alert('ParkNear', 'Próximamente.')}
                    className="h-10 w-10 items-center justify-center rounded-xl border border-pn-border/50 active:bg-pn-sky-fade/80">
                    <MaterialIcons name="add-box" size={22} color={ParkNearColors.buttonSlate} />
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Cerrar"
                    hitSlop={8}
                    onPress={handleClosePress}
                    className="h-10 w-10 items-center justify-center rounded-xl border border-pn-border/50 active:bg-pn-sky-fade/80">
                    <MaterialIcons name="close" size={22} color={ParkNearColors.buttonSlate} />
                  </Pressable>
                </View>
              </View>

              <View className="mb-4 h-px bg-pn-border/40" />

              <Text className="text-[15px] text-pn-navy/75">
                Distancia{' '}
                <Text className="font-semibold text-pn-navy">{formatDistanceEsKm(distanceKm)}</Text>
              </Text>

              <Text className="mt-3 text-[15px] text-pn-navy/75">
                Plazas disponibles{' '}
                <Text className="font-bold text-[#1d4ed8]">
                  {marker.availableSpots}{' '}
                  {marker.availableSpots === 1 ? 'cupo' : 'cupos'}
                </Text>
              </Text>

              {marker.availableSpots > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Reservar"
                  onPress={onReserve}
                  className="mt-6 overflow-hidden rounded-2xl active:opacity-92 active:scale-[0.99]">
                  <LinearGradient
                    colors={[ParkNearColors.navy, '#2A4F72']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      paddingVertical: 16,
                      alignItems: 'center',
                      borderRadius: 16,
                    }}>
                    <Text className="text-[17px] font-bold text-white">Reserva</Text>
                  </LinearGradient>
                </Pressable>
              ) : (
                <View className="mt-6 rounded-2xl border border-pn-border/50 bg-pn-sky-fade/60 py-4">
                  <Text className="text-center text-[15px] font-medium text-pn-navy/55">
                    Sin cupos disponibles
                  </Text>
                </View>
              )}
            </>
          ) : null}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}