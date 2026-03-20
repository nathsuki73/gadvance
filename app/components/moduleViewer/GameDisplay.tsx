import React from "react";

type GameDisplayProps = {
  title: string;
  description?: string;
  href?: string;
  ctaLabel?: string;
};

const GameDisplay = ({
  title,
  description,
  href,
  ctaLabel = "Start game",
}: GameDisplayProps) => {
  return (
    <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 md:p-5">
      <h3 className="text-lg font-semibold text-emerald-900">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm text-emerald-800">{description}</p>
      ) : null}
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
        >
          {ctaLabel}
        </a>
      ) : null}
    </article>
  );
};

export default GameDisplay;
