"use client";

import React, { useEffect } from "react";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
};

type Props = {
  open: boolean;
  onClose?: () => void;
};

const mockNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "New module available",
    body: "A new module on TypeScript was added to the curriculum.",
    time: "2h",
  },
  {
    id: "2",
    title: "Assignment graded",
    body: "Your pretest has been graded. Check your dashboard.",
    time: "1d",
  },
  {
    id: "3",
    title: "Course suggestion",
    body: "We think you'll like 'Advanced React Patterns'.",
    time: "3d",
  },
];

export default function Notification({ open, onClose }: Props) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose?.();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

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
      </div>

      <div className="max-h-64 overflow-y-auto px-1 py-1">
        {mockNotifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-zinc-500">No notifications</div>
        ) : (
          mockNotifications.map((n) => (
            <div
              key={n.id}
              className="group flex items-start gap-3 rounded-xl px-3 py-2 hover:bg-zinc-50"
            >
              <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs text-zinc-700">
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

      <div className="mt-2 border-t border-zinc-50 px-3 py-2">
        <button className="w-full rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100">
          View all notifications
        </button>
      </div>
    </div>
  );
}
