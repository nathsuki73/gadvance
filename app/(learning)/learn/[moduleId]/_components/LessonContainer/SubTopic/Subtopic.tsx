import Image from "next/image";
import ReactMarkdown from "react-markdown";
import SubtopicSkeleton from "./SubtopicSkeleton";

export type SubtopicItem = {
  id: string;
  lesson_block_id: string;
  content_order: number;
  body_text: string;
  media_type: "text" | "image" | "video" | string;
  media_url: string | null;
  created_at: string;
  updated_at: string;
};

interface SubtopicProps {
  subtopics?: SubtopicItem[] | Record<string, SubtopicItem[]>;
}

export default function Subtopic({ subtopics }: SubtopicProps) {
  const subtopicsArray = (() => {
    if (!subtopics) return [];
    if (Array.isArray(subtopics)) return subtopics;
    return Object.values(subtopics).flat();
  })();

  if (subtopicsArray.length === 0) {
    return <SubtopicSkeleton />;
  }

  const sortedSubtopics = [...subtopicsArray].sort(
    (a, b) => a.content_order - b.content_order,
  );

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-10">
      {sortedSubtopics.map((item) => {
        const text = item.body_text?.trim() || "";
        const isQuote = text.startsWith("“") || text.startsWith('"');

        return (
          <article
            key={item.id}
            className="w-full space-y-6 pb-8 border-b border-zinc-100/60 last:border-none last:pb-0"
          >
            {/* Media Container */}
            {item.media_url && item.media_type === "image" && (
              <figure className="my-4 rounded-2xl overflow-hidden border border-zinc-100 shadow-xs relative aspect-video w-full bg-zinc-50 group">
                <Image
                  src={item.media_url}
                  alt="Lesson visual aid"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </figure>
            )}

            {/* Text / Markdown Content */}
            {text && (
              <div className="w-full">
                {isQuote ? (
                  <blockquote className="border-l-2 border-indigo-200 bg-indigo-50/20 p-5 rounded-r-xl my-4">
                    <p className="text-zinc-800 font-medium italic text-lg leading-relaxed m-0">
                      {text}
                    </p>
                  </blockquote>
                ) : (
                  <ReactMarkdown
                    components={{
                      /* Custom Vague Horizontal Rules (---) */
                      hr: () => (
                        <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-zinc-200/50 to-transparent" />
                      ),
                      /* Header Level 1 (#) */
                      h1: ({ node, ...props }) => (
                        <h1
                          className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight mt-6 mb-4 pb-2 border-b border-zinc-100/80"
                          {...props}
                        />
                      ),
                      /* Header Level 2 (##) */
                      h2: ({ node, ...props }) => (
                        <h2
                          className="text-xl sm:text-2xl font-bold text-zinc-800 tracking-tight mt-6 mb-3 pl-3 border-l-2 border-indigo-200"
                          {...props}
                        />
                      ),
                      /* Header Level 3 (###) */
                      h3: ({ node, ...props }) => (
                        <h3
                          className="text-lg sm:text-xl font-semibold text-zinc-800 tracking-tight mt-5 mb-2"
                          {...props}
                        />
                      ),
                      /* Paragraphs */
                      p: ({ node, ...props }) => (
                        <p
                          className="text-zinc-600 text-base sm:text-lg leading-relaxed mb-4"
                          {...props}
                        />
                      ),
                      /* Unordered Lists */
                      ul: ({ node, ...props }) => (
                        <ul
                          className="space-y-2.5 my-4 pl-1 list-none"
                          {...props}
                        />
                      ),
                      /* List Items */
                      li: ({ node, children, ...props }) => (
                        <li
                          className="flex items-start gap-3 text-zinc-700 text-base leading-relaxed bg-zinc-50/40 p-3 rounded-lg border border-zinc-100/60 transition-colors hover:bg-indigo-50/20"
                          {...props}
                        >
                          <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-300 mt-2.5" />
                          <span className="flex-1">{children}</span>
                        </li>
                      ),
                      /* Inline Code Blocks */
                      code: ({
                        node,
                        inline,
                        className,
                        children,
                        ...props
                      }: any) => (
                        <code
                          className="bg-zinc-50 text-indigo-600 font-mono text-sm px-1.5 py-0.5 rounded border border-zinc-200/50"
                          {...props}
                        >
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {text}
                  </ReactMarkdown>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
