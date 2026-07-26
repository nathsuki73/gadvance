"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

function decodeJwt(token: string) {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(normalized));
  } catch {
    return null;
  }
}

export default function DebugAuthPage() {
  const { data: session, status } = useSession();
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(
      () => setNow(Math.floor(Date.now() / 1000)),
      1000,
    );
    return () => clearInterval(interval);
  }, []);

  if (status === "loading") return <p style={{ padding: 24 }}>Loading...</p>;
  if (!session) return <p style={{ padding: 24 }}>Not signed in.</p>;

  // session.expires is an ISO string NextAuth already provides — no extra fetch needed
  const nextAuthExp = session.expires
    ? Math.floor(new Date(session.expires).getTime() / 1000)
    : null;

  const laravelDecoded = session.laravelJwt
    ? decodeJwt(session.laravelJwt)
    : null;
  const laravelExp = laravelDecoded?.exp ?? null;

  const nextAuthSecondsLeft = nextAuthExp ? nextAuthExp - now : null;
  const laravelSecondsLeft = laravelExp ? laravelExp - now : null;

  const laravelOutlivesNextAuth =
    laravelSecondsLeft !== null &&
    nextAuthSecondsLeft !== null &&
    laravelSecondsLeft > nextAuthSecondsLeft;

  return (
    <div style={{ padding: 24, fontFamily: "monospace" }}>
      <h1>Session Comparison</h1>

      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
              System
            </th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
              Expires in
            </th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
              Expires at
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>NextAuth session</td>
            <td>
              {nextAuthSecondsLeft !== null ? `${nextAuthSecondsLeft}s` : "?"}
            </td>
            <td>
              {nextAuthExp
                ? new Date(nextAuthExp * 1000).toLocaleString()
                : "?"}
            </td>
          </tr>
          <tr>
            <td>Laravel JWT</td>
            <td>
              {laravelSecondsLeft !== null ? `${laravelSecondsLeft}s` : "?"}
            </td>
            <td>
              {laravelExp ? new Date(laravelExp * 1000).toLocaleString() : "?"}
            </td>
          </tr>
        </tbody>
      </table>

      <div
        style={{
          marginTop: 24,
          padding: 16,
          border: "1px solid",
          borderColor: laravelOutlivesNextAuth ? "red" : "green",
        }}
      >
        {laravelOutlivesNextAuth ? (
          <strong style={{ color: "red" }}>
            ⚠️ Laravel token outlives NextAuth session by{" "}
            {laravelSecondsLeft! - nextAuthSecondsLeft!}s.
          </strong>
        ) : (
          <strong style={{ color: "green" }}>
            ✅ Laravel token expires at or before NextAuth session.
          </strong>
        )}
      </div>

      <p style={{ marginTop: 16, color: "#666" }}>
        Session error: <code>{session.error || "none"}</code>
      </p>
    </div>
  );
}
