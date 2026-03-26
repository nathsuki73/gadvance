"use client";

import React, { useEffect, useRef, useState } from "react";
import type { QuizOption } from "./types";

type QuizDisplayProps = {
  question: string;
  options: Array<string | QuizOption>;
  explanation?: string;
};

const VIOLATION_LOCK_MS = 15000;

const getOptionText = (option: string | QuizOption): string => {
  if (typeof option === "string") {
    return option;
  }
  return option.text;
};

const preventClipboardAction = (event: React.SyntheticEvent) => {
  event.preventDefault();
};

const preventClipboardShortcut = (event: React.KeyboardEvent<HTMLElement>) => {
  const key = event.key.toLowerCase();
  const isClipboardShortcut =
    (event.ctrlKey || event.metaKey) && ["c", "v", "x"].includes(key);

  if (isClipboardShortcut) {
    event.preventDefault();
  }
};

const getShortcutType = (
  event: Pick<KeyboardEvent, "key" | "altKey" | "metaKey" | "shiftKey">,
): "screenshot" | "altTab" | "windowsTab" | null => {
  const key = event.key.toLowerCase();
  const isScreenshotShortcut =
    key === "printscreen" || (event.metaKey && event.shiftKey && key === "s");

  if (isScreenshotShortcut) {
    return "screenshot";
  }

  if (event.altKey && key === "tab") {
    return "altTab";
  }

  if (event.metaKey && key === "tab") {
    return "windowsTab";
  }

  return null;
};

const QuizDisplay = ({ question, options, explanation }: QuizDisplayProps) => {
  const [isOutOfFocus, setIsOutOfFocus] = useState(false);
  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [violationCount, setViolationCount] = useState(0);
  const outOfFocusRef = useRef(false);
  const lastShortcutAtRef = useRef<number | null>(null);

  useEffect(() => {
    const incrementViolation = () => {
      setViolationCount((current) => current + 1);
      setLockUntil(Date.now() + VIOLATION_LOCK_MS);
    };

    const incrementFromBestSignal = () => {
      const lastShortcutAt = lastShortcutAtRef.current;
      const nowAt = Date.now();

      if (lastShortcutAt && nowAt - lastShortcutAt <= 1500) {
        incrementViolation();
        lastShortcutAtRef.current = null;
        return;
      }

      // Fallback: if browser does not expose OS shortcut keys, still count focus-loss attempts.
      incrementViolation();
    };

    const setFocusState = (nextOutOfFocus: boolean) => {
      if (outOfFocusRef.current === nextOutOfFocus) {
        return;
      }

      outOfFocusRef.current = nextOutOfFocus;
      setIsOutOfFocus(nextOutOfFocus);

      if (nextOutOfFocus) {
        incrementFromBestSignal();
      }
    };

    const handleVisibilityChange = () => {
      setFocusState(document.hidden);
    };

    const handleWindowBlur = () => {
      setFocusState(true);
    };

    const handleWindowFocus = () => {
      setFocusState(document.hidden);
    };

    const handleWindowKeyDown = (event: KeyboardEvent) => {
      const violationType = getShortcutType(event);

      if (!violationType) {
        return;
      }

      lastShortcutAtRef.current = Date.now();

      // Screenshot keys may not always trigger focus loss, so count them immediately.
      if (violationType === "screenshot") {
        incrementViolation();
      }
    };

    handleVisibilityChange();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("keydown", handleWindowKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("keydown", handleWindowKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!lockUntil) {
      return;
    }

    const interval = window.setInterval(() => {
      const nextNow = Date.now();
      setNow(nextNow);

      if (nextNow >= lockUntil) {
        window.clearInterval(interval);
      }
    }, 200);

    return () => {
      window.clearInterval(interval);
    };
  }, [lockUntil]);

  const remainingLockSeconds = lockUntil
    ? Math.max(0, Math.ceil((lockUntil - now) / 1000))
    : 0;
  const isTemporarilyLocked = Boolean(lockUntil && remainingLockSeconds > 0);
  const isContentHidden = isOutOfFocus || isTemporarilyLocked;

  return (
    <article
      className="relative rounded-2xl border border-zinc-200 bg-zinc-50 p-4 md:p-5"
      onCopy={preventClipboardAction}
      onCut={preventClipboardAction}
      onPaste={preventClipboardAction}
      onContextMenu={preventClipboardAction}
      onKeyDown={preventClipboardShortcut}
    >
      <div className="mb-3 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-700">
        <p className="mb-1 font-semibold text-zinc-900">
          Security counter (temporary student view)
        </p>
        <p>Total violations: {violationCount}</p>
        <p>Includes screenshot, Alt+Tab, and Win+Tab violations.</p>
        <p className="text-zinc-500">Final product: visible to admins only.</p>
        {violationCount > 0 ? (
          <p className="mt-1 font-medium text-amber-700">
            Warning: suspicious activity detected.
          </p>
        ) : null}
      </div>

      <div
        className={
          isContentHidden ? "pointer-events-none select-none blur-sm" : ""
        }
        aria-hidden={isContentHidden}
      >
        <h3 className="text-base font-semibold text-zinc-900 md:text-lg">
          {question}
        </h3>
        <ul className="mt-4 space-y-2">
          {options.map((option, index) => {
            const text = getOptionText(option);
            const optionKey =
              typeof option === "string"
                ? `${text}-${index}`
                : (option.id ?? `${text}-${index}`);

            return (
              <li
                key={optionKey}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700"
              >
                {text}
              </li>
            );
          })}
        </ul>
        {explanation ? (
          <p className="mt-3 text-sm text-zinc-600">{explanation}</p>
        ) : null}
      </div>

      {isContentHidden ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-zinc-900/70 p-4 text-center text-sm font-medium text-white backdrop-blur-sm">
          {isOutOfFocus
            ? "Quiz content is hidden while this tab is out of focus."
            : `Quiz content is temporarily hidden for ${remainingLockSeconds}s after suspicious shortcut use.`}
        </div>
      ) : null}
    </article>
  );
};

export default QuizDisplay;
