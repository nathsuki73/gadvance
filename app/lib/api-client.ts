// app/lib/api-client.ts
import { getSession, signOut } from "next-auth/react";

let signOutInFlight = false;

export async function forceSignOut() {
  if (signOutInFlight) {
    return;
  }
  signOutInFlight = true;
  await signOut({ callbackUrl: "/auth/signin" });
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const session = await getSession();

  // 🚀 THE FIX: Use relative path "/api-proxy" for browser requests.
  // This tricks the browser into thinking it's same-origin, eliminating ALL preflights.
  // If running on the server (SSR), fallback to the actual backend URL.
  const isServer = typeof window === "undefined";
  const apiBaseUrl = isServer
    ? (process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "")
    : "/api-proxy";

  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
      Authorization: `Bearer ${session?.laravelJwt ?? ""}`,
    },
  });

  if (res.status === 401) {
    await forceSignOut();
    return null;
  }

  return res;
}
