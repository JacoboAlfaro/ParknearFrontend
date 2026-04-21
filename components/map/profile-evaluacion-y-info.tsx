import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

const CARD_BORDER = 'rounded-2xl border border-pn-border/60 bg-white px-4 py-3.5';
const RED_SEND = '#e11d48';
const CORAL_SEND = '#FF5A5F';

type InfoProps = {
  onBack: () => void;
  fullName: string;
  email: string;
  telefono: string;
  documentoEtiqueta: string;
};

export function ProfileTuInformacionView({
  onBack,
  fullName,
  email,
  telefono,
  documentoEtiqueta,
}: InfoProps) {
  return (
    <View className="flex-1">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Volver"
        onPress={onBack}
        hitSlop={12}
        className="mb-4 self-start p-1">
        <MaterialIcons name="arrow-back" size={28} color="#0f172a" />
      </Pressable>

      <Text className="mb-6 text-3xl font-bold text-pn-navy">Tu Información</Text>

      <View className={`mb-3 ${CARD_BORDER}`}>
        <Text className="text-[15px] font-bold text-pn-navy">Tu Nombre</Text>
        <Text className="mt-1.5 text-[15px] text-pn-navy/55">{fullName}</Text>
      </View>

      <View className={`mb-3 ${CARD_BORDER}`}>
        <Text className="text-[15px] font-bold text-pn-navy">Tu Número</Text>
        <Text className="mt-1.5 text-[15px] text-pn-navy/55">{telefono}</Text>
      </View>

      <View className={`mb-3 ${CARD_BORDER}`}>
        <Text className="text-[15px] font-bold text-pn-navy">Tu Correo</Text>
        <Text className="mt-1.5 text-[15px] text-pn-navy/55">{email}</Text>
      </View>

      <View className={CARD_BORDER}>
        <Text className="text-[15px] font-bold text-pn-navy">{fullName}</Text>
        <Text className="mt-1.5 text-[15px] text-pn-navy/55">{documentoEtiqueta}</Text>
      </View>
    </View>
  );
}

function ScaleRow({
  value,
  onChange,
  labels,
}: {
  value: number | null;
  onChange: (n: number) => void;
  labels: { left: string; right: string };
}) {
  return (
    <View className="mb-2">
      <View className="flex-row justify-between gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable
            key={n}
            accessibilityRole="button"
            accessibilityLabel={`${n}`}
            onPress={() => onChange(n)}
            className={`min-h-[44px] min-w-[44px] flex-1 items-center justify-center rounded-xl border-2 ${
              value === n ? 'border-pn-navy bg-pn-sky-fade/80' : 'border-pn-border/70 bg-white'
            }`}>
            <Text className="text-base font-bold text-pn-navy">{n}</Text>
          </Pressable>
        ))}
      </View>
      <View className="mt-2 flex-row justify-between px-0.5">
        <Text className="max-w-[42%] text-[11px] leading-tight text-pn-navy/60">{labels.left}</Text>
        <Text className="max-w-[42%] text-right text-[11px] leading-tight text-pn-navy/60">
          {labels.right}
        </Text>
      </View>
    </View>
  );
}

export function ProfileEvaluanosView({ onBack }: { onBack: () => void }) {
  const [sat, setSat] = useState<number | null>(null);
  const [ease, setEase] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [goal, setGoal] = useState<'si' | 'no' | null>(null);

  const enviar = useCallback(() => {
    if (sat === null || ease === null || goal === null) {
      Alert.alert('Faltan respuestas', 'Por favor completa las calificaciones y la última pregunta.');
      return;
    }
    Alert.alert('Gracias', 'Tu opinión nos ayuda a mejorar ParkNear.');
    onBack();
  }, [sat, ease, goal, onBack]);

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={onBack}
          hitSlop={12}
          className="mb-4 self-start p-1">
          <MaterialIcons name="arrow-back" size={28} color="#0f172a" />
        </Pressable>

        <View className={`mb-5 ${CARD_BORDER}`}>
          <Text className="text-[15px] font-semibold leading-snug text-pn-navy">
            ¿Qué tan satisfecho estás con la App de ParkNear?
          </Text>
          <View className="mt-4">
            <ScaleRow
              value={sat}
              onChange={setSat}
              labels={{ left: 'Nada satisfecho', right: 'Muy Satisfecho' }}
            />
          </View>
        </View>

        <View className={`mb-5 ${CARD_BORDER}`}>
          <Text className="text-[15px] font-semibold leading-snug text-pn-navy">
            ¿Qué tan fácil ha sido usar la App de ParkNear?
          </Text>
          <View className="mt-4">
            <ScaleRow
              value={ease}
              onChange={setEase}
              labels={{ left: 'Muy Difícil', right: 'Muy Fácil' }}
            />
          </View>
        </View>

        <View className={`mb-5 ${CARD_BORDER}`}>
          <Text className="mb-2 text-[15px] font-semibold text-pn-navy">
            Por favor indica el motivo de tu respuesta
          </Text>
          <TextInput
            className="min-h-[120px] rounded-xl border border-pn-border/60 bg-white px-3 py-3 text-[15px] text-pn-navy"
            placeholder="Escribe aquí..."
            placeholderTextColor="#94a3b8"
            value={comment}
            onChangeText={setComment}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View className={`mb-6 ${CARD_BORDER}`}>
          <Text className="mb-3 text-[15px] font-semibold text-pn-navy">
            ¿Lograste lo que querías?
          </Text>
          <View className="flex-row gap-6">
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: goal === 'si' }}
              onPress={() => setGoal('si')}
              className="flex-row items-center gap-2">
              <View
                className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                  goal === 'si' ? 'border-pn-navy bg-pn-navy' : 'border-pn-border/80 bg-white'
                }`}>
                {goal === 'si' ? <View className="h-2 w-2 rounded-full bg-white" /> : null}
              </View>
              <Text className="text-[16px] text-pn-navy">si :)</Text>
            </Pressable>
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: goal === 'no' }}
              onPress={() => setGoal('no')}
              className="flex-row items-center gap-2">
              <View
                className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                  goal === 'no' ? 'border-pn-navy bg-pn-navy' : 'border-pn-border/80 bg-white'
                }`}>
                {goal === 'no' ? <View className="h-2 w-2 rounded-full bg-white" /> : null}
              </View>
              <Text className="text-[16px] text-pn-navy">no :(</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Enviar"
          onPress={enviar}
          className="items-center rounded-full py-4 active:opacity-90"
          style={{ backgroundColor: RED_SEND }}>
          <Text className="text-[17px] font-bold text-white">Enviar</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function ProfileReportaErrorView({ onBack }: { onBack: () => void }) {
  const [mensaje, setMensaje] = useState('');

  const enviar = useCallback(() => {
    const t = mensaje.trim();
    if (!t) {
      Alert.alert('Mensaje vacío', 'Describe el error antes de enviar.');
      return;
    }
    Alert.alert(
      'Reporte enviado',
      'En el transcurso del día te enviaremos un correo sobre el estado de tu situación.'
    );
    setMensaje('');
    onBack();
  }, [mensaje, onBack]);

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={onBack}
          hitSlop={12}
          className="mb-4 self-start p-1">
          <MaterialIcons name="arrow-back" size={28} color="#0f172a" />
        </Pressable>

        <Text className="mb-6 text-3xl font-bold text-pn-navy">Reporta un error</Text>

        <View className="rounded-3xl border border-pn-border/55 bg-white px-5 py-5">
          <Text className="text-[16px] font-bold text-pn-navy">Describe tu error</Text>
          <Text className="mt-2 text-[13px] leading-snug text-pn-navy/55">
            En el transcurso del día te enviaremos un correo sobre el estado de tu situación.
          </Text>

          <TextInput
            className="mt-4 min-h-[160px] rounded-2xl border border-pn-border/60 bg-white px-4 py-3.5 text-[15px] text-pn-navy"
            placeholder="Tu mensaje aquí"
            placeholderTextColor="#94a3b8"
            value={mensaje}
            onChangeText={setMensaje}
            multiline
            textAlignVertical="top"
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Enviar reporte"
            onPress={enviar}
            className="mt-6 items-center rounded-full py-4 active:opacity-90"
            style={{ backgroundColor: CORAL_SEND }}>
            <Text className="text-[17px] font-bold text-white">Enviar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
