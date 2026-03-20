import React from "react";

type ParagraphDisplayProps = {
  text: string;
};

const ParagraphDisplay = ({ text }: ParagraphDisplayProps) => {
  return <p className="leading-relaxed text-zinc-700">{text}</p>;
};

export default ParagraphDisplay;
