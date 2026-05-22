import * as Location from 'expo-location';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { MercadoPagoSandboxCheckout } from '@/components/map/mercadopago-sandbox-checkout';
import type { ParkingMapMarker } from '@/data/mock-parking-markers';
import {
  CARGO_FIJO_RESERVA_COP,
  parseSeleccionTiempoReserva,
  RESERVA_HORAS_DEFAULT,
  RESERVA_HORAS_MAX,
  RESERVA_HORAS_MIN,
  SELECCION_TIEMPO_EFECTIVO,
  TARIFA_RESERVA_POR_HORA_COP,
} from '@/constants/reserva-tarifa';
import type { UserMapCoords } from '@/hooks/use-user-map-location';
import { formatDistanceEsKm } from '@/lib/distance-km';
import { formatCopCompact } from '@/lib/format-cop';
import type { PagoReservaExitoso } from '@/lib/mercadopago-payment-flow';
const POPUP_BLUE = '#4d7bd4';

const OPCIONES_TIEMPO: (string | number)[] = [
  SELECCION_TIEMPO_EFECTIVO,
  1,
  2,
  3,
  4,
  5,
];

type PaymentStep = 'resumen' | 'mercadopago';

type Props = {
  visible: boolean;
  onClose: () => void;
  marker: ParkingMapMarker | null;
  distanceKm: number;
  idConductor?: string;
  documentoConductor?: string;
  payerEmail?: string;
  onPaymentSuccess?: (
    marker: ParkingMapMarker,
    distanceKm: number,
    ubicacionAlPagar: UserMapCoords | null,
    placa: string,
    pago: PagoReservaExitoso,
  ) => void;
};

export function ReservationPaymentModal({
  visible,
  onClose,
  marker,
  distanceKm,
  idConductor,
  documentoConductor,
  payerEmail,
  onPaymentSuccess,
}: Props) {
  const [plate, setPlate] = useState('');
  const [horasText, setHorasText] = useState(String(RESERVA_HORAS_DEFAULT));
  const [seleccionTiempo, setSeleccionTiempo] = useState<string>('1');
  const [step, setStep] = useState<PaymentStep>('resumen');
  const [finalizing, setFinalizing] = useState(false);
  const esEfectivo = seleccionTiempo === SELECCION_TIEMPO_EFECTIVO;

  const cotizacion = useMemo(
    () =>
      parseSeleccionTiempoReserva(
        esEfectivo ? SELECCION_TIEMPO_EFECTIVO : horasText,
      ),
    [esEfectivo, horasText],
  );

  const resetState = useCallback(() => {
    setPlate('');
    setHorasText(String(RESERVA_HORAS_DEFAULT));
    setSeleccionTiempo('1');
    setStep('resumen');
    setFinalizing(false);
  }, []);

  const handleClose = useCallback(() => {
    if (finalizing) return;
    resetState();
    onClose();
  }, [finalizing, onClose, resetState]);

  useEffect(() => {
    if (!visible) {
      resetState();
    }
  }, [visible, resetState]);

  const validarFormularioReserva = useCallback((): boolean => {
    const trimmed = plate.trim().toUpperCase();
    if (trimmed.length < 1 || trimmed.length > 10) {
      Alert.alert('Placa', 'Ingresa una placa válida (1 a 10 caracteres).');
      return false;
    }
    if (!cotizacion) {
      Alert.alert(
        'Tiempo de estacionamiento',
        esEfectivo
          ? 'Elige Efectivo o indica las horas.'
          : `Indica horas enteras entre ${RESERVA_HORAS_MIN} y ${RESERVA_HORAS_MAX} (mínimo 1 hora).`,
      );
      return false;
    }
    if (!idConductor) {
      Alert.alert('Sesión', 'Inicia sesión como conductor para reservar.');
      return false;
    }
    return true;
  }, [plate, cotizacion, idConductor, esEfectivo]);

  const goToMercadoPago = useCallback(() => {
    if (!validarFormularioReserva() || !marker) return;
    setStep('mercadopago');
  }, [validarFormularioReserva, marker]);

  const finalizeReservation = useCallback(
    async (pago: PagoReservaExitoso) => {
      if (!marker) return;
      const trimmed = plate.trim().toUpperCase();

      setFinalizing(true);
      let ubicacionAlPagar: UserMapCoords | null = null;
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          ubicacionAlPagar = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
        }
      } catch {
        // Sin GPS la reserva sigue, la ruta usará snapshot vacío.
      }

      onPaymentSuccess?.(marker, distanceKm, ubicacionAlPagar, trimmed, pago);
      resetState();
      onClose();
    },
    [marker, plate, distanceKm, onPaymentSuccess, resetState, onClose],
  );

  const open = visible && marker !== null;
  const spotsLabel =
    marker === null
      ? ''
      : marker.cupos_disponibles === 1
        ? '1 plaza'
        : `${marker.cupos_disponibles} plazas`;

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
            disabled={finalizing}
            className="absolute inset-0 bg-pn-navy/55"
          />

          {step === 'resumen' ? (
            <View className="relative z-10 overflow-hidden rounded-3xl" style={{ backgroundColor: POPUP_BLUE }}>
              <View className="flex-row items-start justify-between px-5 pb-3 pt-5">
                <Text className="max-w-[85%] text-xl font-bold leading-tight text-white">
                  Zonas azules {marker.linea_calle}
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
                  {cotizacion ? formatCopCompact(cotizacion.precio) : '—'}
                </Text>
                {cotizacion ? (
                  <Text className="mt-1 text-xs leading-4 text-white/80">
                    {esEfectivo ? (
                      <>
                        Reserva {formatCopCompact(CARGO_FIJO_RESERVA_COP)} con Mercado Pago · 0 h por
                        adelantado · horas en efectivo en zona
                      </>
                    ) : (
                      <>
                        {cotizacion.horasPagoAdelantado} h × {formatCopCompact(TARIFA_RESERVA_POR_HORA_COP)} ={' '}
                        {formatCopCompact(cotizacion.desglose.subtotalHoras)}
                        {' · '}
                        Reserva {formatCopCompact(CARGO_FIJO_RESERVA_COP)}
                        {' · '}
                        fin {cotizacion.finLegible}
                      </>
                    )}
                  </Text>
                ) : !esEfectivo ? (
                  <Text className="mt-1 text-xs text-amber-200">
                    Revisa las horas ({RESERVA_HORAS_MIN}–{RESERVA_HORAS_MAX})
                  </Text>
                ) : null}
              </View>

              <View className="px-5 pb-6 pt-2">
                <TextInput
                  className="mb-2 rounded-2xl bg-white px-4 py-3.5 text-base font-medium text-pn-navy"
                  placeholder="Ingresa tu placa"
                  placeholderTextColor="#94a3b8"
                  value={plate}
                  onChangeText={setPlate}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={10}
                />

                <Text className="mb-1.5 text-sm font-semibold text-white/95">
                  Tiempo y forma de pago
                </Text>

                {!esEfectivo ? (
                  <>
                    <Text className="mb-1 text-xs text-white/80">
                      ¿Cuántas horas vas a estar? (mínimo 1 h)
                    </Text>
                    <TextInput
                      className="mb-2 rounded-2xl bg-white px-4 py-3.5 text-base font-medium text-pn-navy"
                      placeholder={`Ej. 1 (${RESERVA_HORAS_MIN}–${RESERVA_HORAS_MAX} h enteras)`}
                      placeholderTextColor="#94a3b8"
                      value={horasText}
                      onChangeText={(t) => setHorasText(t.replace(/\D/g, ''))}
                      keyboardType="number-pad"
                      editable={!finalizing}
                    />
                  </>
                ) : null}

                <View className="mb-3 flex-row flex-wrap gap-2">
                  {OPCIONES_TIEMPO.map((op) => {
                    const key = String(op);
                    const activa =
                      op === SELECCION_TIEMPO_EFECTIVO
                        ? esEfectivo
                        : !esEfectivo && horasText === key;
                    const label = op === SELECCION_TIEMPO_EFECTIVO ? 'Efectivo' : `${op} h`;
                    return (
                      <Pressable
                        key={key}
                        onPress={() => {
                          if (op === SELECCION_TIEMPO_EFECTIVO) {
                            setSeleccionTiempo(SELECCION_TIEMPO_EFECTIVO);
                          } else {
                            setSeleccionTiempo(String(op));
                            setHorasText(String(op));
                          }
                        }}
                        className={`rounded-full px-3 py-1.5 ${activa ? 'bg-white' : 'bg-white/20'}`}>
                        <Text
                          className={`text-sm font-semibold ${activa ? 'text-pn-navy' : 'text-white'}`}>
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View className="mb-4 flex-row items-center gap-2 rounded-2xl bg-white/15 px-3 py-2.5">
                  <View className="rounded-full bg-[#ffe600] p-1">
                    <MaterialIcons
                      name={esEfectivo ? 'payments' : 'handshake'}
                      size={16}
                      color="#0a0080"
                    />
                  </View>
                  <Text className="flex-1 text-xs leading-4 text-white/90">
                    {esEfectivo
                      ? 'Pagas la reserva ($5.000) con Mercado Pago. Las horas de estacionamiento las pagas en efectivo al llegar a la zona.'
                      : 'Pagas horas + reserva con Mercado Pago. Al aprobarse, inicia el contador de 15 minutos.'}
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Pagar con Mercado Pago"
                  onPress={goToMercadoPago}
                  disabled={!cotizacion || finalizing}
                  className="flex-row items-center justify-center gap-2 rounded-2xl bg-white py-3.5 active:opacity-90"
                  style={{ opacity: cotizacion && !finalizing ? 1 : 0.5 }}>
                  <Text className="text-[17px] font-bold" style={{ color: POPUP_BLUE }}>
                    Pagar
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View className="relative z-10 w-full max-h-[96%]">
              {finalizing ? (
                <View className="items-center rounded-3xl bg-white px-8 py-10">
                  <ActivityIndicator size="large" color="#00bcff" />
                  <Text className="mt-4 text-center text-base font-semibold text-pn-navy">
                    Confirmando pago…
                  </Text>
                  <Text className="mt-1 text-center text-sm text-pn-navy/60">
                    Preparando tu reserva y el contador
                  </Text>
                </View>
              ) : cotizacion ? (
                <MercadoPagoSandboxCheckout
                  amountCop={cotizacion.precio}
                  horasEstacionamiento={cotizacion.horasReservaApi}
                  fechaFinLegible={cotizacion.finLegible}
                  fechaFinIso={cotizacion.fechaFin}
                  pagoHorasEnEfectivoEnZona={esEfectivo}
                  description={
                    esEfectivo
                      ? `Reserva zona azul · ${marker.linea_calle} · reserva MP · horas en efectivo`
                      : `Reserva zona azul · ${marker.linea_calle} · ${cotizacion.horasPagoAdelantado} h`
                  }
                  placa={plate.trim().toUpperCase()}
                  idZona={marker.id}
                  idConductor={idConductor}
                  documentoConductor={documentoConductor}
                  payerEmail={payerEmail}
                  onBack={() => setStep('resumen')}
                  onApproved={finalizeReservation}
                />
              ) : null}
            </View>
          )}
        </KeyboardAvoidingView>
      ) : null}
    </Modal>
  );
}
