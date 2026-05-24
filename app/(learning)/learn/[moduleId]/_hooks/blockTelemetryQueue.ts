"use client";

type BlockTelemetryPayload = {
  lesson_id: string;
  block_id: string;
  progress_ratio: number;
  time_spent_seconds: number;
  interaction_type: "reading" | "video" | "quiz" | "text";
  score: number | null;
};

type QueueItem = {
  token: string;
  payload: BlockTelemetryPayload;
};

const BASE_LARAVEL_URL = "http://127.0.0.1:8000/api/telemetry/block-progress";
const FLUSH_DELAY_MS = 2500;
const PER_REQUEST_STAGGER_MS = 120;

const pendingTelemetry = new Map<string, QueueItem>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let isFlushing = false;

const buildKey = (payload: BlockTelemetryPayload) => {
  return `${payload.lesson_id}:${payload.block_id}:${payload.interaction_type}`;
};

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const postTelemetry = async (item: QueueItem) => {
  await fetch(BASE_LARAVEL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${item.token}`,
    },
    body: JSON.stringify(item.payload),
  });
};

const flushQueue = async () => {
  if (isFlushing || pendingTelemetry.size === 0) return;

  isFlushing = true;
  const batch = Array.from(pendingTelemetry.values());
  pendingTelemetry.clear();

  try {
    for (let i = 0; i < batch.length; i += 1) {
      try {
        await postTelemetry(batch[i]);
      } catch (error) {
        console.error("Telemetry flush failed:", error);
      }

      if (i < batch.length - 1) {
        await delay(PER_REQUEST_STAGGER_MS);
      }
    }
  } finally {
    isFlushing = false;

    if (pendingTelemetry.size > 0) {
      scheduleFlush();
    }
  }
};

const scheduleFlush = () => {
  if (flushTimer) return;

  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushQueue();
  }, FLUSH_DELAY_MS);
};

export const enqueueBlockTelemetry = (
  payload: BlockTelemetryPayload,
  token: string,
) => {
  const key = buildKey(payload);
  const existing = pendingTelemetry.get(key);

  if (existing) {
    pendingTelemetry.set(key, {
      token,
      payload: {
        ...payload,
        progress_ratio: Math.max(
          existing.payload.progress_ratio,
          payload.progress_ratio,
        ),
        time_spent_seconds:
          existing.payload.time_spent_seconds + payload.time_spent_seconds,
      },
    });
  } else {
    pendingTelemetry.set(key, { token, payload });
  }

  scheduleFlush();
};

if (typeof window !== "undefined") {
  const telemetryWindow = window as Window & {
    __blockTelemetryVisibilityBound?: boolean;
  };

  if (!telemetryWindow.__blockTelemetryVisibilityBound) {
    telemetryWindow.__blockTelemetryVisibilityBound = true;
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        void flushQueue();
      }
    });
  }
}
