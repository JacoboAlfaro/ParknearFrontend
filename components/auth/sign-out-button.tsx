import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, Text } from 'react-native';

const iconSize = 20;
const iconColor = '#b91c1c';

type Props = {
  onPress: () => void;
  className?: string;
};

export function SignOutButton({ onPress, className = '' }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Cerrar sesión"
      onPress={onPress}
      className={`w-full flex-row items-center justify-center gap-2 rounded-full border border-red-200/90 bg-red-50/80 py-3.5 pl-4 pr-5 active:opacity-85 ${className}`.trim()}>
      <MaterialIcons name="logout" size={iconSize} color={iconColor} />
      <Text className="text-base font-semibold text-red-700">Cerrar sesión</Text>
    </Pressable>
  );
}
