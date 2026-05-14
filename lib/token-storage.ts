import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'parknear_jwt';

export const tokenStorage = {
  get: (): Promise<string | null> => SecureStore.getItemAsync(TOKEN_KEY),
  set: (token: string): Promise<void> => SecureStore.setItemAsync(TOKEN_KEY, token),
  delete: (): Promise<void> => SecureStore.deleteItemAsync(TOKEN_KEY),
};
