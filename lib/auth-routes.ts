import type { Href } from 'expo-router';

import type { UserRole } from '@/data/mock-users';

/** Ruta inicial según rol */
export function routeForRole(role: UserRole): Href {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'encargado':
      return '/encargado';
    case 'conductor':
      return '/(tabs)';
  }
}
