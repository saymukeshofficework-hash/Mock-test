import * as SecureStore from "expo-secure-store";
import { EXAMHELP_URL, HUB_FUNCTIONS_URL } from "@/lib/config";

/** exam-hub Edge Function notes-checkout. Only read actions are used by the app (no checkout). */
export async function hubCall<T>(body: Record<string, unknown>): Promise<{ ok: boolean; status: number; data: T | null }> {
  const r = await fetch(`${HUB_FUNCTIONS_URL}/notes-checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let data: T | null = null;
  try {
    data = (await r.json()) as T;
  } catch {
    data = null;
  }
  return { ok: r.ok, status: r.status, data };
}

const tokenKey = (userId: string, product: string) => `hubtok_${userId.replace(/[^a-zA-Z0-9]/g, "")}_${product.replace(/[^a-zA-Z0-9]/g, "_")}`;

/**
 * Access token for a paid series bought on the website by this account
 * (notes-checkout "claim"). Cached per account in SecureStore.
 */
export async function getSeriesToken(userId: string, accessToken: string, product: string, refresh = false): Promise<string | null> {
  const k = tokenKey(userId, product);
  if (!refresh) {
    const cached = await SecureStore.getItemAsync(k);
    if (cached) return cached;
  }
  const res = await hubCall<{ token?: string }>({ action: "claim", product, access_token: accessToken });
  if (res.ok && res.data?.token) {
    await SecureStore.setItemAsync(k, res.data.token);
    return res.data.token;
  }
  if (res.status === 404) await SecureStore.deleteItemAsync(k);
  return null;
}

export async function clearSeriesTokens(userId: string, products: string[]) {
  await Promise.all(products.map((p) => SecureStore.deleteItemAsync(tokenKey(userId, p))));
}

export const publicHubTestUrl = (folder: string, n: number) => `${EXAMHELP_URL}/mock-tests/${folder}/tests/${String(n).padStart(2, "0")}.json`;
