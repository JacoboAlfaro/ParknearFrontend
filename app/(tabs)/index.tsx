import { useCallback, useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MapProfileFab } from '@/components/map/map-profile-fab';
import { ParkingMap } from '@/components/map/parking-map';
import { ProfileMenuModal } from '@/components/map/profile-menu-modal';
import { ReservationCountdownOverlay } from '@/components/map/reservation-countdown-overlay';
import { ReservationPaymentModal } from '@/components/map/reservation-payment-modal';
import { ZoneDetailBottomSheet } from '@/components/map/zone-detail-bottom-sheet';
import { ActiveReservationProvider, useActiveReservation } from '@/contexts/active-reservation-context';
import { useAuth } from '@/contexts/auth-context';
import type { ParkingMapMarker } from '@/data/mock-parking-markers';
import { MOCK_PARKING_MARKERS } from '@/data/mock-parking-markers';
import { usuarioPerfilDesdeSesionMapa } from '@/data/mock-user-profile';
import type { UserMapCoords } from '@/hooks/use-user-map-location';
import { useUserMapLocation } from '@/hooks/use-user-map-location';
import { distanceBetweenKm } from '@/lib/distance-km';

type PaymentContext = {
  marker: ParkingMapMarker;
  distanceKm: number;
};

function MapScreenInner() {
  const { user: sessionUser } = useAuth();
  const userLocation = useUserMapLocation();
  const { hasActiveReservation, startReservation, active } = useActiveReservation();

  const routeToReservedZone = useMemo(() => {
    if (!hasActiveReservation || !active) return null;
    return {
      latitude: active.zonaLatitud,
      longitude: active.zonaLongitud,
    };
  }, [hasActiveReservation, active]);

  const routeOriginSnapshot = useMemo((): UserMapCoords | null => {
    if (!hasActiveReservation || !active) return null;
    if (active.origenLatitud == null || active.origenLongitud == null) return null;
    return {
      latitude: active.origenLatitud,
      longitude: active.origenLongitud,
    };
  }, [hasActiveReservation, active]);
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
    if (hasActiveReservation) {
      Alert.alert(
        'Reserva activa',
        'Tienes un tiempo de reserva en curso. Espera a que termine el contador para reservar otra zona.'
      );
      return;
    }
    setPaymentContext({
      marker: selectedMarker,
      distanceKm,
    });
  }, [selectedMarker, distanceKm, hasActiveReservation]);

  const closePaymentModal = useCallback(() => {
    setPaymentContext(null);
  }, []);

  const handlePaymentSuccess = useCallback(
    (marker: ParkingMapMarker, km: number, ubicacionAlPagar: UserMapCoords | null) => {
      startReservation(marker, km, ubicacionAlPagar);
      setSelectedMarker(null);
      Alert.alert(
        'Reserva realizada',
        'Tu reserva se registró correctamente. Comenzó el contador de 15 minutos para llegar a la zona azul.',
      );
    },
    [startReservation]
  );

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
          routeToReservedZone={routeToReservedZone}
          routeOriginSnapshot={routeOriginSnapshot}
          onMarkerSelect={openZoneDetail}
        />
        <MapProfileFab
          fullName={sessionUser?.displayName ?? 'Usuario'}
          onPress={() => setProfileOpen(true)}
        />
        <ReservationCountdownOverlay />
        <ZoneDetailBottomSheet
          key={selectedMarker?.id ?? 'zone-detail-closed'}
          marker={selectedMarker}
          distanceKm={distanceKm}
          onClose={closeZoneSheet}
          onReservePress={openPaymentModal}
          reservationLocked={hasActiveReservation}
        />
        <ReservationPaymentModal
          visible={!!paymentContext}
          onClose={closePaymentModal}
          marker={paymentContext?.marker ?? null}
          distanceKm={paymentContext?.distanceKm ?? 0}
          onPaymentSuccess={handlePaymentSuccess}
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

export default function MapScreen() {
  return (
    <ActiveReservationProvider>
      <MapScreenInner />
    </ActiveReservationProvider>
  );
}
