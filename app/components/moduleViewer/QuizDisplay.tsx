"use client";

import React, { useEffect, useRef, useState } from "react";
import type { QuizOption } from "./types";

type QuizDisplayProps = {
  question: string;
  options: Array<string | QuizOption>;
  explanation?: string;
};

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

const QuizDisplay = ({ question, options, explanation }: QuizDisplayProps) => {
  const [isOutOfFocus, setIsOutOfFocus] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const outOfFocusRef = useRef(false);

  useEffect(() => {
    const setFocusState = (nextOutOfFocus: boolean) => {
      if (outOfFocusRef.current === nextOutOfFocus) {
        return;
      }

      outOfFocusRef.current = nextOutOfFocus;
      setIsOutOfFocus(nextOutOfFocus);

      if (nextOutOfFocus) {
        setViolationCount((current) => current + 1);
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

    handleVisibilityChange();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  return (
    <article
      className="relative rounded-2xl border border-zinc-200 bg-zinc-50 p-4 md:p-5"
      onCopy={preventClipboardAction}
      onCut={preventClipboardAction}
      onPaste={preventClipboardAction}
      onContextMenu={preventClipboardAction}
      onKeyDown={preventClipboardShortcut}
    >
      {violationCount > 0 ? (
        <p className="mb-3 rounded-lg border border-amber-300 bg-amber-100 px-3 py-2 text-xs font-medium text-amber-900">
          Warning: quiz lost focus {violationCount}{" "}
          {violationCount === 1 ? "time" : "times"}.
        </p>
      ) : null}

      <div
        className={
          isOutOfFocus ? "pointer-events-none select-none blur-sm" : ""
        }
        aria-hidden={isOutOfFocus}
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

      {isOutOfFocus ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-zinc-900/70 p-4 text-center text-sm font-medium text-white backdrop-blur-sm">
          Quiz content is hidden while this tab is out of focus.
        </div>
      ) : null}
    </article>
  );
};

export default QuizDisplay;
