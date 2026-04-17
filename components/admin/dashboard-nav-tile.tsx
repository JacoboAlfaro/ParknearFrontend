import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

type Props = {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress: () => void;
  iconBgClassName?: string;
};

export function DashboardNavTile({
  icon,
  title,
  subtitle,
  onPress,
  iconBgClassName = 'bg-blue-600/15',
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      className="mb-3 flex-row items-center overflow-hidden rounded-2xl border border-white/55 bg-white/95 px-4 py-4 shadow-md shadow-pn-navy/10 active:opacity-92 active:scale-[0.99]">
      <View className={`mr-4 h-12 w-12 items-center justify-center rounded-xl ${iconBgClassName}`}>
        <MaterialIcons name={icon} size={26} color="#1e3a5f" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-pn-navy">{title}</Text>
        <Text className="mt-0.5 text-sm text-pn-navy/65">{subtitle}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#94a3b8" />
    </Pressable>
  );
}
