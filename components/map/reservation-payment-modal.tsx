import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { ParkingMapMarker } from '@/data/mock-parking-markers';
import { formatCopCompact } from '@/lib/format-cop';
import { formatDistanceEsKm } from '@/lib/distance-km';

const POPUP_BLUE = '#4d7bd4';

type Props = {
  visible: boolean;
  onClose: () => void;
  marker: ParkingMapMarker | null;
  distanceKm: number;
};

export function ReservationPaymentModal({ visible, onClose, marker, distanceKm }: Props) {
  const [plate, setPlate] = useState('');

  const handleClose = useCallback(() => {
    setPlate('');
    onClose();
  }, [onClose]);

  const handlePay = useCallback(() => {
    const trimmed = plate.trim().toUpperCase();
    if (!trimmed) {
      Alert.alert('Placa', 'Ingresa la placa del vehículo.');
      return;
    }
    if (!marker) return;
    Alert.alert(
      'Pago',
      `Simulación: ${formatCopCompact(marker.priceCop)} · placa ${trimmed}`
    );
    handleClose();
  }, [plate, marker, handleClose]);

  const open = visible && marker !== null;
  const spotsLabel =
    marker === null
      ? ''
      : marker.availableSpots === 1
        ? '1 zona'
        : `${marker.availableSpots} zonas`;

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}>
      {marker ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 justify-center px-5">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
            onPress={handleClose}
            className="absolute inset-0 bg-pn-navy/55"
          />

          <View className="relative z-10 overflow-hidden rounded-3xl" style={{ backgroundColor: POPUP_BLUE }}>
            <View className="flex-row items-start justify-between px-5 pb-3 pt-5">
              <Text className="max-w-[85%] text-xl font-bold leading-tight text-white">
                Zonas azules {marker.streetLine}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
                hitSlop={10}
                onPress={handleClose}
                className="rounded-full p-1 active:opacity-70">
                <MaterialIcons name="close" size={26} color="#ffffff" />
              </Pressable>
            </View>

            <View className="mx-5 mb-4 h-px bg-white/35" />

            <View className="px-5 pb-2">
              <Text className="text-[15px] text-white/95">
                Distancia{' '}
                <Text className="font-semibold text-white">{formatDistanceEsKm(distanceKm)}</Text>
              </Text>
              <Text className="mt-2 text-[15px] text-white/95">
                Plazas disponibles <Text className="font-semibold text-white">{spotsLabel}</Text>
              </Text>
              <Text className="mt-5 text-[15px] text-white/90">Total a pagar</Text>
              <Text className="mt-1 text-4xl font-bold text-white">
                {formatCopCompact(marker.priceCop)}
              </Text>
            </View>

            <View className="px-5 pb-6 pt-2">
              <TextInput
                className="mb-4 rounded-2xl bg-white px-4 py-3.5 text-base font-medium text-pn-navy"
                placeholder="Ingresa tu Placa"
                placeholderTextColor="#94a3b8"
                value={plate}
                onChangeText={setPlate}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={12}
              />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Pagar"
                onPress={handlePay}
                className="items-center rounded-2xl bg-white py-3.5 active:opacity-90">
                <Text className="text-[17px] font-bold" style={{ color: POPUP_BLUE }}>
                  Pagar
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      ) : null}
    </Modal>
  );
}