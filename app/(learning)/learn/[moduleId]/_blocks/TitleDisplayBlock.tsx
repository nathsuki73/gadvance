"use client";

import React from "react";

type TitleMetadata = {
  level?: 1 | 2 | 3 | 4 | 5 | 6;

  align?: "left" | "center" | "right";
};

type TitleDisplayProps = {
  content?: string | null;

  metadata?: TitleMetadata;
};

const headingClasses: Record<NonNullable<TitleMetadata["level"]>, string> = {
  1: "text-4xl md:text-5xl",
  2: "text-3xl md:text-4xl",
  3: "text-2xl md:text-3xl",
  4: "text-xl md:text-2xl",
  5: "text-lg md:text-xl",
  6: "text-base md:text-lg",
};

const alignmentClasses = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const TitleDisplay = ({ content, metadata }: TitleDisplayProps) => {
  /*
  |--------------------------------------------------------------------------
  | EMPTY
  |--------------------------------------------------------------------------
  */

  if (!content || content.trim() === "") {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | CONFIG
  |--------------------------------------------------------------------------
  */

  const level = metadata?.level ?? 2;

  const align = metadata?.align ?? "left";

  const className = `
    ${headingClasses[level]}
    ${alignmentClasses[align]}

    font-bold
    tracking-tight

    text-zinc-800

    leading-tight

    px-5 py-6
        sm:px-6 sm:py-7
        lg:px-76 lg:py-8
  `;

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  switch (level) {
    case 1:
      return <h1 className={className}>{content}</h1>;

    case 2:
      return <h2 className={className}>{content}</h2>;

    case 3:
      return <h3 className={className}>{content}</h3>;

    case 4:
      return <h4 className={className}>{content}</h4>;

    case 5:
      return <h5 className={className}>{content}</h5>;

    case 6:
      return <h6 className={className}>{content}</h6>;

    default:
      return <h2 className={className}>{content}</h2>;
  }
};

export default TitleDisplay;
