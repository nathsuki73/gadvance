import React from "react";

type TitleDisplayProps = {
  text: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
};

const headingClasses: Record<
  NonNullable<TitleDisplayProps["level"]>,
  string
> = {
  1: "text-3xl md:text-4xl",
  2: "text-2xl md:text-3xl",
  3: "text-xl md:text-2xl",
  4: "text-lg md:text-xl",
  5: "text-base md:text-lg",
  6: "text-sm md:text-base",
};

const TitleDisplay = ({ text, level = 2 }: TitleDisplayProps) => {
  const className = `${headingClasses[level]} font-bold tracking-tight text-zinc-900`;

  switch (level) {
    case 1:
      return <h1 className={className}>{text}</h1>;
    case 2:
      return <h2 className={className}>{text}</h2>;
    case 3:
      return <h3 className={className}>{text}</h3>;
    case 4:
      return <h4 className={className}>{text}</h4>;
    case 5:
      return <h5 className={className}>{text}</h5>;
    case 6:
      return <h6 className={className}>{text}</h6>;
    default:
      return <h2 className={className}>{text}</h2>;
  }
};

export default TitleDisplay;
