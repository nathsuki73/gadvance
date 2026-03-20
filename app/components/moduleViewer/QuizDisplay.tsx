import React from "react";
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

const QuizDisplay = ({ question, options, explanation }: QuizDisplayProps) => {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 md:p-5">
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
    </article>
  );
};

export default QuizDisplay;
