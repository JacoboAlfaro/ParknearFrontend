import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DashboardNavTile } from '@/components/admin/dashboard-nav-tile';
import { DashboardStat } from '@/components/admin/dashboard-stat';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { useAuth } from '@/contexts/auth-context';
import { useEncargadoReservas } from '@/contexts/encargado-reservas-context';

export default function EncargadoPanelScreen() {
  const { user, signOut } = useAuth();
  const { reservas } = useEncargadoReservas();

  const pendientes = reservas.filter((r) => r.estado === 'pendiente').length;
  const aceptadas = reservas.filter((r) => r.estado === 'activa').length;

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
            ParkNear · Encargado
          </Text>
          <Text className="mt-1 text-2xl font-bold text-pn-navy">Hola, {user?.displayName}</Text>
          <Text className="mt-1 text-base text-pn-navy/70">
            Gestiona las reservas de tu zona azul y confirma cuando los vehículos lleguen.
          </Text>

          <View className="mt-6 flex-row gap-3">
            <DashboardStat value={pendientes} label="Por revisar" accentClassName="text-amber-700" />
            <DashboardStat value={aceptadas} label="Aceptadas" accentClassName="text-blue-700" />
            <DashboardStat value={reservas.length} label="Total" />
          </View>

          <Text className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-pn-navy/50">
            Acciones
          </Text>

          <DashboardNavTile
            icon="event-note"
            title="Gestión de reservas"
            subtitle="Aceptar o rechazar solicitudes y registrar la llegada del vehículo"
            iconBgClassName="bg-sky-500/15"
            onPress={() => router.push('/encargado/reservas')}
          />

          <SignOutButton onPress={onSignOut} className="mt-6" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
