import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SignOutButton } from '@/components/auth/sign-out-button';
import {
  ProfileEvaluanosView,
  ProfileReportaErrorView,
  ProfileTuInformacionView,
} from '@/components/map/profile-evaluacion-y-info';
import { ProfileAjustesView, ProfileAyudaView } from '@/components/map/profile-submenu-views';
import { ParkNearColors } from '@/constants/parknear-theme';
import { useAuth } from '@/contexts/auth-context';
import { MOCK_USERS_WHITELIST } from '@/data/mock-users';
import { nombreMostradoPerfil, type UsuarioPerfilVista } from '@/data/mock-user-profile';

type Props = {
  visible: boolean;
  onClose: () => void;
  user: UsuarioPerfilVista;
};

type Submenu =
  | 'menu'
  | 'ajustes'
  | 'ayuda'
  | 'tu-informacion'
  | 'evaluanos'
  | 'reporta-error';

function formatTelefonoUi(raw: string | undefined): string {
  if (!raw) return '—';
  const d = raw.replace(/\D/g, '');
  if (d.length === 10) {
    return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  }
  return raw;
}

function documentoCcDesdeSesion(document: string): string {
  const t = document.trim();
  if (!t) return '—';
  return `CC ${t}`;
}

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
  const { signOut, user: sessionUser } = useAuth();
  const [submenu, setSubmenu] = useState<Submenu>('menu');

  const mockExtra = sessionUser
    ? MOCK_USERS_WHITELIST.find((u) => u.document === sessionUser.document)
    : undefined;
  const telefonoUi = formatTelefonoUi(mockExtra?.celular);
  const documentoEtiqueta = sessionUser
    ? documentoCcDesdeSesion(sessionUser.document)
    : '—';

  useEffect(() => {
    if (!visible) {
      setSubmenu('menu');
    }
  }, [visible]);

  const handleBackdropOrBack = () => {
    if (submenu === 'tu-informacion') {
      setSubmenu('ajustes');
      return;
    }
    if (submenu === 'evaluanos' || submenu === 'reporta-error') {
      setSubmenu('ayuda');
      return;
    }
    if (submenu === 'ajustes' || submenu === 'ayuda') {
      setSubmenu('menu');
      return;
    }
    onClose();
  };

  const handleLogout = () => {
    setSubmenu('menu');
    onClose();
    signOut();
    router.replace('/login');
  };

  const isSubmenu = submenu !== 'menu';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleBackdropOrBack}>
      <View className="flex-1">
        {isSubmenu ? (
          <View
            className="flex-1 bg-white px-5"
            style={{
              paddingTop: Math.max(insets.top, 12) + 4,
              paddingBottom: Math.max(insets.bottom, 12),
            }}>
            {submenu === 'ajustes' ? (
              <ProfileAjustesView
                onBack={() => setSubmenu('menu')}
                onTuInformacion={() => setSubmenu('tu-informacion')}
              />
            ) : submenu === 'ayuda' ? (
              <ProfileAyudaView
                onBack={() => setSubmenu('menu')}
                onEvaluanos={() => setSubmenu('evaluanos')}
                onReportaError={() => setSubmenu('reporta-error')}
              />
            ) : submenu === 'tu-informacion' ? (
              <ProfileTuInformacionView
                onBack={() => setSubmenu('ajustes')}
                fullName={nombreMostradoPerfil(user)}
                email={user.email}
                telefono={telefonoUi}
                documentoEtiqueta={documentoEtiqueta}
              />
            ) : submenu === 'evaluanos' ? (
              <ProfileEvaluanosView onBack={() => setSubmenu('ayuda')} />
            ) : (
              <ProfileReportaErrorView onBack={() => setSubmenu('ayuda')} />
            )}
          </View>
        ) : (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar menú"
              onPress={handleBackdropOrBack}
              className="absolute inset-0 z-0 bg-pn-navy/45"
            />

            <View
              className="relative z-10 mx-4 rounded-[28px] border border-pn-border/30 bg-white p-6 shadow-2xl shadow-pn-navy/25"
              style={{
                marginTop: Math.max(insets.top, 12) + 8,
              }}>
              <View className="mb-6 flex-row items-center gap-4">
                <View className="h-16 w-16 overflow-hidden rounded-full border border-pn-border/40 bg-pn-sky-fade/90">
                  {user.avatar_url ? (
                    <Image
                      source={{ uri: user.avatar_url }}
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
                    {nombreMostradoPerfil(user)}
                  </Text>
                  <Text className="mt-1 text-sm text-pn-navy/50" numberOfLines={2}>
                    {user.email}
                  </Text>
                </View>
              </View>

              <MenuPill icon="settings" label="Ajustes" onPress={() => setSubmenu('ajustes')} />
              <MenuPill icon="help-outline" label="Ayuda" onPress={() => setSubmenu('ayuda')} />

              <SignOutButton onPress={handleLogout} className="mt-1" />
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}
