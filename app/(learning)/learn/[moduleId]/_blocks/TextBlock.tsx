"use client";

import React from "react";

import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";

type TextBlockProps = {
  content?: string | null;
};

const TextBlock = ({ content }: TextBlockProps) => {
  /*
  |--------------------------------------------------------------------------
  | EMPTY
  |--------------------------------------------------------------------------
  */

  if (!content || content.trim() === "") {
    return (
      <div
        className="
          border border-dashed border-zinc-300
          bg-white

          px-5 py-6
          sm:px-6
          lg:px-10
        "
      >
        <span className="text-sm text-zinc-400">Empty text block</span>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | MARKDOWN CONTENT
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className="
        prose prose-zinc
        max-w-none

        overflow-x-auto

        bg-white

        px-5 py-6
        sm:px-6 sm:py-7
        lg:px-40 lg:py-8

        text-[15px]
        leading-7

        prose-headings:font-semibold
        prose-headings:text-zinc-800

        prose-h1:text-3xl
        prose-h2:text-2xl
        prose-h3:text-xl

        prose-p:text-zinc-700
        prose-p:leading-8

        prose-strong:text-zinc-800

        prose-li:text-zinc-700

        prose-a:text-sky-600
        prose-a:no-underline
        hover:prose-a:underline

        prose-code:text-sky-700
        prose-code:before:content-none
        prose-code:after:content-none

        prose-pre:overflow-x-auto
        prose-pre:rounded-xl
        prose-pre:bg-zinc-900
        prose-pre:p-4

        prose-blockquote:border-sky-500
        prose-blockquote:text-zinc-600

        prose-img:w-full
        prose-img:max-w-full
        prose-img:rounded-xl

        prose-table:block
        prose-table:overflow-x-auto
      "
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
};

export default TextBlock;
