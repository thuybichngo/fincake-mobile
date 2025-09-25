// Centralized environment constants for the mobile app
import Constants from 'expo-constants';

// Backend base URL for FinCake BE (FastAPI). Must include protocol.
// Priority: EXPO_PUBLIC_FINCAKE_BE_URL env > expo extra.FINCAKE_BE_URL > ""
const fromEnv = process.env.EXPO_PUBLIC_FINCAKE_BE_URL?.trim();
const fromExtra = (Constants?.expoConfig as any)?.extra?.FINCAKE_BE_URL?.trim?.();
export const FINCAKE_BE_URL: string = fromEnv || fromExtra || "";

// Helper to build endpoint URLs safely
export function buildBeUrl(path: string): string {
  const base = FINCAKE_BE_URL.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}


