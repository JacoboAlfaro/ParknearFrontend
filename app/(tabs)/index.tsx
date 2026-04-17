import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MapProfileFab } from '@/components/map/map-profile-fab';
import { ParkingMap } from '@/components/map/parking-map';
import { ProfileMenuModal } from '@/components/map/profile-menu-modal';
import { ReservationPaymentModal } from '@/components/map/reservation-payment-modal';
import { ZoneDetailBottomSheet } from '@/components/map/zone-detail-bottom-sheet';
import { useAuth } from '@/contexts/auth-context';
import type { ParkingMapMarker } from '@/data/mock-parking-markers';
import { MOCK_PARKING_MARKERS } from '@/data/mock-parking-markers';
import { usuarioPerfilDesdeSesionMapa } from '@/data/mock-user-profile';
import { useUserMapLocation } from '@/hooks/use-user-map-location';
import { distanceBetweenKm } from '@/lib/distance-km';

type PaymentContext = {
  marker: ParkingMapMarker;
  distanceKm: number;
};

export default function MapScreen() {
  const { user: sessionUser } = useAuth();
  const userLocation = useUserMapLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<ParkingMapMarker | null>(null);
  const [paymentContext, setPaymentContext] = useState<PaymentContext | null>(null);

  const distanceKm = useMemo(() => {
    if (!selectedMarker) return 0;
    if (userLocation) {
      return distanceBetweenKm(
        userLocation.latitude,
        userLocation.longitude,
        selectedMarker.latitud,
        selectedMarker.longitud
      );
    }
    return selectedMarker.distancia_aprox_km;
  }, [selectedMarker, userLocation]);

  const closeZoneSheet = useCallback(() => {
    setSelectedMarker(null);
  }, []);

  const openZoneDetail = useCallback((m: ParkingMapMarker) => {
    setSelectedMarker(null);
    queueMicrotask(() => setSelectedMarker(m));
  }, []);

  const openPaymentModal = useCallback(() => {
    if (!selectedMarker || selectedMarker.cupos_disponibles <= 0) return;
    setPaymentContext({
      marker: selectedMarker,
      distanceKm,
    });
  }, [selectedMarker, distanceKm]);

  const closePaymentModal = useCallback(() => {
    setPaymentContext(null);
  }, []);

  const perfilMapa = useMemo(() => {
    if (!sessionUser) {
      return usuarioPerfilDesdeSesionMapa('Usuario', 'usuario@parknear.app');
    }
    return usuarioPerfilDesdeSesionMapa(sessionUser.displayName, sessionUser.email);
  }, [sessionUser]);

  return (
    <SafeAreaView className="flex-1 bg-pn-sky-fade" edges={['top']}>
      <View className="relative flex-1">
        <ParkingMap
          markers={MOCK_PARKING_MARKERS}
          userLocation={userLocation}
          onMarkerSelect={openZoneDetail}
        />
        <MapProfileFab
          fullName={sessionUser?.displayName ?? 'Usuario'}
          onPress={() => setProfileOpen(true)}
        />
        <ZoneDetailBottomSheet
          key={selectedMarker?.id ?? 'zone-detail-closed'}
          marker={selectedMarker}
          distanceKm={distanceKm}
          onClose={closeZoneSheet}
          onReservePress={openPaymentModal}
        />
        <ReservationPaymentModal
          visible={!!paymentContext}
          onClose={closePaymentModal}
          marker={paymentContext?.marker ?? null}
          distanceKm={paymentContext?.distanceKm ?? 0}
        />
        <ProfileMenuModal
          visible={profileOpen}
          onClose={() => setProfileOpen(false)}
          user={perfilMapa}
        />
      </View>
    </SafeAreaView>
  );
}
