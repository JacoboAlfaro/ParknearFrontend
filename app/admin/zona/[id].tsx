import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useLayoutEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LabeledField } from '@/components/molecules/labeled-field';
import { ParkNearColors } from '@/constants/parknear-theme';
import { useAdminZonas } from '@/contexts/admin-zonas-context';
import type { ZonaAzulVista } from '@/models';

const estadosOperacion: ZonaAzulVista['estado_operacion'][] = [
  'operativa',
  'mantenimiento',
  'inactiva',
];

type FormValues = Omit<ZonaAzulVista, 'id'> & { indicaciones: string };

const emptyForm = (): FormValues => ({
  latitud: 5.07,
  longitud: -75.51,
  indicaciones: '',
  capacidad: 0,
  capacidad_total: 10,
  estado_operacion: 'operativa',
});

function zonaToForm(z: ZonaAzulVista): FormValues {
  return {
    latitud: z.latitud,
    longitud: z.longitud,
    indicaciones: z.indicaciones?.trim() ?? '',
    capacidad: z.capacidad,
    capacidad_total: z.capacidad_total,
    estado_operacion: z.estado_operacion,
  };
}

function formToPayload(f: FormValues): Omit<ZonaAzulVista, 'id'> {
  const ind = f.indicaciones.trim();
  return {
    latitud: f.latitud,
    longitud: f.longitud,
    indicaciones: ind.length > 0 ? ind : null,
    capacidad: f.capacidad,
    capacidad_total: f.capacidad_total,
    estado_operacion: f.estado_operacion,
  };
}

function parseNum(s: string, fallback: number): number {
  const n = Number(String(s).replace(',', '.').trim());
  return Number.isFinite(n) ? n : fallback;
}

function parseIntSafe(s: string, fallback: number): number {
  const n = parseInt(String(s).trim(), 10);
  return Number.isFinite(n) ? n : fallback;
}

export default function AdminZonaFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { getZona, addZona, updateZona } = useAdminZonas();

  const isNew = id === 'nueva';
  const numericId = !isNew && id ? Number(id) : NaN;
  const existente = !isNew && Number.isFinite(numericId) ? getZona(numericId) : undefined;

  const [form, setForm] = useState<FormValues>(() => {
    if (isNew || !existente) return emptyForm();
    return zonaToForm(existente);
  });

  const tituloPantalla = isNew ? 'Nueva zona' : 'Editar zona';

  useLayoutEffect(() => {
    navigation.setOptions({ title: tituloPantalla });
  }, [navigation, tituloPantalla]);

  useEffect(() => {
    if (isNew) {
      setForm(emptyForm());
      return;
    }
    if (existente) {
      setForm(zonaToForm(existente));
    }
  }, [isNew, id]);

  if (!isNew && (!Number.isFinite(numericId) || !existente)) {
    return (
      <SafeAreaView className="flex-1 bg-pn-sky-fade px-5 pt-4" edges={['bottom']}>
        <Text className="text-base text-pn-navy/70">Zona no encontrada.</Text>
        <Pressable onPress={() => router.back()} className="mt-4 py-2 active:opacity-70">
          <Text className="font-semibold text-pn-navy">Volver</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const onGuardar = () => {
    const ind = form.indicaciones.trim();
    if (ind.length < 8) {
      Alert.alert(
        'Indicaciones',
        'Escribe al menos 8 caracteres con la dirección y referencias de la zona.',
      );
      return;
    }
    if (form.capacidad_total < 1) {
      Alert.alert('Cupos', 'La capacidad total debe ser al menos 1.');
      return;
    }
    if (form.capacidad < 0 || form.capacidad > form.capacidad_total) {
      Alert.alert('Cupos', 'Los cupos disponibles deben estar entre 0 y la capacidad total.');
      return;
    }

    const payload = formToPayload(form);

    if (isNew) {
      addZona(payload);
    } else {
      updateZona(numericId, payload);
    }
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-pn-sky-fade" edges={['bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <ScrollView
          className="flex-1 px-5 pt-3"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}>
          <LabeledField
            label="Indicaciones"
            placeholder="Dirección, barrio y cómo llegar (puedes usar varias líneas)."
            value={form.indicaciones}
            onChangeText={(t) => setForm((f) => ({ ...f, indicaciones: t }))}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            containerClassName="mb-4"
            className="min-h-[140px] py-3"
            autoCapitalize="sentences"
          />
          <LabeledField
            label="Latitud"
            placeholder="5.0704"
            value={String(form.latitud)}
            onChangeText={(t) => setForm((f) => ({ ...f, latitud: parseNum(t, f.latitud) }))}
            keyboardType="decimal-pad"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <LabeledField
            label="Longitud"
            placeholder="-75.5178"
            value={String(form.longitud)}
            onChangeText={(t) => setForm((f) => ({ ...f, longitud: parseNum(t, f.longitud) }))}
            keyboardType="decimal-pad"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <LabeledField
            label="Cupos disponibles"
            placeholder="0"
            value={String(form.capacidad)}
            onChangeText={(t) => setForm((f) => ({ ...f, capacidad: parseIntSafe(t, f.capacidad) }))}
            keyboardType="number-pad"
          />
          <LabeledField
            label="Capacidad total"
            placeholder="10"
            value={String(form.capacidad_total)}
            onChangeText={(t) =>
              setForm((f) => ({ ...f, capacidad_total: parseIntSafe(t, f.capacidad_total) }))
            }
            keyboardType="number-pad"
            containerClassName="mb-3"
          />

          <Text className="mb-2 ml-1 text-xs font-medium text-pn-navy/55">Estado operación</Text>
          <View className="mb-6 flex-row flex-wrap gap-2">
            {estadosOperacion.map((est) => (
              <Pressable
                key={est}
                onPress={() => setForm((f) => ({ ...f, estado_operacion: est }))}
                className={`min-w-[30%] flex-1 rounded-2xl border py-3 ${
                  form.estado_operacion === est
                    ? 'border-pn-navy bg-pn-navy/10'
                    : 'border-pn-border/60 bg-pn-white/95'
                }`}>
                <Text
                  className={`text-center text-sm font-semibold capitalize ${
                    form.estado_operacion === est ? 'text-pn-navy' : 'text-pn-navy/60'
                  }`}>
                  {est}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            className="overflow-hidden rounded-2xl active:opacity-92 active:scale-[0.99]"
            onPress={onGuardar}>
            <LinearGradient
              colors={[ParkNearColors.navy, '#2A4F72']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ paddingVertical: 16, alignItems: 'center', borderRadius: 16 }}>
              <Text className="text-[17px] font-bold text-white">
                {isNew ? 'Crear zona' : 'Guardar cambios'}
              </Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
