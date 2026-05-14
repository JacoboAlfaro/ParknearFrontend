import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'parknear_jwt';
const USER_KEY = 'parknear_user';

export const tokenStorage = {
  get: (): Promise<string | null> => SecureStore.getItemAsync(TOKEN_KEY),
  set: (token: string): Promise<void> => SecureStore.setItemAsync(TOKEN_KEY, token),
  delete: (): Promise<void> => SecureStore.deleteItemAsync(TOKEN_KEY),

  getUser: async <T>(): Promise<T | null> => {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  },
  setUser: (user: object): Promise<void> =>
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
  deleteUser: (): Promise<void> => SecureStore.deleteItemAsync(USER_KEY),
};
