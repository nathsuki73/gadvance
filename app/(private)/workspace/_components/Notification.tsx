"use client";

import React, { useEffect, useState } from "react";
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

export default function Notification({ open, onCloseAction }: Props) {
  const { data: session, status } = useSession();

  // Empty state by default, ready for when fetching is re-enabled
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle ESC key to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onCloseAction?.();
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onCloseAction]);

  /*
   * Fetching logic is temporarily disabled.
   */

  return (
    <div
      aria-hidden={!open}
      className={`absolute -right-10 mt-3 w-80 max-w-[calc(100vw-2rem)] origin-top-right rounded-2xl border border-zinc-100 bg-white p-2 shadow-xl transition-all duration-200 ease-in-out transform ${
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
        ) : notifications.length === 0 ? (
          <div className="rounded-xl bg-zinc-50 px-4 py-5 text-center text-sm text-zinc-500">
            No new notifications
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
                  <p className="text-sm font-medium text-zinc-900">{n.title}</p>
                  <span className="text-xs text-zinc-400">{n.time}</span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">{n.body}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* <div className="mt-2 border-t border-zinc-50 px-3 py-2">
        <button className="w-full rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100">
          View all notifications
        </button>
      </div> */}
    </div>
  );
}
