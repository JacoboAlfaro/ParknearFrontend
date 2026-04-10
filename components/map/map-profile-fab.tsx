import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, Text, View } from 'react-native';

import { ParkNearColors } from '@/constants/parknear-theme';
import { greetingFirstNames } from '@/data/mock-user-profile';

type Props = {
  onPress: () => void;
  fullName: string;
};

const AVATAR_SIZE = 56;
const ICON_SIZE = 32;

export function MapProfileFab({ onPress, fullName }: Props) {
  const who = greetingFirstNames(fullName);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir menú de perfil. Hola, ${who}`}
      onPress={onPress}
      className="absolute left-3 top-2 z-10 max-w-[92%] flex-row items-center gap-3 active:opacity-92">
      <View
        className="items-center justify-center rounded-full border border-pn-border/50 bg-white/95 shadow-md shadow-pn-navy/20 elevation-8"
        style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}>
        <MaterialIcons name="person" size={ICON_SIZE} color={ParkNearColors.buttonSlate} />
      </View>
      <View className="max-w-[240px] flex-shrink rounded-2xl border border-pn-border/45 bg-pn-white px-3.5 py-2.5 shadow-lg shadow-pn-navy/18 elevation-4">
        <Text className="text-[16px] font-semibold leading-tight text-pn-navy" numberOfLines={1}>
          Hola, {who}
        </Text>
      </View>
    </Pressable>
  );
}
