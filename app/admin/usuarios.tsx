import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DashboardStat } from '@/components/admin/dashboard-stat';
import { LabeledField } from '@/components/molecules/labeled-field';
import { ParkNearColors } from '@/constants/parknear-theme';
import { ROL_USUARIO_LABELS, ROLES_USUARIO } from '@/data/admin-usuarios';
import type { UserRole } from '@/data/mock-users';
import { useAdminUsuarios } from '@/contexts/admin-usuarios-context';
import { ESTADO_USUARIO_LABELS, nombreCompletoUsuario, type EstadoUsuario } from '@/models';

const statusStyle: Record<EstadoUsuario, string> = {
  activo: 'bg-emerald-500/20 text-emerald-900',
  no_verificado: 'bg-amber-500/20 text-amber-900',
  inactivo: 'bg-red-400/25 text-red-800',
  eliminado: 'bg-slate-500/25 text-slate-800',
};

const estadosAlta: EstadoUsuario[] = ['activo', 'no_verificado', 'inactivo'];

const emptyForm = {
  documento_identidad: '',
  nombres: '',
  apellidos: '',
  email: '',
  contrasena: '',
  celular: '',
  estado: 'inactivo' as EstadoUsuario,
  rol: 'conductor' as UserRole,
};

export default function AdminUsuariosScreen() {
  const { usuarios, addUsuario } = useAdminUsuarios();
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const activos = usuarios.filter((u) => u.estado === 'activo').length;
  const otros = usuarios.filter((u) => u.estado !== 'activo').length;

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setForm(emptyForm);
  }, []);

  const onGuardarUsuario = () => {
    const doc = form.documento_identidad.trim();
    const nombres = form.nombres.trim();
    const apellidos = form.apellidos.trim();
    const email = form.email.trim().toLowerCase();
    const contrasena = form.contrasena;
    const celular = form.celular.trim().replace(/\s/g, '');

    if (!doc || doc.length > 20) {
      Alert.alert('Documento', 'Ingresa un documento válido (máx. 20 caracteres).');
      return;
    }
    if (!nombres || !apellidos) {
      Alert.alert('Nombre', 'Completa nombres y apellidos.');
      return;
    }
    if (!email || !email.includes('@')) {
      Alert.alert('Correo', 'Ingresa un correo válido.');
      return;
    }
    if (usuarios.some((u) => u.email.toLowerCase() === email)) {
      Alert.alert('Correo', 'Ya existe un usuario con ese correo.');
      return;
    }
    if (!contrasena || contrasena.length < 4) {
      Alert.alert('Contraseña', 'La contraseña debe tener al menos 4 caracteres.');
      return;
    }
    const soloDigitos = celular.replace(/\D/g, '');
    if (soloDigitos.length < 10 || soloDigitos.length > 13) {
      Alert.alert('Celular', 'Ingresa un celular válido (10 a 13 dígitos).');
      return;
    }

    addUsuario({
      documento_identidad: doc,
      nombres,
      apellidos,
      email,
      contrasena,
      celular: soloDigitos,
      estado: form.estado,
      rol: form.rol,
    });
    closeModal();
  };

  const setEstadoForm = (estado: EstadoUsuario) => {
    setForm((f) => ({ ...f, estado }));
  };

  const setRolForm = (rol: UserRole) => {
    setForm((f) => ({ ...f, rol }));
  };

  return (
    <SafeAreaView className="flex-1 bg-pn-sky-fade" edges={['bottom']}>
      <ScrollView
        className="flex-1 px-5 pt-2"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}>
        <Text className="text-sm text-pn-navy/65">Gestión de usuarios registrados en ParkNear.</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Agregar usuario"
          onPress={() => setModalVisible(true)}
          className="mt-4 flex-row items-center justify-center gap-2 overflow-hidden rounded-2xl active:opacity-92 active:scale-[0.99]">
          <LinearGradient
            colors={[ParkNearColors.navy, '#2A4F72']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              paddingVertical: 14,
              paddingHorizontal: 20,
              borderRadius: 16,
              width: '100%',
            }}>
            <Ionicons name="person-add-outline" size={22} color="#fff" />
            <Text className="text-[16px] font-bold text-white">Agregar usuario</Text>
          </LinearGradient>
        </Pressable>

        <View className="mt-5 flex-row gap-3">
          <DashboardStat value={activos} label="Usuarios activos" accentClassName="text-emerald-800" />
          <DashboardStat
            value={otros}
            label="Otros estados"
            accentClassName="text-slate-700"
          />
        </View>

        <Text className="mb-1 mt-8 text-xs font-semibold uppercase tracking-wider text-pn-navy/50">
          Listado
        </Text>

        {usuarios.map((u) => (
          <Pressable
            key={u.id}
            accessibilityRole="button"
            onPress={() =>
              router.push({ pathname: '/admin/usuario/[id]', params: { id: u.id } })
            }
            className="mt-3 rounded-2xl border border-white/55 bg-white/95 p-4 shadow-sm shadow-pn-navy/8 active:opacity-90">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-2">
                <Text className="text-lg font-bold text-pn-navy">{nombreCompletoUsuario(u)}</Text>
                <Text className="mt-0.5 text-sm text-pn-navy/60">CC {u.documento_identidad}</Text>
                <Text className="mt-1 text-sm text-pn-navy/55">{u.email}</Text>
              </View>
              <View className="items-end gap-1">
                <View className={`rounded-full px-2.5 py-1 ${statusStyle[u.estado]}`}>
                  <Text className="text-xs font-semibold">{ESTADO_USUARIO_LABELS[u.estado]}</Text>
                </View>
                <View className="rounded-full bg-violet-500/20 px-2.5 py-1">
                  <Text className="text-[10px] font-bold uppercase tracking-wide text-violet-900">
                    {ROL_USUARIO_LABELS[u.rol]}
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}>
        <SafeAreaView className="flex-1 bg-pn-sky-fade" edges={['top', 'bottom']}>
          <View className="flex-row items-center justify-between border-b border-pn-navy/10 px-4 py-3">
            <Pressable onPress={closeModal} hitSlop={12} className="py-2 active:opacity-60">
              <Text className="text-base font-semibold text-pn-navy">Cancelar</Text>
            </Pressable>
            <Text className="text-base font-bold text-pn-navy">Nuevo usuario</Text>
            <View className="w-16" />
          </View>

          <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
            <ScrollView
              className="flex-1 px-5 pt-4"
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 32 }}
              showsVerticalScrollIndicator={false}>
              <LabeledField
                label="Documento de identidad"
                placeholder="Ej. 1234567890"
                value={form.documento_identidad}
                onChangeText={(t) => setForm((f) => ({ ...f, documento_identidad: t }))}
                maxLength={20}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <LabeledField
                label="Nombres"
                placeholder="Todos los nombres"
                value={form.nombres}
                onChangeText={(t) => setForm((f) => ({ ...f, nombres: t }))}
                autoCapitalize="words"
              />
              <LabeledField
                label="Apellidos"
                placeholder="Todos los apellidos"
                value={form.apellidos}
                onChangeText={(t) => setForm((f) => ({ ...f, apellidos: t }))}
                autoCapitalize="words"
              />
              <LabeledField
                label="Correo electrónico"
                placeholder="correo@ejemplo.com"
                value={form.email}
                onChangeText={(t) => setForm((f) => ({ ...f, email: t }))}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
              <LabeledField
                label="Contraseña"
                placeholder="Mínimo 4 caracteres"
                value={form.contrasena}
                onChangeText={(t) => setForm((f) => ({ ...f, contrasena: t }))}
                showPasswordToggle
              />
              <LabeledField
                label="Celular"
                placeholder="10 a 13 dígitos"
                value={form.celular}
                onChangeText={(t) => setForm((f) => ({ ...f, celular: t }))}
                keyboardType="phone-pad"
                maxLength={13}
              />

              <Text className="mb-2 ml-1 text-xs font-medium text-pn-navy/55">Rol en la app</Text>
              <View className="mb-5 flex-row flex-wrap gap-2">
                {ROLES_USUARIO.map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => setRolForm(r)}
                    className={`min-w-[30%] flex-1 rounded-2xl border py-3 ${
                      form.rol === r
                        ? 'border-violet-700 bg-violet-500/15'
                        : 'border-pn-border/60 bg-pn-white/95'
                    }`}>
                    <Text
                      className={`text-center text-sm font-semibold ${
                        form.rol === r ? 'text-violet-900' : 'text-pn-navy/60'
                      }`}>
                      {ROL_USUARIO_LABELS[r]}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text className="mb-2 ml-1 text-xs font-medium text-pn-navy/55">Estado inicial</Text>
              <View className="mb-5 flex-row flex-wrap gap-2">
                {estadosAlta.map((est) => (
                  <Pressable
                    key={est}
                    onPress={() => setEstadoForm(est)}
                    className={`min-w-[30%] flex-1 rounded-2xl border py-3 ${
                      form.estado === est
                        ? 'border-pn-navy bg-pn-navy/10'
                        : 'border-pn-border/60 bg-pn-white/95'
                    }`}>
                    <Text
                      className={`text-center text-sm font-semibold ${
                        form.estado === est ? 'text-pn-navy' : 'text-pn-navy/60'
                      }`}>
                      {ESTADO_USUARIO_LABELS[est]}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Pressable
                className="overflow-hidden rounded-2xl active:opacity-92 active:scale-[0.99]"
                onPress={onGuardarUsuario}>
                <LinearGradient
                  colors={[ParkNearColors.navy, '#2A4F72']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingVertical: 16,
                    alignItems: 'center',
                    borderRadius: 16,
                  }}>
                  <Text className="text-[17px] font-bold text-white">Guardar usuario</Text>
                </LinearGradient>
              </Pressable>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
