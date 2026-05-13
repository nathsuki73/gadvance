// components/explore/module/ModuleContent.tsx

"use client";

import React from "react";

import {
  BlockRenderer,
} from "@/app/components/moduleViewer";

import type { ModuleArticle } from "./moduleUtils";

type ModuleContentProps = {
  articles: ModuleArticle[];
};

const ModuleContent = ({
  articles,
}: ModuleContentProps) => {
  return (
    <div className="space-y-5">
      {articles.map((article) => (
        <article
          key={article.id}
          id={article.id}
          className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 md:p-9"
        >
          <header className="mb-6 border-b border-zinc-100 pb-4">
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 md:text-[2.6rem]">
              {article.label}
            </h1>
          </header>

          <div className="space-y-5">
            {article.blocks.map(
              ({
                block,
                anchorId,
                key,
              }) => (
                <section
                  key={key}
                  id={anchorId}
                  className="scroll-mt-24"
                >
                  <BlockRenderer block={block} />
                </section>
              ),
            )}
          </div>
        </article>
      ))}
    </div>
  );
};

export default ModuleContent;