import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DashboardNavTile } from '@/components/admin/dashboard-nav-tile';
import { DashboardStat } from '@/components/admin/dashboard-stat';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { useAdminSolicitudes } from '@/contexts/admin-solicitudes-context';
import { useAdminUsuarios } from '@/contexts/admin-usuarios-context';
import { useAdminZonas } from '@/contexts/admin-zonas-context';
import { countPendingSolicitudes } from '@/data/mock-admin-dashboard';
import { useAuth } from '@/contexts/auth-context';

export default function AdminDashboardScreen() {
  const { user, signOut } = useAuth();
  const { usuarios } = useAdminUsuarios();
  const { solicitudes } = useAdminSolicitudes();
  const { zonas } = useAdminZonas();
  const pendingSolicitudes = countPendingSolicitudes(solicitudes);
  const zonasOperativas = zonas.filter((z) => z.estado_operacion === 'operativa').length;

  const onSignOut = () => {
    signOut();
    router.replace('/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-pn-sky-fade" edges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-2">
          <Text className="text-sm font-medium uppercase tracking-wide text-pn-slogan">
            ParkNear
          </Text>
          <Text className="mt-1 text-2xl font-bold text-pn-navy">Hola, {user?.displayName}</Text>
          <Text className="mt-1 text-base text-pn-navy/70">
            Resumen del sistema y accesos rápidos a la gestión de ParkNear.
          </Text>

          <View className="mt-6 flex-row gap-3">
            <DashboardStat value={usuarios.length} label="Usuarios registrados" />
            <DashboardStat value={zonas.length} label="Zonas azules gestionadas" />
            <DashboardStat
              value={pendingSolicitudes}
              label="Solicitudes pendientes"
              accentClassName="text-amber-700"
            />
          </View>

          <Text className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-pn-navy/50">
            Gestionar
          </Text>

          <DashboardNavTile
            icon="people"
            title="Usuarios"
            subtitle="Ver estado, datos y activar o desactivar"
            iconBgClassName="bg-sky-500/15"
            onPress={() => router.push('/admin/usuarios')}
          />
          <DashboardNavTile
            icon="local-parking"
            title="Zonas azules"
            subtitle={`${zonasOperativas} operativas · cupos y ubicación`}
            iconBgClassName="bg-blue-600/15"
            onPress={() => router.push('/admin/zonas-azules')}
          />
          <DashboardNavTile
            icon="assignment"
            title="Solicitudes"
            subtitle={`${pendingSolicitudes} pendientes de revisión`}
            iconBgClassName="bg-amber-500/20"
            onPress={() => router.push('/admin/solicitudes')}
          />

          <SignOutButton onPress={onSignOut} className="mt-6" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
