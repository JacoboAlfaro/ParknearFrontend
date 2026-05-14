import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { partirNombreCompuesto } from '@/models';

export default function RegisterScreen() {
  const { width } = useWindowDimensions();
  const scrollBottomPad = authBackgroundFooterHeight(width) + 24;
  const { user, signUp, loading } = useAuth();

  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [documento, setDocumento] = useState('');
  const [celular, setCelular] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (user) {
    return <Redirect href={routeForRole(user.role)} />;
  }

  const onRegister = async () => {
    setError(null);

    if (!nombres.trim() || !apellidos.trim()) {
      Alert.alert('Datos incompletos', 'Completa nombres y apellidos.');
      return;
    }
    if (!documento.trim()) {
      Alert.alert('Datos incompletos', 'Ingresa tu número de documento.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Datos incompletos', 'Ingresa tu correo electrónico.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Datos incompletos', 'Ingresa una contraseña.');
      return;
    }
    const soloDigitosCel = celular.trim().replace(/\D/g, '');
    if (soloDigitosCel.length < 10 || soloDigitosCel.length > 13) {
      Alert.alert('Celular', 'Ingresa un número válido (10 a 13 dígitos).');
      return;
    }

    const n = partirNombreCompuesto(nombres);
    const a = partirNombreCompuesto(apellidos);

    const result = await signUp({
      documento_identidad: documento.trim(),
      primer_nombre: n.primero,
      segundo_nombre: n.segundo,
      primer_apellido: a.primero,
      segundo_apellido: a.segundo,
      email: email.trim().toLowerCase(),
      contrasena: password,
      celular: soloDigitosCel,
    });

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
                    Registro
                  </Text>
                  <Text className="mt-1.5 text-2xl font-bold tracking-tight text-pn-navy">
                    Crea tu cuenta
                  </Text>
                </View>

                {error ? (
                  <Text className="mb-3 rounded-xl bg-red-500/15 px-3 py-2 text-center text-sm text-red-800">
                    {error}
                  </Text>
                ) : null}

                <LabeledField
                  label="Nombre(s)"
                  placeholder="Nombre(s) del usuario"
                  value={nombres}
                  onChangeText={setNombres}
                  autoCapitalize="words"
                />

                <LabeledField
                  label="Apellidos"
                  placeholder="Apellidos del usuario"
                  value={apellidos}
                  onChangeText={setApellidos}
                  autoCapitalize="words"
                />

                <LabeledField
                  label="Documento"
                  placeholder="Número de documento"
                  value={documento}
                  onChangeText={setDocumento}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <LabeledField
                  label="Celular"
                  placeholder="Número de celular (10 dígitos)"
                  value={celular}
                  onChangeText={setCelular}
                  keyboardType="phone-pad"
                  maxLength={13}
                />

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
                  containerClassName="mb-5"
                  placeholder="contraseña"
                  value={password}
                  onChangeText={setPassword}
                  showPasswordToggle
                />

                <Pressable
                  className="overflow-hidden rounded-2xl active:opacity-92 active:scale-[0.99]"
                  onPress={onRegister}
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
                      <Text className="text-[17px] font-bold text-white">Regístrate</Text>
                    )}
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
