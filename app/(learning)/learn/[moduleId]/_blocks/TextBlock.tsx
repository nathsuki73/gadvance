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
  | EMPTY STATE
  |--------------------------------------------------------------------------
  */
  if (!content || content.trim() === "") {
    return (
      <div className="rounded-[32px] border border-dashed border-zinc-100 bg-white p-12 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-300">
          Empty Instructional Block
        </p>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | MINIMALIST EDITORIAL MARKDOWN CONFIGURATION
  |--------------------------------------------------------------------------
  */
  return (
    <div
      className="
        prose prose-zinc max-w-none overflow-x-auto bg-white
        
        
        py-12 px-4 sm:px-8 lg:px-20 xl:px-32 tracking-wide
        
        /* Font and color structure matching your brand setup */
        text-base text-zinc-900 font-light leading-relaxed
        
        /* Headings: Light and elegant (Casing preserved natively) */
        prose-headings:font-light 
        prose-headings:text-zinc-900 
        prose-headings:tracking-tight

        prose-h1:text-3xl prose-h1:sm:text-4xl prose-h1:font-normal
        prose-h2:text-2xl prose-h2:mt-16 prose-h2:pb-4 prose-h2:border-b prose-h2:border-zinc-50
        prose-h3:text-xl

        /* Inline Text Elements */
        prose-p:leading-8
        
        /* Highlighted Strong / Bold Text with specific capsule styling */
        prose-strong:font-semibold 
        prose-strong:text-zinc-900 
        prose-strong:bg-sky-50/50 
        prose-strong:px-1.5 
        prose-strong:py-0.5 
        prose-strong:rounded-md
        
        /* Beautiful Serif Italics using your signature brand blue */
        prose-em:font-serif 
        prose-em:italic 
        prose-em:text-[#00aeef]

        prose-li:text-zinc-500

        /* Brand Blue Actions & Hyperlinks */
        prose-a:text-[#00aeef] 
        prose-a:font-medium
        prose-a:no-underline 
        prose-a:transition-colors
        hover:prose-a:text-[#0096ce]

        /* Minimal Technical Code Styling */
        prose-code:text-[#00aeef] 
        prose-code:bg-sky-50/40 
        prose-code:px-2 
        prose-code:py-0.5 
        prose-code:rounded-md 
        prose-code:font-mono 
        prose-code:text-xs
        prose-code:before:content-none 
        prose-code:after:content-none

        /* Code Blocks */
        prose-pre:overflow-x-auto 
        prose-pre:rounded-[24px] 
        prose-pre:bg-zinc-50 
        prose-pre:border 
        prose-pre:border-zinc-100 
        prose-pre:p-6
        prose-pre:text-zinc-700

        /* Academic Blockquotes */
        prose-blockquote:border-l-2 
        prose-blockquote:border-[#00aeef] 
        prose-blockquote:pl-6 
        prose-blockquote:font-serif 
        prose-blockquote:italic 
        prose-blockquote:text-zinc-600 
        prose-blockquote:bg-zinc-50/30 
        prose-blockquote:py-2 
        prose-blockquote:pr-4 
        prose-blockquote:rounded-r-xl

        /* Images and Media Layouts */
        prose-img:w-full 
        prose-img:max-w-full 
        prose-img:rounded-[32px] 
        prose-img:border 
        prose-img:border-zinc-100
        prose-img:shadow-xl 
        prose-img:shadow-zinc-100/50

        /* Tables */
        prose-table:block 
        prose-table:overflow-x-auto
        prose-th:text-xs prose-th:font-bold prose-th:uppercase prose-th:tracking-wider prose-th:text-zinc-400
        prose-td:text-sm prose-td:text-zinc-500
      "
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
};

export default TextBlock;
