import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { logApiError } from '@/lib/api-log';
import { formatCopCompact } from '@/lib/format-cop';
import { ejecutarPagoReserva, type PagoReservaExitoso } from '@/lib/mercadopago-payment-flow';
import { TARJETAS_PRUEBA_MP, tienePublicKeyMercadoPago } from '@/lib/mercadopago-token';
import { mensajeErrorPago } from '@/lib/pagos-api';

const MP_SKY = '#00bcff';
const MP_NAVY = '#0a0080';

const TARJETA_APRO = TARJETAS_PRUEBA_MP.aprobada;

type Props = {
  amountCop: number;
  horasEstacionamiento: number;
  fechaFinLegible: string;
  fechaFinIso?: string;
  pagoHorasEnEfectivoEnZona?: boolean;
  description: string;
  placa: string;
  idZona: number;
  idConductor?: string;
  documentoConductor?: string;
  payerEmail?: string;
  onBack: () => void;
  onApproved: (result: PagoReservaExitoso) => void;
};

function parseVencimientoTarjeta(text: string): { month: number; year: number } | null {
  const trimmed = text.trim();
  const match = trimmed.match(/^(\d{1,2})\s*\/\s*(\d{2,4})$/);
  if (!match) return null;
  const month = parseInt(match[1], 10);
  let year = parseInt(match[2], 10);
  if (year < 100) year += 2000;
  if (month < 1 || month > 12) return null;
  return { month, year };
}

export function MercadoPagoSandboxCheckout({
  amountCop,
  horasEstacionamiento,
  fechaFinLegible,
  fechaFinIso,
  pagoHorasEnEfectivoEnZona,
  description,
  placa,
  idZona,
  idConductor,
  documentoConductor,
  payerEmail,
  onBack,
  onApproved,
}: Props) {
  const [cardNumber, setCardNumber] = useState('5254 1336 7440 3564');
  const [cardName, setCardName] = useState<string>(TARJETA_APRO.cardholderName);
  const [cardCvv, setCardCvv] = useState<string>(TARJETA_APRO.securityCode);
  const [cardExpiry, setCardExpiry] = useState(
    `${String(TARJETA_APRO.expirationMonth).padStart(2, '0')}/${String(TARJETA_APRO.expirationYear).slice(-2)}`,
  );
  const [cardDocument, setCardDocument] = useState<string>(TARJETA_APRO.identificationNumber);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailPago = payerEmail?.trim() || 'test_user@parknear.app';

  const runPayment = useCallback(
    async (outcome: 'approved' | 'rejected') => {
      if (processing) return;
      if (!idConductor) {
        setError('Inicia sesión como conductor para crear la reserva y pagar.');
        return;
      }
      if (!tienePublicKeyMercadoPago()) {
        setError('No se encontró la clave pública de Mercado Pago.');
        return;
      }

      const vencimiento = parseVencimientoTarjeta(cardExpiry);
      if (!vencimiento) {
        setError('Vencimiento inválido. Usa formato MM/AA (ej. 11/30).');
        return;
      }
      const cvv = cardCvv.replace(/\D/g, '');
      if (cvv.length < 3 || cvv.length > 4) {
        setError('CVV inválido (3 o 4 dígitos).');
        return;
      }
      const documento = cardDocument.replace(/\D/g, '');
      if (documento.length < 6) {
        setError('Documento inválido (mínimo 6 dígitos).');
        return;
      }

      setError(null);
      setProcessing(true);
      try {
        const result = await ejecutarPagoReserva({
          idConductor,
          documentoConductor,
          idZona,
          placa,
          horasEstacionamiento,
          fechaFin: fechaFinIso,
          pagoHorasEnEfectivoEnZona,
          montoCop: amountCop,
          payerEmail: emailPago,
          outcome,
          cardNumber,
          cardholderName: cardName,
          securityCode: cvv,
          expirationMonth: vencimiento.month,
          expirationYear: vencimiento.year,
          identificationNumber: documento,
        });
        if (outcome === 'approved') {
          onApproved(result);
        }
      } catch (err) {
        logApiError('ejecutarPagoReserva (UI)', err, {
          outcome,
          idZona,
          placa,
          paso: err && typeof err === 'object' && 'paso' in err ? (err as { paso: string }).paso : undefined,
        });
        setError(mensajeErrorPago(err));
      } finally {
        setProcessing(false);
      }
    },
    [
      processing,
      idConductor,
      documentoConductor,
      idZona,
      placa,
      amountCop,
      horasEstacionamiento,
      fechaFinIso,
      pagoHorasEnEfectivoEnZona,
      emailPago,
      cardNumber,
      cardName,
      cardCvv,
      cardExpiry,
      cardDocument,
      onApproved,
    ],
  );

  return (
    <ScrollView
      className="max-h-[96%] w-full rounded-3xl bg-white"
      style={{ minHeight: 520 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <View className="flex-row items-center justify-between border-b border-slate-200 px-4 py-3.5">
        <Pressable onPress={onBack} hitSlop={12} disabled={processing} className="p-1 active:opacity-70">
          <MaterialIcons name="arrow-back" size={24} color={MP_NAVY} />
        </Pressable>
        <View className="flex-row items-center gap-1.5">
          <View
            className="h-7 w-7 items-center justify-center rounded-full"
            style={{ backgroundColor: '#ffe600' }}>
            <MaterialIcons name="handshake" size={18} color={MP_NAVY} />
          </View>
          <Text className="text-lg font-bold" style={{ color: MP_NAVY }}>
            mercado pago
          </Text>
        </View>
        <View className="w-8" />
      </View>

      <View className="px-4 py-4" style={{ backgroundColor: `${MP_SKY}18` }}>
        <Text className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Flujo seguro
        </Text>
        <Text className="mt-0.5 text-sm text-slate-600">{description}</Text>
        <Text className="mt-2 text-3xl font-bold text-slate-900">{formatCopCompact(amountCop)}</Text>
        <Text className="mt-1 text-sm text-slate-600">
          {pagoHorasEnEfectivoEnZona
            ? `Reserva en línea · estacionamiento en efectivo en zona · fin ${fechaFinLegible}`
            : `Estacionamiento: ${horasEstacionamiento} h · fin ${fechaFinLegible}`}
        </Text>
      </View>

      <View className="px-4 pb-2 pt-1">
        <Text className="mb-2 text-sm font-semibold text-slate-700">Tarjeta de pago Mastercard</Text>
        <Text className="mb-1 text-xs font-medium text-slate-600">Número de tarjeta</Text>
        <TextInput
          className="mb-3 rounded-xl border border-slate-200 px-3 py-3.5 text-base text-slate-900"
          placeholder="5254 1336 7440 3564"
          value={cardNumber}
          onChangeText={setCardNumber}
          keyboardType="number-pad"
          editable={!processing}
        />

        <Text className="mb-1 text-xs font-medium text-slate-600">Titular</Text>
        <TextInput
          className="mb-3 rounded-xl border border-slate-200 px-3 py-3.5 text-base text-slate-900"
          placeholder="APRO"
          value={cardName}
          onChangeText={setCardName}
          autoCapitalize="characters"
          editable={!processing}
        />

        <View className="mb-3 flex-row gap-3">
          <View className="flex-1">
            <Text className="mb-1 text-xs font-medium text-slate-600">Vencimiento (MM/AA)</Text>
            <TextInput
              className="rounded-xl border border-slate-200 px-3 py-3.5 text-base text-slate-900"
              placeholder="11/30"
              value={cardExpiry}
              onChangeText={setCardExpiry}
              keyboardType="number-pad"
              maxLength={7}
              editable={!processing}
            />
          </View>
          <View className="w-[100px]">
            <Text className="mb-1 text-xs font-medium text-slate-600">CVV</Text>
            <TextInput
              className="rounded-xl border border-slate-200 px-3 py-3.5 text-base text-slate-900"
              placeholder="123"
              value={cardCvv}
              onChangeText={(t) => setCardCvv(t.replace(/\D/g, '').slice(0, 4))}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              editable={!processing}
            />
          </View>
        </View>

        <Text className="mb-1 text-xs font-medium text-slate-600">Documento (CC)</Text>
        <TextInput
          className="mb-2 rounded-xl border border-slate-200 px-3 py-3.5 text-base text-slate-900"
          placeholder="123456789"
          value={cardDocument}
          onChangeText={(t) => setCardDocument(t.replace(/\D/g, '').slice(0, 15))}
          keyboardType="number-pad"
          editable={!processing}
        />

        <Text className="text-[11px] leading-4 text-slate-400">
          Los datos de tarjeta solo se envían a Mercado Pago. ParkNear recibe únicamente la confirmación de pago.
        </Text>
      </View>

      {error ? (
        <View className="mx-4 mt-2 rounded-xl bg-red-50 px-3 py-2.5">
          <Text className="text-sm text-red-800">{error}</Text>
        </View>
      ) : null}

      <View className="gap-2 px-4 pb-7 pt-4">
        <Pressable
          onPress={() => runPayment('approved')}
          disabled={processing}
          className="items-center rounded-xl py-4 active:opacity-90"
          style={{ backgroundColor: MP_SKY, opacity: processing ? 0.7 : 1 }}>
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-bold text-white">Pagar {formatCopCompact(amountCop)}</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}
