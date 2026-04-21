import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

const BORDER = 'border border-pn-navy/80';
const pillBase =
  'mb-3 flex-row items-center rounded-full bg-white py-4 pl-5 pr-5 active:bg-pn-sky-fade/60';

function PillTextOnly({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className={`${pillBase} ${BORDER}`}>
      <Text className="flex-1 text-left text-[16px] font-medium text-pn-navy">{label}</Text>
    </Pressable>
  );
}

function PillWithIcon({
  icon,
  label,
  onPress,
}: {
  icon: MaterialIconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className={`${pillBase} gap-3 ${BORDER}`}>
      <MaterialIcons name={icon} size={24} color="#0f172a" />
      <Text className="flex-1 text-left text-[16px] font-medium text-pn-navy">{label}</Text>
    </Pressable>
  );
}

export function ProfileAjustesView({
  onBack,
  onTuInformacion,
}: {
  onBack: () => void;
  onTuInformacion: () => void;
}) {
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
      <Text className="mb-8 text-3xl font-bold text-pn-navy">Ajustes</Text>

      <PillTextOnly label="Tu información" onPress={onTuInformacion} />
      <PillTextOnly
        label="Elimina tu cuenta :("
        onPress={() =>
          Alert.alert(
            'Eliminar cuenta',
            'Esta acción no se puede deshacer. ¿Deseas continuar?',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Eliminar', style: 'destructive', onPress: () => {} },
            ]
          )
        }
      />
    </View>
  );
}

export function ProfileAyudaView({
  onBack,
  onEvaluanos,
  onReportaError,
}: {
  onBack: () => void;
  onEvaluanos: () => void;
  onReportaError: () => void;
}) {
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
      <Text className="mb-8 text-3xl font-bold text-pn-navy">Ayuda</Text>

      <PillWithIcon icon="warning" label="Reporta un error" onPress={onReportaError} />
      <PillWithIcon icon="star-border" label="Evalúanos" onPress={onEvaluanos} />
    </View>
  );
}
