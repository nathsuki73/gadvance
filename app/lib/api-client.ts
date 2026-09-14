// app/lib/api-client.ts
import { getSession, signOut } from "next-auth/react";

let signOutInFlight = false;

export async function forceSignOut() {
  if (signOutInFlight) return;
  signOutInFlight = true;
  await signOut({ callbackUrl: "/auth/signin" });
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const session = await getSession();

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
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
