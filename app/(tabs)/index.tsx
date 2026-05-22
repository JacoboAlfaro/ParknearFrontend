import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { usuarioPerfilDesdeSesionMapa } from '@/data/mock-user-profile';
import type { UserMapCoords } from '@/hooks/use-user-map-location';
import { useUserMapLocation } from '@/hooks/use-user-map-location';
import { distanceBetweenKm } from '@/lib/distance-km';
import type { PagoReservaExitoso } from '@/lib/mercadopago-payment-flow';
import { fetchZonasMarcadores } from '@/lib/zonas-api';

type PaymentContext = {
  marker: ParkingMapMarker;
  distanceKm: number;
};

function MapScreenInner() {
  const { user: sessionUser } = useAuth();
  const userLocation = useUserMapLocation();
  const { hasActiveReservation, startReservation, active } = useActiveReservation();

  const [markers, setMarkers] = useState<ParkingMapMarker[]>([]);

  const reloadMarkers = useCallback(async () => {
    try {
      const next = await fetchZonasMarcadores();
      setMarkers(next);
    } catch {
      // Si falla, se mantienen los marcadores actuales
    }
  }, []);

  useEffect(() => {
    void reloadMarkers();
  }, [reloadMarkers]);

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
    (
      marker: ParkingMapMarker,
      km: number,
      ubicacionAlPagar: UserMapCoords | null,
      _placa: string,
      pago: PagoReservaExitoso,
    ) => {
      startReservation(marker, km, ubicacionAlPagar);
      setSelectedMarker(null);
      void reloadMarkers();
      const reservaTxt = pago.reservaId ? `\nReserva #${pago.reservaId}` : '';
      const pagoTxt = pago.pagoId ? `\nPago #${pago.pagoId}` : '';

      if (pago.metodoPago === 'efectivo_zona') {
        Alert.alert(
          'Pago aprobado',
          `Reserva pagada con Mercado Pago${pago.mpTransactionId ? `\nID ${pago.mpTransactionId}` : ''}${reservaTxt}${pagoTxt}\n\n` +
            'Las horas de estacionamiento se pagan en efectivo al llegar a la zona.\n\n' +
            'Comenzó el contador de 15 minutos para llegar.',
        );
        return;
      }

      Alert.alert(
        'Pago aprobado',
        `Mercado Pago${pago.mpTransactionId ? `\nID ${pago.mpTransactionId}` : ''}${reservaTxt}${pagoTxt}\n\n` +
          'Tu reserva quedó activa. Comenzó el contador de 15 minutos para llegar a la zona azul.',
      );
    },
    [startReservation, reloadMarkers],
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
          markers={markers}
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
          idConductor={sessionUser?.id}
          documentoConductor={sessionUser?.document}
          payerEmail={sessionUser?.email}
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
