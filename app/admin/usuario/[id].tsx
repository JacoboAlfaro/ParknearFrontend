import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ROL_USUARIO_LABELS, ROLES_USUARIO } from '@/data/admin-usuarios';
import type { UserRole } from '@/data/mock-users';
import { useAdminUsuarios } from '@/contexts/admin-usuarios-context';
import { ESTADO_USUARIO_LABELS, nombreCompletoUsuario, type EstadoUsuario } from '@/models';

function formatFecha(iso: string) {
  try {
    return new Date(iso).toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

const estadosOrden: EstadoUsuario[] = ['activo', 'no_verificado', 'inactivo', 'eliminado'];

export default function AdminUsuarioDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { usuarios, setEstado, setRol } = useAdminUsuarios();
  const usuario = id ? usuarios.find((u) => u.id === id) : undefined;

  useLayoutEffect(() => {
    if (usuario) {
      navigation.setOptions({
        title: nombreCompletoUsuario(usuario) || 'Usuario',
      });
    }
  }, [navigation, usuario]);

  if (!usuario) {
    return (
      <SafeAreaView className="flex-1 bg-pn-sky-fade px-5 pt-4" edges={['bottom']}>
        <Text className="text-base text-pn-navy/70">No se encontró el usuario.</Text>
      </SafeAreaView>
    );
  }

  const onCambiarEstado = (siguiente: EstadoUsuario) => {
    if (siguiente === 'eliminado' && usuario.estado !== 'eliminado') {
      Alert.alert(
        'Marcar como eliminado',
        'El usuario quedará marcado como eliminado y no podrá acceder a la cuenta.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Confirmar', style: 'destructive', onPress: () => setEstado(usuario.id, 'eliminado') },
        ],
      );
      return;
    }
    setEstado(usuario.id, siguiente);
  };

  const onCambiarRol = (rol: UserRole) => {
    setRol(usuario.id, rol);
  };

  return (
    <SafeAreaView className="flex-1 bg-pn-sky-fade" edges={['bottom']}>
      <ScrollView
        className="flex-1 px-5 pt-2"
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}>
        <View className="rounded-2xl border border-white/55 bg-white/95 p-5 shadow-sm shadow-pn-navy/8">
          <Text className="text-xs font-semibold uppercase tracking-wider text-pn-navy/45">
            Identificación
          </Text>
          <Text className="mt-1 text-lg font-bold text-pn-navy">{usuario.documento_identidad}</Text>

          <Text className="mb-1 mt-5 text-xs font-semibold uppercase tracking-wider text-pn-navy/45">
            Nombre completo
          </Text>
          <Text className="text-base text-pn-navy">{nombreCompletoUsuario(usuario)}</Text>

          <Text className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wider text-pn-navy/45">
            Primer nombre
          </Text>
          <Text className="text-base text-pn-navy">{usuario.primer_nombre}</Text>
          {usuario.segundo_nombre ? (
            <>
              <Text className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wider text-pn-navy/45">
                Segundo nombre
              </Text>
              <Text className="text-base text-pn-navy">{usuario.segundo_nombre}</Text>
            </>
          ) : null}

          <Text className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wider text-pn-navy/45">
            Primer apellido
          </Text>
          <Text className="text-base text-pn-navy">{usuario.primer_apellido}</Text>
          {usuario.segundo_apellido ? (
            <>
              <Text className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wider text-pn-navy/45">
                Segundo apellido
              </Text>
              <Text className="text-base text-pn-navy">{usuario.segundo_apellido}</Text>
            </>
          ) : null}

          <Text className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wider text-pn-navy/45">
            Correo
          </Text>
          <Text className="text-base text-pn-navy">{usuario.email}</Text>

          <Text className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wider text-pn-navy/45">
            Celular
          </Text>
          <Text className="text-base text-pn-navy">{usuario.celular}</Text>

          <Text className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wider text-pn-navy/45">
            Fecha creación
          </Text>
          <Text className="text-sm text-pn-navy/70">{formatFecha(usuario.fecha_creacion)}</Text>

          <Text className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wider text-pn-navy/45">
            Última actualización
          </Text>
          <Text className="text-sm text-pn-navy/70">{formatFecha(usuario.fecha_actualizacion)}</Text>
        </View>

        <View className="mt-5 rounded-2xl border border-white/55 bg-white/95 p-4 shadow-sm shadow-pn-navy/8">
          <Text className="text-base font-semibold text-pn-navy">Rol en la app</Text>
          <Text className="mt-1 text-sm text-pn-navy/55">
            Define qué permisos tendrá al iniciar sesión (administrador, encargado o conductor).
          </Text>
          <View className="mt-4 flex-row flex-wrap gap-2">
            {ROLES_USUARIO.map((r) => (
              <Pressable
                key={r}
                onPress={() => onCambiarRol(r)}
                className={`rounded-xl border px-3 py-2.5 ${
                  usuario.rol === r
                    ? 'border-violet-700 bg-violet-500/12'
                    : 'border-pn-border/55 bg-pn-white/90'
                }`}>
                <Text
                  className={`text-center text-sm font-semibold ${
                    usuario.rol === r ? 'text-violet-900' : 'text-pn-navy/65'
                  }`}>
                  {ROL_USUARIO_LABELS[r]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mt-5 rounded-2xl border border-white/55 bg-white/95 p-4 shadow-sm shadow-pn-navy/8">
          <Text className="text-base font-semibold text-pn-navy">Estado de la cuenta</Text>
          <Text className="mt-1 text-sm text-pn-navy/55">
            Define el estado actual de la cuenta del usuario.
          </Text>
          <View className="mt-4 flex-row flex-wrap gap-2">
            {estadosOrden.map((est) => (
              <Pressable
                key={est}
                onPress={() => onCambiarEstado(est)}
                className={`rounded-xl border px-3 py-2.5 ${
                  usuario.estado === est
                    ? 'border-pn-navy bg-pn-navy/12'
                    : 'border-pn-border/55 bg-pn-white/90'
                }`}>
                <Text
                  className={`text-center text-sm font-semibold ${
                    usuario.estado === est ? 'text-pn-navy' : 'text-pn-navy/65'
                  }`}>
                  {ESTADO_USUARIO_LABELS[est]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
