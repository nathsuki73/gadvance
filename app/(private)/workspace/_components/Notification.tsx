"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
};

type Props = {
  open: boolean;
  onCloseAction?: () => void;
};
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
const notificationsEndpoint = apiBaseUrl
  ? `${apiBaseUrl}/api/notifications`
  : null;

function normalizeNotifications(payload: unknown): NotificationItem[] {
  const source =
    Array.isArray(payload)
      ? payload
      : payload && typeof payload === "object" &&
          Array.isArray((payload as { data?: unknown }).data)
        ? (payload as { data: unknown[] }).data
        : payload && typeof payload === "object" &&
            Array.isArray((payload as { notifications?: unknown }).notifications)
          ? (payload as { notifications: unknown[] }).notifications
          : [];

  const items: NotificationItem[] = [];

  source.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      return;
    }

    const record = item as Record<string, unknown>;
    const title =
      typeof record.title === "string"
        ? record.title
        : typeof record.subject === "string"
          ? record.subject
          : typeof record.message === "string"
            ? record.message
            : `Notification ${index + 1}`;
    const body =
      typeof record.body === "string"
        ? record.body
        : typeof record.message === "string"
          ? record.message
          : typeof record.description === "string"
            ? record.description
            : "You have a new update.";
    const time =
      typeof record.time === "string"
        ? record.time
        : typeof record.created_at === "string"
          ? record.created_at
          : typeof record.createdAt === "string"
            ? record.createdAt
            : "Now";

    items.push({
      id:
        typeof record.id === "string" || typeof record.id === "number"
          ? String(record.id)
          : `${index}`,
      title,
      body,
      time,
    });
  });

  return items;
}

export default function Notification({ open, onCloseAction }: Props) {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onCloseAction?.();
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onCloseAction]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (status !== "authenticated") {
      setNotifications([]);
      setError("Sign in to view notifications.");
      return;
    }

    const laravelJwt = session?.laravelJwt;
    if (!laravelJwt) {
      setNotifications([]);
      setError("Your backend token is missing. Please sign in again.");
      return;
    }

    if (!notificationsEndpoint) {
      setNotifications([]);
      setError("Missing API URL. Set NEXT_PUBLIC_API_URL.");
      return;
    }

    const controller = new AbortController();

    const loadNotifications = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(notificationsEndpoint, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${laravelJwt}`,
          },
          signal: controller.signal,
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          const message =
            payload && typeof payload === "object"
              ? ((payload as Record<string, unknown>).message ||
                  (payload as Record<string, unknown>).error)
              : undefined;

          setNotifications([]);
          setError(
            typeof message === "string"
              ? message
              : "Unable to load notifications.",
          );
          return;
        }

        setNotifications(normalizeNotifications(payload));
      } catch (loadError) {
        if (!controller.signal.aborted) {
          console.error("Failed to load notifications:", loadError);
          setNotifications([]);
          setError("Unable to load notifications.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadNotifications();

    return () => controller.abort();
  }, [open, session?.laravelJwt, status]);

  return (
    <div
      aria-hidden={!open}
      className={`absolute right-0 mt-3 w-80 max-w-[calc(100vw-2rem)] origin-top-right rounded-2xl border border-zinc-100 bg-white p-2 shadow-xl transition-all duration-200 ease-in-out transform ${
        open
          ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
          : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
      }`}
      role="dialog"
    >
      <div className="flex items-center justify-between px-3 py-2">
        <h4 className="text-sm font-semibold text-zinc-900">Notifications</h4>
        <button
          onClick={() => onCloseAction?.()}
          className="text-xs text-zinc-500 hover:text-zinc-700"
        >
          Close
        </button>
      </div>

      <div className="max-h-64 overflow-y-auto px-1 py-1">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-xl bg-zinc-100"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl bg-zinc-50 px-4 py-5 text-center text-sm text-zinc-500">
            {error}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-zinc-500">
            No notifications yet.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className="group flex items-start gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-zinc-50"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-xs text-zinc-700">
                🔔
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-zinc-900">
                    {n.title}
                  </p>
                  <span className="text-xs text-zinc-400">{n.time}</span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">{n.body}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-2 border-t border-zinc-50 px-3 py-2">
        <button className="w-full rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100">
          View all notifications
        </button>
      </div>
    </div>
  );
}
