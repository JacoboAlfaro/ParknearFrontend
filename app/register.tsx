import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
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

export default function RegisterScreen() {
  const { width } = useWindowDimensions();
  const scrollBottomPad = authBackgroundFooterHeight(width) + 24;

  const [nombre, setNombre] = useState('');
  const [documento, setDocumento] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onRegister = () => {
    router.replace('/(tabs)');
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
                    Registro
                  </Text>
                  <Text className="mt-1.5 text-2xl font-bold tracking-tight text-pn-navy">
                    Crea tu cuenta
                  </Text>
                </View>

                <LabeledField
                  label="Nombre completo"
                  placeholder="Nombre Completo"
                  value={nombre}
                  onChangeText={setNombre}
                  autoCapitalize="words"
                />

                <LabeledField
                  label="Documento"
                  placeholder="documento de identificación"
                  value={documento}
                  onChangeText={setDocumento}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <LabeledField
                  label="Correo"
                  placeholder="correo electronico"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />

                <LabeledField
                  label="Contraseña"
                  containerClassName="mb-5"
                  placeholder="contraseña"
                  value={password}
                  onChangeText={setPassword}
                  showPasswordToggle
                />

                <Pressable
                  className="overflow-hidden rounded-2xl active:opacity-92 active:scale-[0.99]"
                  onPress={onRegister}>
                  <LinearGradient
                    colors={[ParkNearColors.navy, '#2A4F72']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      paddingVertical: 16,
                      alignItems: 'center',
                      borderRadius: 16,
                    }}>
                    <Text className="text-[17px] font-bold text-white">Registrate</Text>
                  </LinearGradient>
                </Pressable>
              </View>
              </View>

              <Pressable
                onPress={() => router.push('/login')}
                className="items-center px-5 py-3 active:opacity-70">
                <Text className="text-center text-[15px] font-medium text-pn-navy/75">
                  ¿Ya tienes una cuenta?{' '}
                  <Text className="font-semibold text-pn-navy underline">Accede</Text>
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ParkNearBackground>
  );
}