import { Redirect, Stack } from 'expo-router';

import { AdminSolicitudesProvider } from '@/contexts/admin-solicitudes-context';
import { AdminUsuariosProvider } from '@/contexts/admin-usuarios-context';
import { AdminZonasProvider } from '@/contexts/admin-zonas-context';
import { useAuth } from '@/contexts/auth-context';
import { routeForRole } from '@/lib/auth-routes';

export default function AdminLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/login" />;
  }
  if (user.role !== 'admin') {
    return <Redirect href={routeForRole(user.role)} />;
  }

  return (
    <AdminSolicitudesProvider>
      <AdminUsuariosProvider>
        <AdminZonasProvider>
          <Stack
            screenOptions={{
              headerShown: true,
              headerTintColor: '#0f172a',
              headerStyle: { backgroundColor: '#f8fafc' },
              headerTitleStyle: { fontWeight: '700' },
              headerShadowVisible: false,
            }}>
            <Stack.Screen name="index" options={{ title: 'Panel admin' }} />
            <Stack.Screen name="usuarios" options={{ title: 'Usuarios' }} />
            <Stack.Screen name="usuario/[id]" options={{ title: 'Usuario' }} />
            <Stack.Screen name="zonas-azules" options={{ title: 'Zonas azules' }} />
            <Stack.Screen name="solicitudes" options={{ title: 'Solicitudes' }} />
            <Stack.Screen name="solicitud/[id]" options={{ title: 'Detalle' }} />
            <Stack.Screen name="zona/[id]" options={{ title: 'Zona' }} />
          </Stack>
        </AdminZonasProvider>
      </AdminUsuariosProvider>
    </AdminSolicitudesProvider>
  );
}
