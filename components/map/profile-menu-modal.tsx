import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { Alert, Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ParkNearColors } from '@/constants/parknear-theme';
import type { UserProfilePreview } from '@/data/mock-user-profile';

type Props = {
  visible: boolean;
  onClose: () => void;
  user: UserProfilePreview;
};

const iconMuted = '#64748b';
const iconSize = 22;

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

function MenuPill({
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
      className="mb-3 flex-row items-center justify-center gap-2 rounded-full border border-pn-border/55 bg-white py-3.5 pl-4 pr-5 active:bg-pn-sky-fade/80">
      <MaterialIcons name={icon} size={iconSize} color={iconMuted} />
      <Text className="text-[16px] font-medium text-pn-navy/70">{label}</Text>
    </Pressable>
  );
}

export function ProfileMenuModal({ visible, onClose, user }: Props) {
  const insets = useSafeAreaInsets();

  const handleSettings = () => {
    onClose();
    Alert.alert('Ajustes', 'Esta sección estará disponible pronto.');
  };

  const handleHelp = () => {
    onClose();
    Alert.alert('Ayuda', 'Esta sección estará disponible pronto.');
  };

  const handleLogout = () => {
    onClose();
    router.replace('/login');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View className="flex-1 justify-start">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar menú"
          onPress={onClose}
          className="absolute inset-0 z-0 bg-pn-navy/45"
        />

        <View
          className="relative z-10 mx-4 rounded-[28px] border border-pn-border/30 bg-white p-6 shadow-2xl shadow-pn-navy/25"
          style={{
            marginTop: Math.max(insets.top, 12) + 8,
          }}>
          <View className="mb-6 flex-row items-center gap-4">
            <View className="h-16 w-16 overflow-hidden rounded-full border border-pn-border/40 bg-pn-sky-fade/90">
              {user.avatarUrl ? (
                <Image
                  source={{ uri: user.avatarUrl }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  accessibilityLabel="Foto de perfil"
                />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <MaterialIcons name="person" size={36} color={ParkNearColors.buttonSlate} />
                </View>
              )}
            </View>
            <View className="min-w-0 flex-1">
              <Text className="text-lg font-bold leading-snug text-pn-navy" numberOfLines={2}>
                {user.name}
              </Text>
              <Text className="mt-1 text-sm text-pn-navy/50" numberOfLines={2}>
                {user.email}
              </Text>
            </View>
          </View>

          <MenuPill icon="settings" label="Ajustes" onPress={handleSettings} />
          <MenuPill icon="help-outline" label="Ayuda" onPress={handleHelp} />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
            onPress={handleLogout}
            className="mt-1 flex-row items-center justify-center gap-2 rounded-full border border-red-200/90 bg-red-50/80 py-3.5 pl-4 pr-5 active:opacity-85">
            <MaterialIcons name="logout" size={iconSize} color="#b91c1c" />
            <Text className="text-[16px] font-semibold text-red-700">Cerrar sesión</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
