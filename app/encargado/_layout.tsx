import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/contexts/auth-context';
import { EncargadoReservasProvider } from '@/contexts/encargado-reservas-context';
import { routeForRole } from '@/lib/auth-routes';

export default function EncargadoLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/login" />;
  }
  if (user.role !== 'encargado') {
    return <Redirect href={routeForRole(user.role)} />;
  }

  return (
    <EncargadoReservasProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          headerTintColor: '#0f172a',
          headerStyle: { backgroundColor: '#f8fafc' },
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
        }}>
        <Stack.Screen name="index" options={{ title: 'Encargado' }} />
        <Stack.Screen name="reservas" options={{ title: 'Reservas zona azul' }} />
        <Stack.Screen name="reserva/[id]" options={{ title: 'Detalle reserva' }} />
      </Stack>
    </EncargadoReservasProvider>
  );
}
