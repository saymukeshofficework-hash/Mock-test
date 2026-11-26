import { gcm } from "@noble/ciphers/aes";
import { bytesToHex, hexToBytes, utf8ToBytes, bytesToUtf8 } from "@noble/ciphers/utils";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

/** Returns a 32-byte AES key stored in the Android Keystore-backed SecureStore, creating it once. */
export async function getKey(name: string): Promise<Uint8Array> {
  const existing = await SecureStore.getItemAsync(name);
  if (existing && existing.length === 64) return hexToBytes(existing);
  const key = Crypto.getRandomBytes(32);
  await SecureStore.setItemAsync(name, bytesToHex(key));
  return key;
}

export async function deleteKey(name: string): Promise<void> {
  await SecureStore.deleteItemAsync(name);
}

/** AES-256-GCM; output is hex(nonce || ciphertext+tag). */
export function encrypt(key: Uint8Array, plain: string): string {
  const nonce = Crypto.getRandomBytes(12);
  const ct = gcm(key, nonce).encrypt(utf8ToBytes(plain));
  const out = new Uint8Array(nonce.length + ct.length);
  out.set(nonce, 0);
  out.set(ct, nonce.length);
  return bytesToHex(out);
}

export function decrypt(key: Uint8Array, hex: string): string {
  const all = hexToBytes(hex);
  const nonce = all.subarray(0, 12);
  return bytesToUtf8(gcm(key, nonce).decrypt(all.subarray(12)));
}
