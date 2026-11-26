import AsyncStorage from "@react-native-async-storage/async-storage";
import { decrypt, encrypt, getKey } from "./crypto";

const KEY_NAME = "tth_session_key_v1";
const PREFIX = "tth.enc.";

/**
 * Supabase auth storage. SecureStore caps values at ~2KB, so the session is stored
 * AES-GCM encrypted in AsyncStorage and only the key lives in SecureStore (Android Keystore).
 */
export const secureSessionStorage = {
  async getItem(k: string): Promise<string | null> {
    const raw = await AsyncStorage.getItem(PREFIX + k);
    if (!raw) return null;
    try {
      return decrypt(await getKey(KEY_NAME), raw);
    } catch {
      await AsyncStorage.removeItem(PREFIX + k);
      return null;
    }
  },
  async setItem(k: string, v: string): Promise<void> {
    await AsyncStorage.setItem(PREFIX + k, encrypt(await getKey(KEY_NAME), v));
  },
  async removeItem(k: string): Promise<void> {
    await AsyncStorage.removeItem(PREFIX + k);
  },
};
