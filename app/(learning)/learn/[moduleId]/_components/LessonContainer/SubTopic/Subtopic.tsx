import Image from "next/image";
import ReactMarkdown from "react-markdown";

export type SubtopicItem = {
  id: string;
  lesson_block_id: string;
  content_order: number;
  section_title: string | null;
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
  // 1. Normalize subtopics into a reliable flat array
  console.log("Subtopics prop received:", subtopics);

  const subtopicsArray: SubtopicItem[] = (() => {
    if (!subtopics) return [];
    if (Array.isArray(subtopics)) return subtopics;
    // If it's a Record/Object, flatten all nested arrays into a single array
    return Object.values(subtopics).flat();
  })();

  // 2. Fallback UI if there are no subtopics loaded
  if (subtopicsArray.length === 0) {
    return (
      <div className="p-8 text-zinc-500 text-center">
        No subtopics available.
      </div>
    );
  }

  // 3. Sort subtopics safely using the normalized array
  const sortedSubtopics = [...subtopicsArray].sort(
    (a, b) => a.content_order - b.content_order,
  );

  return (
    <div className="size-full overflow-hidden transition-all duration-300 space-y-6">
      {sortedSubtopics.map((item) => {
        const text = item.body_text?.trim() || "";

        // Check if the current block text is purely a standalone list quote block item
        const isQuote = text.startsWith("“") || text.startsWith('"');

        return (
          <div key={item.id} className="w-full flex flex-col">
            {/* Header section */}
            {item.section_title && (
              <div className="bg-indigo-50/70 px-6 sm:px-12 py-4 border-b border-zinc-100 flex items-center justify-start text-left mb-4">
                <h3 className="font-semibold text-zinc-800 text-2xl tracking-tight">
                  {item.section_title}
                </h3>
              </div>
            )}

            {/* Content Body Layout container */}
            <div className="px-6 sm:px-12 max-w-3xl mx-auto w-full space-y-3">
              {/* Media Block */}
              {item.media_url && item.media_type === "image" && (
                <div className="my-3 rounded-xl overflow-hidden border border-zinc-200 shadow-sm relative h-72 w-full bg-zinc-50">
                  <Image
                    src={item.media_url}
                    alt="Lesson visual aid"
                    fill
                    sizes="(max-w-768px) 100vw, 768px"
                    className="object-cover"
                    priority={
                      item.content_order === 1 || item.content_order === 2
                    }
                  />
                </div>
              )}

              {/* Dynamic Text Node Element Rendering */}
              {text && (
                <div className="text-left">
                  {isQuote ? (
                    <blockquote className="border-l-4 border-indigo-500 pl-4 py-1 my-2 bg-zinc-50/50 pr-2 rounded-r-md">
                      <p className="text-zinc-800 font-medium italic text-base leading-relaxed">
                        {text}
                      </p>
                    </blockquote>
                  ) : (
                    <ReactMarkdown
                      components={{
                        h3: ({ node, ...props }) => (
                          <h3
                            className="font-bold text-zinc-800 text-xl tracking-tight mt-5 mb-2 first:mt-0"
                            {...props}
                          />
                        ),
                        p: ({ node, ...props }) => (
                          <p
                            className="text-zinc-600 text-base leading-relaxed mb-3 last:mb-0"
                            {...props}
                          />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul
                            className="space-y-2 pl-1 my-3 list-none"
                            {...props}
                          />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="flex items-start gap-3 text-sm text-zinc-600 font-medium">
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400 mt-2" />
                            <span className="flex-1">{props.children}</span>
                          </li>
                        ),
                      }}
                    >
                      {text}
                    </ReactMarkdown>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
