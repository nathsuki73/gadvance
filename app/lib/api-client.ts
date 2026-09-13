// app/lib/api-client.ts
import { getSession, signOut } from "next-auth/react";

let signOutInFlight = false;

export async function forceSignOut() {
  if (signOutInFlight) return;
  signOutInFlight = true;
  await signOut({ callbackUrl: "/auth/signin" });
}

// 🔑 Deduplication & short-lived cache for session fetches
let sessionPromise: ReturnType<typeof getSession> | null = null;
let sessionFetchedAt = 0;
const SESSION_CACHE_MS = 5000;

function getCachedSession() {
  const now = Date.now();
  if (!sessionPromise || now - sessionFetchedAt > SESSION_CACHE_MS) {
    sessionFetchedAt = now;
    sessionPromise = getSession().finally(() => {});
  }
  return sessionPromise;
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const session = await getCachedSession();
  const isFormData = options.body instanceof FormData;

  // 🔑 KEY CHANGE: Prepend "/api-backend" so Next.js proxies it to Laravel server-side
  // Example: path "/api/learning-progress/123" becomes fetch("/api-backend/api/learning-progress/123")
  const res = await fetch(`/api-backend${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
      Authorization: `Bearer ${session?.laravelJwt ?? ""}`,
    },
  });

  if (res.status === 401) {
    sessionPromise = null;
    await forceSignOut();
    return null;
  }

  return res;
}
