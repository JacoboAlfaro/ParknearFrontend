import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  authBackgroundFooterHeight,
  ParkNearBackground,
} from '@/components/auth/parknear-background';
import { BrandingHeader } from '@/components/auth/branding-header';
import { LabeledField } from '@/components/molecules/labeled-field';
import { ParkNearColors } from '@/constants/parknear-theme';
import { useAuth } from '@/contexts/auth-context';
import { routeForRole } from '@/lib/auth-routes';

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const scrollBottomPad = authBackgroundFooterHeight(width) + 24;
  const { user, signIn, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (user) {
    return <Redirect href={routeForRole(user.role)} />;
  }

  const onLogin = async () => {
    setError(null);
    const result = await signIn(email.trim(), password);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.replace(routeForRole(result.role));
  };

  return (
    <ParkNearBackground>
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          className="flex-1"
          style={{ minHeight: 0 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
          <View className="flex-1" style={{ minHeight: 0 }}>
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ flexGrow: 1, paddingBottom: scrollBottomPad }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <View className="px-5 pt-6">
                <BrandingHeader compact prominent />

                <View className="overflow-hidden rounded-3xl border border-white/45 bg-white/55 px-6 py-7 shadow-lg shadow-pn-navy/15 elevation-6">
                <View className="mb-5 items-center">
                  <View className="mb-3 h-1 w-12 rounded-full bg-pn-accent/90" />
                  <Text className="text-xs font-semibold uppercase tracking-[2.5px] text-pn-slogan">
                    Inicio de sesión
                  </Text>
                  <Text className="mt-1.5 text-2xl font-bold tracking-tight text-pn-navy">Accede</Text>
                </View>

                {error ? (
                  <Text className="mb-3 rounded-xl bg-red-500/15 px-3 py-2 text-center text-sm text-red-800">
                    {error}
                  </Text>
                ) : null}

                <LabeledField
                  label="Correo electrónico"
                  placeholder="tu@correo.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />

                <LabeledField
                  label="Contraseña"
                  containerClassName="mb-6"
                  placeholder="contraseña"
                  value={password}
                  onChangeText={setPassword}
                  showPasswordToggle
                />

                <Pressable
                  className="overflow-hidden rounded-2xl active:opacity-92 active:scale-[0.99]"
                  onPress={onLogin}
                  disabled={loading}>
                  <LinearGradient
                    colors={[ParkNearColors.navy, '#2A4F72']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      paddingVertical: 16,
                      alignItems: 'center',
                      borderRadius: 16,
                    }}>
                    {loading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text className="text-[17px] font-bold text-white">Ingresar</Text>
                    )}
                  </LinearGradient>
                </Pressable>
              </View>
              </View>

              <Pressable
                onPress={() => router.push('/register')}
                className="items-center px-5 py-3 active:opacity-70">
                <Text className="text-center text-[15px] font-medium text-pn-navy/75">
                  ¿Sin cuenta?{' '}
                  <Text className="font-semibold text-pn-navy underline">crea una cuenta</Text>
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ParkNearBackground>
  );
}
